import { z } from "zod";

export const DiagramDataSchema = z
	.object({
		renderType: z.enum(["svg", "dagre"]),
		svgContent: z.string().optional(),
		nodes: z
			.array(
				z.object({
					id: z.string(),
					label: z.string(),
				})
			)
			.optional(),
		edges: z
			.array(
				z.object({
					from: z.string(),
					to: z.string(),
					label: z.string().optional(),
				})
			)
			.optional(),
	})
	.refine(
		(data) =>
			(data.renderType === "svg" && typeof data.svgContent === "string") ||
			(data.renderType === "dagre" && Array.isArray(data.nodes) && Array.isArray(data.edges)),
		"diagramData must include svgContent for svg or nodes/edges for dagre"
	);

export const QuestionSchema = z.object({
	id: z.number().int().positive(),
	text: z.string().min(1),
	type: z.enum(["MCQ", "short", "long", "diagram", "numerical", "truefalse"]),
	difficulty: z.enum(["easy", "moderate", "hard"]),
	marks: z.number().positive(),
	options: z.array(z.string()).optional().nullable(),
	answer: z.string().optional().nullable(),
	imageUrl: z.string().optional().nullable(),
	diagramData: DiagramDataSchema.optional().nullable(),
});

export const AssessmentSectionSchema = z.object({
	id: z.string().min(1),
	title: z.string().min(1),
	questionTypeName: z.string().min(1),
	instruction: z.string().min(1),
	questions: z.array(QuestionSchema).min(1),
});

export const AssessmentSchema = z.object({
	title: z.string().min(1),
	schoolName: z.string().min(1),
	subject: z.string().min(1),
	className: z.string().min(1),
	board: z.string().min(1),
	timeAllowed: z.number().positive(),
	totalMarks: z.number().positive(),
	totalQuestions: z.number().positive(),
	instructions: z.string().min(1),
	sections: z.array(AssessmentSectionSchema).min(1),
});

export type Assessment = z.infer<typeof AssessmentSchema>;
