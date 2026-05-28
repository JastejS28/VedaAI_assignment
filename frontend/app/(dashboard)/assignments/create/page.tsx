"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  CalendarPlus,
  Mic,
  Minus,
  Plus,
  UploadCloud,
  X,
} from "lucide-react";
import { useDropzone } from "react-dropzone";
import { apiPost, apiUpload } from "@/lib/api";
import {
  useAssignmentFormStore,
  type BoardOption,
  type QuestionTypeRow,
} from "@/stores/assignmentFormStore";
import { toast } from "sonner";

const boardOptions: BoardOption[] = ["CBSE", "ICSE", "State Board", "Other"];
const classOptions = Array.from({ length: 12 }, (_, idx) => `${idx + 1}`);

const questionTypeOptions = [
  "Multiple Choice Questions",
  "Short Answer",
  "Long Answer",
  "Diagram/Graph-Based",
  "Numerical Problems",
  "True-False",
];

const stepOneSchema = z.object({
  title: z.string().min(1, "Assignment title is required"),
  schoolName: z.string().min(1, "School name is required"),
  className: z.string().min(1, "Class is required"),
  subject: z.string().min(1, "Subject is required"),
  chapters: z.string().min(1, "Chapters are required"),
  board: z.enum(["CBSE", "ICSE", "State Board", "Other"], {
    message: "Board is required",
  }),
  timeAllowed: z
    .number({ error: "Time allowed is required" })
    .min(1, "Time allowed must be at least 1 minute"),
});

type StepOneValues = z.infer<typeof stepOneSchema>;

const questionRowSchema = z.object({
  id: z.string(),
  type: z.string().min(1),
  count: z.number().min(1),
  marksEach: z.number().min(1),
});

const stepTwoSchema = z.object({
  dueDate: z
    .string()
    .min(1, "Due date is required")
    .refine((value) => {
      const date = new Date(value);
      return !Number.isNaN(date.getTime()) && date > new Date();
    }, "Due date must be in the future"),
  questionTypes: z.array(questionRowSchema).min(1, "Add at least one question type"),
  additionalInstructions: z.string().min(1, "Instructions are required"),
});

type StepTwoValues = z.infer<typeof stepTwoSchema>;

interface UploadResponse {
  success: boolean;
  fileRef: string;
  fileType: "pdf" | "image";
}

interface CreateResponse {
  success: boolean;
  assignmentId: string;
  jobId: string;
}

