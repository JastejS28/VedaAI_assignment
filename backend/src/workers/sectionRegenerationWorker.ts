import { Worker } from "bullmq";
import { AssignmentModel } from "../db/models/Assignment";
import { GeneratedPaperModel } from "../db/models/GeneratedPaper";
import { redisClient, redisReady } from "../cache/redis";
import { getBullMQConnection } from "../cache/bullmqConnection";
import { AssessmentSchema, AssessmentSectionSchema } from "../ai/zodSchemas";
import { emitToJob } from "../websocket/wsServer";

interface SectionRegenerationPayload {
	assignmentId: string;
	userId: string;
	sectionId: string;
}

function buildMockSection(
	sectionId: string,
	questionTypeName: string,
	questionIds: number[],
	marksEach: number
) {
	return {
		id: sectionId,
		title: `Section ${sectionId}`,
		questionTypeName,
		instruction: `Attempt all questions. Each carries ${marksEach} marks.`,
		questions: questionIds.map((questionId, index) => ({
			id: questionId,
			text: `Regenerated question ${index + 1}.`,
			type: "short" as const,
			difficulty: "moderate" as const,
			marks: marksEach,
			answer: "Sample answer.",
		})),
	};
}

export const sectionRegenerationWorker = new Worker<SectionRegenerationPayload>(
	"section-regeneration",
	async (job) => {
		const payload = job.data;
		const jobId = job.id ? String(job.id) : null;

		try {
			let paperData: unknown | null = null;

			if (redisClient && redisReady) {
				const cached = await redisClient.get(`paper:${payload.assignmentId}`);
				if (cached) {
					paperData = JSON.parse(cached) as unknown;
				}
			}

			if (!paperData) {
				const latestPaper = await GeneratedPaperModel.findOne({
					assignmentId: payload.assignmentId,
					userId: payload.userId,
				})
					.sort({ version: -1 })
					.lean();

				if (!latestPaper) {
					throw new Error("Paper not found");
				}

				paperData = latestPaper.paper;
			}

			const paper = AssessmentSchema.parse(paperData);
			const sectionIndex = paper.sections.findIndex(
				(section) => section.id === payload.sectionId
			);

			if (sectionIndex < 0) {
				throw new Error("Section not found");
			}

			const existingSection = paper.sections[sectionIndex];
			const newSection = buildMockSection(
				existingSection.id,
				existingSection.questionTypeName,
				existingSection.questions.map((question) => question.id),
				existingSection.questions[0]?.marks ?? 1
			);

			const validatedSection = AssessmentSectionSchema.parse(newSection);
			paper.sections[sectionIndex] = validatedSection;

			const latestVersion = await GeneratedPaperModel.findOne({
				assignmentId: payload.assignmentId,
				userId: payload.userId,
			})
				.sort({ version: -1 })
				.select({ version: 1 })
				.lean();

			const nextVersion = (latestVersion?.version ?? 1) + 1;

			await GeneratedPaperModel.create({
				assignmentId: payload.assignmentId,
				userId: payload.userId,
				paper,
				version: nextVersion,
			});

			if (redisClient && redisReady) {
				await redisClient.set(
					`paper:${payload.assignmentId}`,
					JSON.stringify(paper),
					"EX",
					2 * 60 * 60
				);
			}

			if (jobId) {
				emitToJob(jobId, {
					type: "section_updated",
					sectionId: validatedSection.id,
					section: validatedSection,
				});
			}

			return { sectionId: validatedSection.id };
		} catch (error: unknown) {
			if (jobId) {
				emitToJob(jobId, {
					type: "generation_failed",
					error: "Failed to regenerate section",
				});
			}

			throw error;
		}
	},
	{
		connection: getBullMQConnection(),
		concurrency: 5,
	}
);
