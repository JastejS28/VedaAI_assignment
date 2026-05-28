import { Worker } from "bullmq";
import os from "os";
import path from "path";
import fs from "fs";
import puppeteer from "puppeteer";
import { GeneratedPaperModel } from "../db/models/GeneratedPaper";
import { redisClient, redisReady } from "../cache/redis";
import { getBullMQConnection } from "../cache/bullmqConnection";
import { AssessmentSchema, type Assessment } from "../ai/zodSchemas";
import { emitToJob } from "../websocket/wsServer";

interface PdfJobPayload {
	assignmentId: string;
	userId: string;
	jobId?: string;
}

function escapeHtml(text: string): string {
	return text
		.replace(/&/g, "&amp;")
		.replace(/</g, "&lt;")
		.replace(/>/g, "&gt;")
		.replace(/"/g, "&quot;");
}

function getDifficultyStyle(difficulty: string): string {
	switch (difficulty) {
		case "easy":
			return "background:#dcfce7;color:#166534;";
		case "moderate":
			return "background:#fff7ed;color:#9a3412;";
		case "hard":
			return "background:#fef2f2;color:#991b1b;";
		default:
			return "background:#f3f4f6;color:#374151;";
	}
}

function buildExamHtml(paper: Assessment): string {
	const sectionHtml = paper.sections
		.map((section) => {
			const questions = section.questions
				.map((question) => {
					const badge = `<span class="badge" style="${getDifficultyStyle(question.difficulty)}">${question.difficulty}</span>`;
					const marksTag = `<span class="q-marks">[${question.marks} Mark${question.marks > 1 ? "s" : ""}]</span>`;

					const options = question.options
						? `<div class="options">${question.options
								.map(
									(opt, idx) =>
										`<div>(${String.fromCharCode(97 + idx)}) ${escapeHtml(opt)}</div>`
								)
								.join("")}</div>`
						: "";

					return `
						<div class="question">
							<div class="question-row">
								<span class="q-number">${question.id}.</span>
								<span class="q-text">${badge} ${escapeHtml(question.text)}</span>
								${marksTag}
							</div>
							${options}
						</div>
					`;
				})
				.join("");

			return `
				<section class="section">
					<div class="section-title">${escapeHtml(section.title)}</div>
					<div class="section-type">${escapeHtml(section.questionTypeName)}</div>
					<div class="section-instruction">${escapeHtml(section.instruction)}</div>
					${questions}
				</section>
			`;
		})
		.join("");

	const allQuestions = paper.sections.flatMap((s) => s.questions);
	const answerKeyHtml = allQuestions
		.map(
			(q) =>
				`<div class="answer-item">${q.id}. ${escapeHtml(q.answer ?? "Answer not provided")}</div>`
		)
		.join("");

	return `
		<!doctype html>
		<html>
			<head>
				<meta charset="utf-8" />
				<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
				<style>
					* { box-sizing: border-box; margin: 0; padding: 0; }
					body { font-family: 'Inter', Arial, sans-serif; margin: 0; padding: 0; color: #111111; font-size: 13px; line-height: 1.5; }
					.paper { padding: 0; }
					.center { text-align: center; }
					.heading { font-size: 22px; font-weight: 700; margin-bottom: 4px; }
					.sub { font-size: 14px; margin-top: 2px; color: #333; }
					.row { display: flex; justify-content: space-between; font-size: 13px; margin-top: 12px; }
					.divider { height: 1px; background: #D1D5DB; margin: 12px 0; }
					.info { font-size: 12px; margin-top: 6px; }
					.section { margin-top: 20px; page-break-inside: avoid; }
					.section-title { font-weight: 700; font-size: 16px; text-align: center; margin-bottom: 2px; }
					.section-type { font-weight: 500; font-size: 13px; text-align: center; color: #444; }
					.section-instruction { font-style: italic; font-size: 12px; text-align: center; color: #6B6B6B; margin-bottom: 10px; }
					.question { font-size: 13px; margin-bottom: 10px; page-break-inside: avoid; }
					.question-row { display: flex; gap: 6px; align-items: flex-start; }
					.q-number { font-weight: 600; min-width: 24px; }
					.q-text { flex: 1; }
					.q-marks { color: #6B6B6B; font-size: 12px; white-space: nowrap; margin-left: 8px; }
					.badge { display: inline-block; font-size: 10px; padding: 1px 6px; border-radius: 4px; font-weight: 500; margin-right: 4px; vertical-align: middle; }
					.options { display: grid; grid-template-columns: 1fr 1fr; gap: 4px 16px; font-size: 12px; margin-left: 30px; margin-top: 4px; }
					.end { text-align: center; font-weight: 700; font-size: 13px; margin-top: 24px; padding: 8px 0; border-top: 1px solid #D1D5DB; border-bottom: 1px solid #D1D5DB; }
					.answer-section { margin-top: 24px; border-top: 2px solid #D1D5DB; padding-top: 12px; }
					.answer-heading { font-weight: 700; font-size: 14px; margin-bottom: 8px; }
					.answer-item { font-size: 12px; margin-bottom: 4px; }
				</style>
			</head>
			<body>
				<div class="paper">
					<div class="center heading">${escapeHtml(paper.schoolName)}</div>
					<div class="center sub">Subject: ${escapeHtml(paper.subject)} | Class: ${escapeHtml(paper.className)}</div>
					<div class="divider"></div>
					<div class="row">
						<span>Time Allowed: ${paper.timeAllowed} minutes</span>
						<span>Maximum Marks: ${paper.totalMarks}</span>
					</div>
					<div class="divider"></div>
					<div class="info">${escapeHtml(paper.instructions)}</div>
					<div class="info" style="margin-top:8px;">Name: ____________________&nbsp;&nbsp;&nbsp;&nbsp;Roll Number: ____________</div>
					<div class="info">Class/Section: __________</div>
					<div class="divider"></div>
					${sectionHtml}
					<div class="end">End of Question Paper</div>
					<div class="answer-section">
						<div class="answer-heading">Answer Key</div>
						${answerKeyHtml}
					</div>
				</div>
			</body>
		</html>
	`;
}

async function loadPaper(assignmentId: string, userId: string): Promise<Assessment> {
	if (redisClient && redisReady) {
		const cached = await redisClient.get(`paper:${assignmentId}`);
		if (cached) {
			return AssessmentSchema.parse(JSON.parse(cached));
		}
	}

	const paperDoc = await GeneratedPaperModel.findOne({ assignmentId, userId })
		.sort({ version: -1 })
		.lean();

	if (!paperDoc) {
		throw new Error("Paper not found");
	}

	return AssessmentSchema.parse(paperDoc.paper);
}

export const pdfWorker = new Worker<PdfJobPayload>(
	"pdf-export",
	async (job) => {
		const { assignmentId, userId } = job.data;
		const workerJobId = job.id ? String(job.id) : null;

		const paper = await loadPaper(assignmentId, userId);
		const html = buildExamHtml(paper);

		const browser = await puppeteer.launch({
			headless: true,
			args: ["--no-sandbox", "--disable-setuid-sandbox"],
		});

		try {
			const page = await browser.newPage();
			await page.setContent(html, { waitUntil: "networkidle0" });
			await page.emulateMediaType("print");

			const pdfBuffer = await page.pdf({
				format: "A4",
				printBackground: true,
				margin: { top: "15mm", right: "15mm", bottom: "15mm", left: "15mm" },
			});

			const fileName = `${assignmentId}.pdf`;
			const filePath = path.join(os.tmpdir(), fileName);
			await fs.promises.writeFile(filePath, pdfBuffer);

			// Store the file path in Redis so the download route can find it
			if (redisClient && redisReady) {
				await redisClient.set(`pdf:${assignmentId}`, filePath, "EX", 60 * 60);
			}

			// Emit pdf_ready event so frontend can stop polling immediately
			if (workerJobId) {
				emitToJob(workerJobId, {
					type: "pdf_ready",
					assignmentId,
					downloadUrl: `/api/assignments/${assignmentId}/download`,
				});
			}

			return { assignmentId, filePath };
		} finally {
			await browser.close();
		}
	},
	{
		connection: getBullMQConnection(),
		concurrency: 2,
	}
);
