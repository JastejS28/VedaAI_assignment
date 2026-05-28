import { create } from "zustand";
import { persist } from "zustand/middleware";

export type BoardOption = "CBSE" | "ICSE" | "State Board" | "Other" | "";

export interface QuestionTypeRow {
	id: string;
	type: string;
	count: number;
	marksEach: number;
}

export interface AssignmentFormState {
	title: string;
	schoolName: string;
	className: string;
	subject: string;
	chapters: string;
	board: BoardOption;
	timeAllowed: number;
	dueDate: string;
	questionTypes: QuestionTypeRow[];
	additionalInstructions: string;
	fileRef: string | null;
	fileType: "pdf" | "image" | null;
	currentStep: 1 | 2;
}

export interface AssignmentFormStore extends AssignmentFormState {
	setField: <K extends keyof AssignmentFormState>(
		field: K,
		value: AssignmentFormState[K]
	) => void;
	addQuestionTypeRow: () => void;
	removeQuestionTypeRow: (id: string) => void;
	updateQuestionTypeRow: (id: string, data: Partial<QuestionTypeRow>) => void;
	setFileRef: (fileRef: string | null, fileType: "pdf" | "image" | null) => void;
	setCurrentStep: (step: 1 | 2) => void;
	resetForm: () => void;
}

const initialState: AssignmentFormState = {
	title: "",
	schoolName: "",
	className: "",
	subject: "",
	chapters: "",
	board: "",
	timeAllowed: 45,
	dueDate: "",
	questionTypes: [],
	additionalInstructions: "",
	fileRef: null,
	fileType: null,
	currentStep: 1,
};

function createRow(): QuestionTypeRow {
	const id = typeof crypto !== "undefined" && "randomUUID" in crypto
		? crypto.randomUUID()
		: `row_${Date.now()}_${Math.random().toString(16).slice(2)}`;

	return {
		id,
		type: "Multiple Choice Questions",
		count: 1,
		marksEach: 1,
	};
}

export const useAssignmentFormStore = create<AssignmentFormStore>()(
	persist(
		(set) => ({
			...initialState,
			setField: (field, value) => set({ [field]: value } as Pick<AssignmentFormState, typeof field>),
			addQuestionTypeRow: () =>
				set((state) => ({
					questionTypes: [...state.questionTypes, createRow()],
				})),
			removeQuestionTypeRow: (id) =>
				set((state) => ({
					questionTypes: state.questionTypes.filter((row) => row.id !== id),
				})),
			updateQuestionTypeRow: (id, data) =>
				set((state) => ({
					questionTypes: state.questionTypes.map((row) =>
						row.id === id ? { ...row, ...data } : row
					),
				})),
			setFileRef: (fileRef, fileType) => set({ fileRef, fileType }),
			setCurrentStep: (step) => set({ currentStep: step }),
			resetForm: () => set(initialState),
		}),
		{ name: "veda_form_draft" }
	)
);
