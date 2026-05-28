import {
	Schema,
	model,
	type Model,
	type HydratedDocument,
	type Types,
} from "mongoose";

export interface QuestionTypeRow {
	type: string;
	count: number;
	marksEach: number;
}

export interface Assignment {
	userId: Types.ObjectId;
	title: string;
	schoolName: string;
	className: string;
	subject: string;
	chapters: string;
	board: string;
	timeAllowed: number;
	dueDate: Date;
	questionTypes: QuestionTypeRow[];
	additionalInstructions: string;
	fileRef: string | null;
	fileType: string | null;
	status: "pending" | "processing" | "completed" | "failed";
	createdAt?: Date;
	updatedAt?: Date;
}

export type AssignmentDocument = HydratedDocument<Assignment>;

const questionTypeSchema = new Schema<QuestionTypeRow>(
	{
		type: { type: String, required: true },
		count: { type: Number, required: true },
		marksEach: { type: Number, required: true },
	},
	{ _id: false }
);

const assignmentSchema = new Schema<Assignment>(
	{
		userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
		title: { type: String, required: true },
		schoolName: { type: String, required: true },
		className: { type: String, required: true },
		subject: { type: String, required: true },
		chapters: { type: String, required: true },
		board: { type: String, required: true },
		timeAllowed: { type: Number, required: true },
		dueDate: { type: Date, required: true },
		questionTypes: { type: [questionTypeSchema], required: true },
		additionalInstructions: { type: String, default: "" },
		fileRef: { type: String, default: null },
		fileType: { type: String, default: null },
		status: {
			type: String,
			enum: ["pending", "processing", "completed", "failed"],
			default: "pending",
		},
	},
	{ timestamps: true }
);

export const AssignmentModel: Model<Assignment> = model<Assignment>(
	"Assignment",
	assignmentSchema
);
