import { Worker } from "bullmq";
import fs from "fs";
import path from "path";
import pdfParse from "pdf-parse";
import { AssignmentModel } from "../db/models/Assignment";
import { GeneratedPaperModel } from "../db/models/GeneratedPaper";
import { redisClient, redisReady } from "../cache/redis";
import { getBullMQConnection } from "../cache/bullmqConnection";
import { buildPrompt, type PromptContext } from "../ai/promptBuilder";
import { generateWithGemini } from "../ai/geminiClient";
import { parseJsonResponse } from "../ai/responseParser";
import { AssessmentSchema, type Assessment } from "../ai/zodSchemas";
import { emitToJob } from "../websocket/wsServer";

interface GenerationJobPayload {
	assignmentId: string;
	userId: string;
	title: string;
	schoolName: string;
	className: string;
	subject: string;
	chapters: string;
	board: string;
	timeAllowed: number;
	questionTypes: {
		type: string;
		count: number;
		marksEach: number;
	}[];
	additionalInstructions: string;
	fileRef: string | null;
	fileType: "pdf" | "image" | null;
}

async function loadPdfText(fileRef: string): Promise<string> {
	const isUrl = /^https?:\/\//i.test(fileRef);

	if (isUrl && typeof fetch !== "undefined") {
		const response = await fetch(fileRef);
		if (!response.ok) {
			throw new Error("Failed to fetch PDF file");
		}
		const buffer = Buffer.from(await response.arrayBuffer());
		const result = await pdfParse(buffer);
		return result.text.slice(0, 15000);
	}

	const filePath = fileRef.startsWith("/")
		? fileRef
		: path.resolve(process.env.UPLOAD_DIR ?? "uploads", fileRef);

	const buffer = await fs.promises.readFile(filePath);
	const result = await pdfParse(buffer);
	return result.text.slice(0, 15000);
}

function buildMockAssessment(payload: GenerationJobPayload): Assessment {
	const questionRows = payload.questionTypes.map((row, index) => {
		const sectionId = String.fromCharCode(65 + index);
		return {
			id: sectionId,
			title: `Section ${sectionId}`,
			questionTypeName: row.type,
			instruction: `Attempt all questions. Each carries ${row.marksEach} marks.`,
			questions: Array.from({ length: row.count }).map((_, qIndex) => ({
				id: qIndex + 1 + index * 10,
				text: `Sample question ${qIndex + 1} for ${row.type}.`,
				type: "short" as const,
				difficulty: "easy" as const,
				marks: row.marksEach,
				answer: "Sample answer.",
			})),
		};
	});

	const totalQuestions = payload.questionTypes.reduce(
		(sum, row) => sum + row.count,
		0
	);
	const totalMarks = payload.questionTypes.reduce(
		(sum, row) => sum + row.count * row.marksEach,
		0
	);

	return {
		title: payload.title,
		schoolName: payload.schoolName,
		subject: payload.subject,
		className: payload.className,
		board: payload.board,
		timeAllowed: payload.timeAllowed,
		totalMarks,
		totalQuestions,
		instructions: payload.additionalInstructions,
		sections: questionRows,
	};
}

async function generateAssessment(payload: GenerationJobPayload): Promise<Assessment> {
	const useMock = process.env.USE_MOCK_GEMINI !== "false";
	console.log(`[generateAssessment] USE_MOCK_GEMINI=${process.env.USE_MOCK_GEMINI}, useMock=${useMock}`);
	if (useMock) {
		console.log("[generateAssessment] Using MOCK data (not calling Gemini API)");
		return buildMockAssessment(payload);
	}
	console.log("[generateAssessment] Using REAL Gemini API");

	let extractedText: string | null = null;
	if (payload.fileRef && payload.fileType === "pdf") {
		extractedText = await loadPdfText(payload.fileRef);
	}

	const promptContext: PromptContext = {
		schoolName: payload.schoolName,
		className: payload.className,
		subject: payload.subject,
		chapters: payload.chapters,
		board: payload.board,
		timeAllowed: payload.timeAllowed,
		questionTypes: payload.questionTypes,
		additionalInstructions: payload.additionalInstructions,
		extractedText,
	};

	const prompt = buildPrompt(promptContext);
	const correctedUser = `${prompt.user}\n\nYour previous response was invalid JSON. Return only valid JSON matching this schema.`;

	const attempt = async (userMessage: string): Promise<Assessment> => {
		const raw = await generateWithGemini({ system: prompt.system, user: userMessage });
		const parsed = parseJsonResponse(raw);
		const validation = AssessmentSchema.safeParse(parsed);

		if (!validation.success) {
			console.error("Zod validation error:", validation.error.flatten());
			console.error("Raw Gemini response:", raw.slice(0, 2000));
			throw new Error("Invalid Gemini response");
		}

		return validation.data;
	};

	try {
		return await attempt(prompt.user);
	} catch {
		return await attempt(correctedUser);
	}
}

export const generationWorker = new Worker<GenerationJobPayload>(
	"assessment-generation",
	async (job) => {
		const payload = job.data;
		const jobId = job.id ? String(job.id) : null;

		try {
			await AssignmentModel.findByIdAndUpdate(payload.assignmentId, {
				status: "processing",
			});

			const assessment = await generateAssessment(payload);

			await GeneratedPaperModel.create({
				assignmentId: payload.assignmentId,
				userId: payload.userId,
				paper: assessment,
			});

			if (redisClient && redisReady) {
				const key = `paper:${payload.assignmentId}`;
				await redisClient.set(key, JSON.stringify(assessment), "EX", 2 * 60 * 60);
			}

			await AssignmentModel.findByIdAndUpdate(payload.assignmentId, {
				status: "completed",
			});

			if (jobId) {
				emitToJob(jobId, {
					type: "generation_complete",
					assignmentId: payload.assignmentId,
				});
			}

			return { assignmentId: payload.assignmentId };
		} catch (error: unknown) {
			await AssignmentModel.findByIdAndUpdate(payload.assignmentId, {
				status: "failed",
			});

			if (jobId) {
				emitToJob(jobId, {
					type: "generation_failed",
					error: "Generation failed. Please try again.",
				});
			}

			throw error;
		}
	},
	{
		connection: getBullMQConnection(),
		concurrency: 3,
	}
);
