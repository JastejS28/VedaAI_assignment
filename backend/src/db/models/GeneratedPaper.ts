import {
	Schema,
	model,
	type Model,
	type HydratedDocument,
	type Types,
} from "mongoose";

export interface GeneratedPaper {
	assignmentId: Types.ObjectId;
	userId: Types.ObjectId;
	paper: Record<string, unknown>;
	version: number;
	generatedAt: Date;
}

export type GeneratedPaperDocument = HydratedDocument<GeneratedPaper>;

const generatedPaperSchema = new Schema<GeneratedPaper>({
	assignmentId: { type: Schema.Types.ObjectId, ref: "Assignment", required: true },
	userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
	paper: { type: Schema.Types.Mixed, required: true },
	version: { type: Number, default: 1 },
	generatedAt: { type: Date, default: Date.now },
});

export const GeneratedPaperModel: Model<GeneratedPaper> = model<GeneratedPaper>(
	"GeneratedPaper",
	generatedPaperSchema
);