function formatDateForInput(value: string): string {
  if (!value) {
    return "";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return date.toISOString().split("T")[0];
}

export default function Page(): JSX.Element {
  const router = useRouter();
  const {
    title,
    schoolName,
    className,
    subject,
    chapters,
    board,
    timeAllowed,
    dueDate,
    questionTypes,
    additionalInstructions,
    fileRef,
    fileType,
    currentStep,
    setField,
    addQuestionTypeRow,
    removeQuestionTypeRow,
    updateQuestionTypeRow,
    setFileRef,
    setCurrentStep,
    resetForm,
  } = useAssignmentFormStore();

  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const {
    register: registerStepOne,
    handleSubmit: handleSubmitStepOne,
    formState: { errors: stepOneErrors },
    setValue: setStepOneValue,
  } = useForm<StepOneValues>({
    resolver: zodResolver(stepOneSchema),
    defaultValues: {
      title,
      schoolName,
      className,
      subject,
      chapters,
      board: board || undefined,
      timeAllowed,
    },
  });

  const {
    register: registerStepTwo,
    handleSubmit: handleSubmitStepTwo,
    formState: { errors: stepTwoErrors },
    setValue: setStepTwoValue,
  } = useForm<StepTwoValues>({
    resolver: zodResolver(stepTwoSchema),
    defaultValues: {
      dueDate: formatDateForInput(dueDate),
      questionTypes,
      additionalInstructions,
    },
  });

  useEffect(() => {
    setStepOneValue("title", title);
    setStepOneValue("schoolName", schoolName);
    setStepOneValue("className", className);
    setStepOneValue("subject", subject);
    setStepOneValue("chapters", chapters);
    if (board) {
      setStepOneValue("board", board);
    }
    setStepOneValue("timeAllowed", timeAllowed);
  }, [
    title,
    schoolName,
    className,
    subject,
    chapters,
    board,
    timeAllowed,
    setStepOneValue,
  ]);

  useEffect(() => {
    setStepTwoValue("dueDate", formatDateForInput(dueDate));
    setStepTwoValue("questionTypes", questionTypes);
    setStepTwoValue("additionalInstructions", additionalInstructions);
  }, [dueDate, questionTypes, additionalInstructions, setStepTwoValue]);

  const totals = useMemo(() => {
    const totalQuestions = questionTypes.reduce((sum, row) => sum + row.count, 0);
    const totalMarks = questionTypes.reduce(
      (sum, row) => sum + row.count * row.marksEach,
      0
    );
    return { totalQuestions, totalMarks };
  }, [questionTypes]);

  const onDrop = async (acceptedFiles: File[]): Promise<void> => {
    if (acceptedFiles.length === 0) {
      return;
    }

    setUploadError(null);
    setUploading(true);

    try {
      const formData = new FormData();
      formData.append("file", acceptedFiles[0]);
      const response = await apiUpload<UploadResponse>("/api/upload", formData);
      setFileRef(response.fileRef, response.fileType);
      toast.success("File uploaded successfully");
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Upload failed";
      setUploadError(message);
      toast.error(message);
    } finally {
      setUploading(false);
    }
  };

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    multiple: false,
    accept: {
      "application/pdf": [".pdf"],
      "image/jpeg": [".jpg", ".jpeg"],
      "image/png": [".png"],
    },
    maxSize: 10 * 1024 * 1024,
  });

  const handleStepOne = (values: StepOneValues): void => {
    setField("title", values.title);
    setField("schoolName", values.schoolName);
    setField("className", values.className);
    setField("subject", values.subject);
    setField("chapters", values.chapters);
    setField("board", values.board);
    setField("timeAllowed", values.timeAllowed);
    setCurrentStep(2);
  };

  const handleStepTwo = async (values: StepTwoValues): Promise<void> => {
    setField("dueDate", values.dueDate);
    setField("questionTypes", values.questionTypes);
    setField("additionalInstructions", values.additionalInstructions);

    setSubmitting(true);
    try {
      const data = await apiPost<CreateResponse>("/api/assignments", {
        title,
        schoolName,
        className,
        subject,
        chapters,
        board,
        timeAllowed,
        dueDate: values.dueDate,
        questionTypes: values.questionTypes.map((row) => ({
          type: row.type,
          count: row.count,
          marksEach: row.marksEach,
        })),
        additionalInstructions: values.additionalInstructions,
        fileRef,
        fileType,
      });

      resetForm();
      router.push(`/assignments/${data.assignmentId}/generating?jobId=${data.jobId}`);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Failed to create assignment";
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  const updateQuestionRow = (id: string, data: Partial<QuestionTypeRow>): void => {
    updateQuestionTypeRow(id, data);
    setStepTwoValue(
      "questionTypes",
      questionTypes.map((row) => (row.id === id ? { ...row, ...data } : row))
    );
  };

  return (
    <div className="mx-auto w-full max-w-[600px]">
      <div className="text-base font-semibold text-gray-900">Create Assignment</div>
      <p className="text-[13px] text-gray-500">Set up a new assessment for your students</p>

      <div className="mt-4 rounded-2xl border border-gray-200 bg-white p-5 lg:p-8">
        {/* Step progress bar */}
        <div className="flex items-center gap-3">
          <div
            className={`h-1 flex-1 rounded-full ${
              currentStep === 1 ? "bg-gray-900" : "bg-gray-200"
            }`}
          />
          <div
            className={`h-1 flex-1 rounded-full ${
              currentStep === 2 ? "bg-gray-900" : "bg-gray-200"
            }`}
          />
        </div>

        {/* Step 1 — Assessment Context */}
        {currentStep === 1 && (
          <form className="mt-6 space-y-4" onSubmit={handleSubmitStepOne(handleStepOne)}>
            <div>
              <label className="text-sm font-medium text-gray-900">Assignment Title</label>
              <input
                className="mt-2 h-10 w-full rounded-lg border border-gray-300 px-3 text-sm"
                placeholder="Midterm Assessment"
                {...registerStepOne("title", {
                  onChange: (event) => setField("title", event.target.value),
                })}
              />
              {stepOneErrors.title && (
                <p className="mt-1 text-xs text-red-500">{stepOneErrors.title.message}</p>
              )}
            </div>

            <div>
              <label className="text-sm font-medium text-gray-900">School Name</label>
              <input
                className="mt-2 h-10 w-full rounded-lg border border-gray-300 px-3 text-sm"
                placeholder="Delhi Public School"
                {...registerStepOne("schoolName", {
                  onChange: (event) => setField("schoolName", event.target.value),
                })}
              />
              {stepOneErrors.schoolName && (
                <p className="mt-1 text-xs text-red-500">{stepOneErrors.schoolName.message}</p>
              )}
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="text-sm font-medium text-gray-900">Class / Grade</label>
                <select
                  className="mt-2 h-10 w-full rounded-lg border border-gray-300 bg-white px-3 text-sm"
                  {...registerStepOne("className", {
                    onChange: (event) => setField("className", event.target.value),
                  })}
                >
                  <option value="">Select</option>
                  {classOptions.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
                {stepOneErrors.className && (
                  <p className="mt-1 text-xs text-red-500">{stepOneErrors.className.message}</p>
                )}
              </div>

              <div>
                <label className="text-sm font-medium text-gray-900">Subject</label>
                <input
                  className="mt-2 h-10 w-full rounded-lg border border-gray-300 px-3 text-sm"
                  placeholder="Science"
                  {...registerStepOne("subject", {
                    onChange: (event) => setField("subject", event.target.value),
                  })}
                />
                {stepOneErrors.subject && (
                  <p className="mt-1 text-xs text-red-500">{stepOneErrors.subject.message}</p>
                )}
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-900">Chapters / Topics</label>
              <input
                className="mt-2 h-10 w-full rounded-lg border border-gray-300 px-3 text-sm"
                placeholder="Electricity, Magnetism"
                {...registerStepOne("chapters", {
                  onChange: (event) => setField("chapters", event.target.value),
                })}
              />
              {stepOneErrors.chapters && (
                <p className="mt-1 text-xs text-red-500">{stepOneErrors.chapters.message}</p>
              )}
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="text-sm font-medium text-gray-900">Board</label>
                <select
                  className="mt-2 h-10 w-full rounded-lg border border-gray-300 bg-white px-3 text-sm"
                  {...registerStepOne("board", {
                    onChange: (event) => setField("board", event.target.value as BoardOption),
                  })}
                >
                  <option value="">Select</option>
                  {boardOptions.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
                {stepOneErrors.board && (
                  <p className="mt-1 text-xs text-red-500">{stepOneErrors.board.message}</p>
                )}
              </div>

              <div>
                <label className="text-sm font-medium text-gray-900">Time Allowed (minutes)</label>
                <input
                  className="mt-2 h-10 w-full rounded-lg border border-gray-300 px-3 text-sm"
                  type="number"
                  min={1}
                  {...registerStepOne("timeAllowed", {
                    valueAsNumber: true,
                    onChange: (event) =>
                      setField("timeAllowed", Number(event.target.value)),
                  })}
                />
                {stepOneErrors.timeAllowed && (
                  <p className="mt-1 text-xs text-red-500">{stepOneErrors.timeAllowed.message}</p>
                )}
              </div>
            </div>

            <div className="flex items-center justify-end">
              <button
                type="submit"
                className="rounded-lg bg-gray-900 px-6 py-2 text-sm font-medium text-white"
              >
                Next →
              </button>
            </div>
          </form>
        )}

        {/* Step 2 — Question Configuration */}
        {currentStep === 2 && (
          <form className="mt-6 space-y-5" onSubmit={handleSubmitStepTwo(handleStepTwo)}>
            {/* File upload zone */}
            <div>
              <div
                {...getRootProps()}
                className="rounded-xl border-2 border-dashed border-gray-300 bg-gray-50 px-6 py-8 text-center"
              >
                <input {...getInputProps()} />
                <UploadCloud className="mx-auto mb-3 text-gray-400" size={28} />
                <p className="text-sm font-medium text-gray-900">
                  Choose a file or drag & drop it here
                </p>
                <p className="mt-1 text-xs text-gray-400">JPEG, PNG, PDF up to 10MB</p>
                <button
                  type="button"
                  className="mt-4 rounded-md border border-gray-300 px-4 py-2 text-[13px] font-medium text-gray-900"
                >
                  Browse Files
                </button>
              </div>
              <p className="mt-2 text-center text-xs text-gray-400">
                Upload images of your preferred document/image
              </p>
              {uploadError && <p className="mt-2 text-xs text-red-500">{uploadError}</p>}
              {uploading && <p className="mt-2 text-xs text-gray-500">Uploading...</p>}
              {fileRef && (
                <p className="mt-2 text-xs text-gray-500">
                  Uploaded: {fileType?.toUpperCase()} file
                </p>
              )}
            </div>

            {/* Due date */}
            <div>
              <label className="text-sm font-medium text-gray-900">Due Date</label>
              <div className="relative mt-2">
                <input
                  className="h-10 w-full rounded-lg border border-gray-300 px-3 text-sm"
                  placeholder="DD-MM-YYYY"
                  type="date"
                  {...registerStepTwo("dueDate", {
                    onChange: (event) => setField("dueDate", event.target.value),
                  })}
                />
                <CalendarPlus
                  size={16}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                />
              </div>
              {stepTwoErrors.dueDate && (
                <p className="mt-1 text-xs text-red-500">{stepTwoErrors.dueDate.message}</p>
              )}
            </div>

            {/* Question type builder */}
            <div>
              <div className="mb-2 flex items-center justify-between text-[13px] font-medium text-gray-500">
                <span>Question Type</span>
                <div className="flex items-center gap-8">
                  <span>No. of Questions</span>
                  <span>Marks</span>
                </div>
              </div>

              <div className="space-y-3">
                {questionTypes.map((row) => (
                  <div
                    key={row.id}
                    className="flex flex-col gap-3 rounded-lg border border-gray-200 bg-white px-3 py-2 md:flex-row md:items-center"
                  >
                    <select
                      className="h-10 w-full rounded-lg border border-gray-200 bg-white px-3 text-sm md:flex-1"
                      value={row.type}
                      onChange={(event) => updateQuestionRow(row.id, { type: event.target.value })}
                    >
                      {questionTypeOptions.map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>

                    <button
                      type="button"
                      className="text-gray-400"
                      onClick={() => removeQuestionTypeRow(row.id)}
                    >
                      <X size={16} />
                    </button>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        className="h-7 w-7 rounded border border-gray-200 text-gray-900"
                        onClick={() =>
                          updateQuestionRow(row.id, { count: Math.max(1, row.count - 1) })
                        }
                      >
                        <Minus size={14} className="mx-auto" />
                      </button>
                      <span className="min-w-[24px] text-center text-sm font-medium text-gray-900">
                        {row.count}
                      </span>
                      <button
                        type="button"
                        className="h-7 w-7 rounded border border-gray-200 text-gray-900"
                        onClick={() => updateQuestionRow(row.id, { count: row.count + 1 })}
                      >
                        <Plus size={14} className="mx-auto" />
                      </button>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        className="h-7 w-7 rounded border border-gray-200 text-gray-900"
                        onClick={() =>
                          updateQuestionRow(row.id, {
                            marksEach: Math.max(1, row.marksEach - 1),
                          })
                        }
                      >
                        <Minus size={14} className="mx-auto" />
                      </button>
                      <span className="min-w-[24px] text-center text-sm font-medium text-gray-900">
                        {row.marksEach}
                      </span>
                      <button
                        type="button"
                        className="h-7 w-7 rounded border border-gray-200 text-gray-900"
                        onClick={() => updateQuestionRow(row.id, { marksEach: row.marksEach + 1 })}
                      >
                        <Plus size={14} className="mx-auto" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {stepTwoErrors.questionTypes && (
                <p className="mt-2 text-xs text-red-500">
                  {stepTwoErrors.questionTypes.message}
                </p>
              )}

              <button
                type="button"
                className="mt-3 flex items-center gap-2 text-sm font-medium text-gray-900"
                onClick={addQuestionTypeRow}
              >
                <span className="flex h-7 w-7 items-center justify-center rounded-full border border-gray-900">
                  <Plus size={14} />
                </span>
                Add Question Type
              </button>
            </div>

            {/* Totals */}
            <div className="text-right text-[13px] text-gray-900">
              <div>
                Total Questions : <span className="font-semibold">{totals.totalQuestions}</span>
              </div>
              <div>
                Total Marks : <span className="font-semibold">{totals.totalMarks}</span>
              </div>
            </div>

            {/* Additional instructions */}
            <div>
              <label className="text-sm font-medium text-gray-900">
                Additional Information (For better output)
              </label>
              <div className="relative mt-2">
                <textarea
                  className="min-h-[80px] w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
                  placeholder="Generate a question paper for 3 hour exam duration..."
                  {...registerStepTwo("additionalInstructions", {
                    onChange: (event) =>
                      setField("additionalInstructions", event.target.value),
                  })}
                />
                <Mic size={16} className="absolute bottom-3 right-3 text-gray-400" />
              </div>
              {stepTwoErrors.additionalInstructions && (
                <p className="mt-1 text-xs text-red-500">
                  {stepTwoErrors.additionalInstructions.message}
                </p>
              )}
            </div>

            {/* Navigation buttons */}
            <div className="flex items-center justify-between">
              <button
                type="button"
                className="rounded-lg border border-gray-300 px-6 py-2 text-sm font-medium text-gray-900"
                onClick={() => setCurrentStep(1)}
              >
                ← Previous
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="rounded-lg bg-gray-900 px-6 py-2 text-sm font-medium text-white disabled:opacity-50"
              >
                {submitting ? "Generating..." : "Generate Assessment"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
