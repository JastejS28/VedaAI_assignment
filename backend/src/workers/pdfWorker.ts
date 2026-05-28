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

function buildDagreSvg(
	diagramData: {
		nodes?: Array<{ id: string; label: string }>;
		edges?: Array<{ from: string; to: string; label?: string }>;
	},
	markerId: string
): string {
	const nodes = Array.isArray(diagramData.nodes) ? diagramData.nodes : [];
	const edges = Array.isArray(diagramData.edges) ? diagramData.edges : [];
	if (nodes.length === 0) {
		return "";
	}

	const boxWidth = 200;
	const boxHeight = 46;
	const horizontalGap = 44;
	const verticalGap = 30;
	const width = boxWidth * 2 + horizontalGap + 24;
	const height = Math.max(nodes.length, 1) * (boxHeight + verticalGap) + 24;

	const positions = new Map<string, { x: number; y: number; label: string }>();
	nodes.forEach((node, index) => {
		const isLeft = index % 2 === 0;
		const row = Math.floor(index / 2);
		positions.set(node.id, {
			label: node.label,
			x: isLeft ? 12 : 12 + boxWidth + horizontalGap,
			y: 12 + row * (boxHeight + verticalGap),
		});
	});

	const edgeLines = edges
		.map((edge, index) => {
			const from = positions.get(edge.from);
			const to = positions.get(edge.to);
			if (!from || !to) {
				return "";
			}

			const startX = from.x + boxWidth / 2;
			const startY = from.y + boxHeight;
			const endX = to.x + boxWidth / 2;
			const endY = to.y;
			const labelX = (startX + endX) / 2;
			const labelY = (startY + endY) / 2 - 8;
			const edgeKey = `${escapeHtml(edge.from)}-${escapeHtml(edge.to)}-${index}`;

			return `
				<g data-edge="${edgeKey}">
					<line
						x1="${startX}"
						y1="${startY}"
						x2="${endX}"
						y2="${endY}"
						stroke="#6B7280"
						stroke-width="1.5"
						marker-end="url(#${markerId})"
					/>
					${
						edge.label
							? `<text x="${labelX}" y="${labelY}" text-anchor="middle" font-size="11" fill="#4B5563">${escapeHtml(edge.label)}</text>`
							: ""
					}
				</g>
			`;
		})
		.join("");

	const nodeBoxes = nodes
		.map((node) => {
			const position = positions.get(node.id);
			if (!position) {
				return "";
			}
			return `
				<g data-node="${escapeHtml(node.id)}">
					<rect
						x="${position.x}"
						y="${position.y}"
						width="${boxWidth}"
						height="${boxHeight}"
						rx="6"
						fill="#FFFFFF"
						stroke="#9CA3AF"
					/>
					<text
						x="${position.x + boxWidth / 2}"
						y="${position.y + boxHeight / 2 + 4}"
						text-anchor="middle"
						font-size="11"
						fill="#111827"
					>${escapeHtml(position.label)}</text>
				</g>
			`;
		})
		.join("");

	return `
		<svg viewBox="0 0 ${width} ${height}" class="diagram-svg">
			<defs>
				<marker id="${markerId}" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto">
					<polygon points="0 0, 8 3, 0 6" fill="#6B7280" />
				</marker>
			</defs>
			${edgeLines}
			${nodeBoxes}
		</svg>
	`;
}

function buildDiagramHtml(
	question: Assessment["sections"][number]["questions"][number],
	sectionId: string
): string {
	if (question.imageUrl) {
		return `<img src="${escapeHtml(question.imageUrl)}" alt="Question diagram" class="diagram-image" />`;
	}

	if (question.diagramData?.renderType === "svg" && question.diagramData.svgContent) {
		return `<div class="diagram-wrap">${question.diagramData.svgContent}</div>`;
	}

	if (question.diagramData?.renderType === "dagre") {
		const markerId = `arrow-${escapeHtml(sectionId)}-${question.id}`;
		const svg = buildDagreSvg(question.diagramData, markerId);
		if (svg) {
			return `<div class="diagram-wrap">${svg}</div>`;
		}
	}

	return "";
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
					const diagram = buildDiagramHtml(question, section.id);

					return `
						<div class="question">
							<div class="question-row">
								<span class="q-number">${question.id}.</span>
								<span class="q-text">${badge} ${escapeHtml(question.text)}</span>
								${marksTag}
							</div>
							${options}
							${diagram}
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
					.diagram-wrap { margin-top: 8px; margin-left: 30px; border: 1px solid #E5E7EB; background: #F9FAFB; border-radius: 8px; padding: 8px; }
					.diagram-image { margin-top: 8px; margin-left: 30px; max-width: calc(100% - 30px); border: 1px solid #E5E7EB; border-radius: 8px; }
					.diagram-svg { width: 100%; height: auto; display: block; }
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
