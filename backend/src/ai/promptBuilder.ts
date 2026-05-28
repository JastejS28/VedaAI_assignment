import type { QuestionTypeRow } from "../db/models/Assignment";

export interface PromptContext {
	schoolName: string;
	className: string;
	subject: string;
	chapters: string;
	board: string;
	timeAllowed: number;
	questionTypes: QuestionTypeRow[];
	additionalInstructions: string;
	extractedText?: string | null;
}

export interface PromptParts {
	system: string;
	user: string;
}

export function buildPrompt(context: PromptContext): PromptParts {
	const sections = context.questionTypes
		.map((row, index) => {
			const sectionLetter = String.fromCharCode(65 + index);
			return `- Section ${sectionLetter}: ${row.count} ${row.type} questions, ${row.marksEach} marks each`;
		})
		.join("\n");

	const system = `You are an expert educational assessment creator for Indian schools.\nYou create structured, curriculum-aligned question papers.\n\nSCHOOL CONTEXT:\n- School: ${context.schoolName}\n- Class: ${context.className}\n- Subject: ${context.subject}\n- Chapters/Topics: ${context.chapters}\n- Board: ${context.board}\n- Time Allowed: ${context.timeAllowed} minutes\n\nSTRICT RULES:\n1. Questions must be appropriate for Class ${context.className} students\n2. Vocabulary, complexity, and depth must match ${context.board} curriculum standards\n3. You must return ONLY valid JSON. No markdown, no preamble, no explanation.\n4. Follow the exact JSON schema provided.\n5. Difficulty distribution per section: 40% easy, 40% moderate, 20% hard unless instructed otherwise.\n6. MCQ options must be plausible — wrong options should not be obviously wrong.`;

	const baseText = context.extractedText
		? `\n\nBASE YOUR QUESTIONS ON THIS CONTENT:\n---\n${context.extractedText}\n---`
		: "";

	const user = `Generate a complete question paper with the following structure:\n\nSECTIONS REQUIRED:\n${sections}\n\nADDITIONAL INSTRUCTIONS: ${context.additionalInstructions}\n${baseText}\n\nRESPOND ONLY WITH THIS JSON STRUCTURE:\n{\n  "title": string,\n  "schoolName": string,\n  "subject": string,\n  "className": string,\n  "board": string,\n  "timeAllowed": number,\n  "totalMarks": number,\n  "totalQuestions": number,\n  "instructions": string,\n  "sections": [\n    {\n      "id": string,\n      "title": string,\n      "questionTypeName": string,\n      "instruction": string,\n      "questions": [\n        {\n          "id": number,\n          "text": string,\n          "type": "MCQ" | "short" | "long" | "diagram" | "numerical" | "truefalse",\n          "difficulty": "easy" | "moderate" | "hard",\n          "marks": number,\n          "options": string[],\n          "answer": string,\n          "imageUrl": string,\n          "diagramData": {\n            "renderType": "svg" | "dagre",\n            "svgContent": string,\n            "nodes": [{ "id": string, "label": string }],\n            "edges": [{ "from": string, "to": string, "label": string }]\n          }\n        }\n      ]\n    }\n  ]\n}`;

	return { system, user };
}
