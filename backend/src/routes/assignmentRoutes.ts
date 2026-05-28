import { Router, type Request, type Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { AssignmentModel } from "../db/models/Assignment";
import type { AuthRequest } from "../middleware/authMiddleware";
import { getGenerationQueue } from "../queues/generationQueue";
import { getPdfQueue } from "../queues/pdfQueue";
import { z } from "zod";

const router = Router();

// GET /api/assignments — list all assignments for the authenticated user
router.get(
  "/",
  asyncHandler(async (req: Request, res: Response) => {
    const authRequest = req as AuthRequest;
    const userId = authRequest.userId;

    if (!userId) {
      res.status(401).json({
        success: false,
        error: { code: "unauthorized", message: "Authentication required" },
      });
      return;
    }

    const assignments = await AssignmentModel.find({ userId })
      .sort({ createdAt: -1 })
      .select({ title: 1, subject: 1, className: 1, createdAt: 1, dueDate: 1, status: 1 })
      .lean();

    res.status(200).json({ success: true, assignments });
  })
);

// POST /api/assignments — create assignment and queue generation
const createAssignmentSchema = z.object({
  title: z.string().min(1),
  schoolName: z.string().min(1),
  className: z.string().min(1),
  subject: z.string().min(1),
  chapters: z.string().min(1),
  board: z.string().min(1),
  timeAllowed: z.number().positive(),
  dueDate: z.string().min(1),
  questionTypes: z
    .array(
      z.object({
        type: z.string().min(1),
        count: z.number().int().positive(),
        marksEach: z.number().positive(),
      })
    )
    .min(1),
  additionalInstructions: z.string().min(1),
  fileRef: z.string().nullable().optional(),
  fileType: z.enum(["pdf", "image"]).nullable().optional(),
});

router.post(
  "/",
  asyncHandler(async (req: Request, res: Response) => {
    const authRequest = req as AuthRequest;
    const userId = authRequest.userId;

    if (!userId) {
      res.status(401).json({
        success: false,
        error: { code: "unauthorized", message: "Authentication required" },
      });
      return;
    }

    const parsed = createAssignmentSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({
        success: false,
        error: { code: "validation_error", message: "Invalid payload" },
      });
      return;
    }

    const data = parsed.data;
    const assignment = await AssignmentModel.create({
      userId,
      title: data.title,
      schoolName: data.schoolName,
      className: data.className,
      subject: data.subject,
      chapters: data.chapters,
      board: data.board,
      timeAllowed: data.timeAllowed,
      dueDate: new Date(data.dueDate),
      questionTypes: data.questionTypes,
      additionalInstructions: data.additionalInstructions,
      fileRef: data.fileRef ?? null,
      fileType: data.fileType ?? null,
      status: "pending",
    });

    const job = await getGenerationQueue().add(
      "generate-assessment",
      {
        assignmentId: assignment.id,
        userId,
        title: data.title,
        schoolName: data.schoolName,
        className: data.className,
        subject: data.subject,
        chapters: data.chapters,
        board: data.board,
        timeAllowed: data.timeAllowed,
        questionTypes: data.questionTypes,
        additionalInstructions: data.additionalInstructions,
        fileRef: data.fileRef ?? null,
        fileType: data.fileType ?? null,
      },
      { attempts: 2, backoff: { type: "exponential", delay: 5000 } }
    );

    res.status(201).json({
      success: true,
      assignmentId: assignment.id,
      jobId: job.id,
    });
  })
);

// DELETE /api/assignments/:id — delete an assignment
router.delete(
  "/:id",
  asyncHandler(async (req: Request, res: Response) => {
    const authRequest = req as AuthRequest;
    const userId = authRequest.userId;

    if (!userId) {
      res.status(401).json({
        success: false,
        error: { code: "unauthorized", message: "Authentication required" },
      });
      return;
    }

    const assignment = await AssignmentModel.findOneAndDelete({
      _id: req.params.id,
      userId,
    });

    if (!assignment) {
      res.status(404).json({
        success: false,
        error: { code: "not_found", message: "Assignment not found" },
      });
      return;
    }

    // Invalidate caches
    const { redisClient, redisReady } = await import("../cache/redis");
    if (redisClient && redisReady) {
      await redisClient.del(`paper:${req.params.id}`);
      await redisClient.del(`user:${userId}:assignments`);
    }

    res.status(200).json({ success: true });
  })
);

// GET /api/assignments/:id/paper — fetch paper JSON (Redis cache → MongoDB fallback)
router.get(
  "/:id/paper",
  asyncHandler(async (req: Request, res: Response) => {
    const authRequest = req as AuthRequest;
    const userId = authRequest.userId;

    if (!userId) {
      res.status(401).json({
        success: false,
        error: { code: "unauthorized", message: "Authentication required" },
      });
      return;
    }

    const { redisClient, redisReady } = await import("../cache/redis");
    const cacheKey = `paper:${req.params.id}`;

    if (redisClient && redisReady) {
      const cached = await redisClient.get(cacheKey);
      if (cached) {
        res.status(200).json({ success: true, paper: JSON.parse(cached) });
        return;
      }
    }

    const { GeneratedPaperModel } = await import("../db/models/GeneratedPaper");
    const paperDoc = await GeneratedPaperModel.findOne({
      assignmentId: req.params.id,
      userId,
    })
      .sort({ version: -1 })
      .lean();

    if (!paperDoc) {
      res.status(404).json({
        success: false,
        error: { code: "not_found", message: "Paper not found" },
      });
      return;
    }

    // Write back to Redis cache
    if (redisClient && redisReady) {
      await redisClient.set(cacheKey, JSON.stringify(paperDoc.paper), "EX", 2 * 60 * 60);
    }

    res.status(200).json({ success: true, paper: paperDoc.paper });
  })
);

// GET /api/assignments/:id/status — poll for assignment generation status
router.get(
  "/:id/status",
  asyncHandler(async (req: Request, res: Response) => {
    const authRequest = req as AuthRequest;
    const userId = authRequest.userId;

    if (!userId) {
      res.status(401).json({
        success: false,
        error: { code: "unauthorized", message: "Authentication required" },
      });
      return;
    }

    const assignment = await AssignmentModel.findOne({
      _id: req.params.id,
      userId,
    })
      .select({ status: 1 })
      .lean();

    if (!assignment) {
      res.status(404).json({
        success: false,
        error: { code: "not_found", message: "Assignment not found" },
      });
      return;
    }

    res.status(200).json({ success: true, status: assignment.status });
  })
);

// POST /api/assignments/:id/regenerate — full regeneration (re-queue the job)
router.post(
  "/:id/regenerate",
  asyncHandler(async (req: Request, res: Response) => {
    const authRequest = req as AuthRequest;
    const userId = authRequest.userId;

    if (!userId) {
      res.status(401).json({
        success: false,
        error: { code: "unauthorized", message: "Authentication required" },
      });
      return;
    }

    const assignment = await AssignmentModel.findOne({
      _id: req.params.id,
      userId,
    }).lean();

    if (!assignment) {
      res.status(404).json({
        success: false,
        error: { code: "not_found", message: "Assignment not found" },
      });
      return;
    }

    const job = await getGenerationQueue().add(
      "generate-assessment",
      {
        assignmentId: assignment._id.toString(),
        userId,
        title: assignment.title,
        schoolName: assignment.schoolName,
        className: assignment.className,
        subject: assignment.subject,
        chapters: assignment.chapters,
        board: assignment.board,
        timeAllowed: assignment.timeAllowed,
        questionTypes: assignment.questionTypes,
        additionalInstructions: assignment.additionalInstructions,
        fileRef: assignment.fileRef ?? null,
        fileType: assignment.fileType ?? null,
      },
      { attempts: 2, backoff: { type: "exponential", delay: 5000 } }
    );

    await AssignmentModel.findByIdAndUpdate(assignment._id, { status: "pending" });

    // Invalidate Redis cache so old result isn't served
    const { redisClient, redisReady } = await import("../cache/redis");
    if (redisClient && redisReady) {
      await redisClient.del(`paper:${req.params.id}`);
    }

    res.status(200).json({ success: true, jobId: job.id });
  })
);

// POST /api/assignments/:id/regenerate-section — regenerate a single section
router.post(
  "/:id/regenerate-section",
  asyncHandler(async (req: Request, res: Response) => {
    const authRequest = req as AuthRequest;
    const userId = authRequest.userId;

    if (!userId) {
      res.status(401).json({
        success: false,
        error: { code: "unauthorized", message: "Authentication required" },
      });
      return;
    }

    const sectionId = typeof req.body?.sectionId === "string" ? req.body.sectionId : "";
    if (!sectionId) {
      res.status(400).json({
        success: false,
        error: { code: "validation_error", message: "sectionId is required" },
      });
      return;
    }

    const assignment = await AssignmentModel.findOne({
      _id: req.params.id,
      userId,
    }).lean();

    if (!assignment) {
      res.status(404).json({
        success: false,
        error: { code: "not_found", message: "Assignment not found" },
      });
      return;
    }

    const { getSectionRegenerationQueue } = await import(
      "../queues/sectionRegenerationQueue"
    );

    const job = await getSectionRegenerationQueue().add(
      "regenerate-section",
      {
        assignmentId: assignment._id.toString(),
        userId,
        sectionId,
      },
      { attempts: 2, backoff: { type: "fixed", delay: 3000 } }
    );

    res.status(200).json({ success: true, jobId: job.id });
  })
);

// POST /api/assignments/:id/export-pdf — queue PDF export job
router.post(
  "/:id/export-pdf",
  asyncHandler(async (req: Request, res: Response) => {
    const authRequest = req as AuthRequest;
    const userId = authRequest.userId;

    if (!userId) {
      res.status(401).json({
        success: false,
        error: { code: "unauthorized", message: "Authentication required" },
      });
      return;
    }

    const assignment = await AssignmentModel.findOne({ _id: req.params.id, userId }).lean();
    if (!assignment) {
      res.status(404).json({
        success: false,
        error: { code: "not_found", message: "Assignment not found" },
      });
      return;
    }

    const job = await getPdfQueue().add(
      "export-pdf",
      {
        assignmentId: assignment._id.toString(),
        userId,
      },
      { attempts: 2 }
    );

    res.status(202).json({ success: true, jobId: job.id });
  })
);

// GET /api/assignments/:id/download — stream PDF file to client
router.get(
  "/:id/download",
  asyncHandler(async (req: Request, res: Response) => {
    const authRequest = req as AuthRequest;
    const userId = authRequest.userId;

    if (!userId) {
      res.status(401).json({
        success: false,
        error: { code: "unauthorized", message: "Authentication required" },
      });
      return;
    }

    const assignment = await AssignmentModel.findOne({ _id: req.params.id, userId }).lean();
    if (!assignment) {
      res.status(404).json({
        success: false,
        error: { code: "not_found", message: "Assignment not found" },
      });
      return;
    }

    const { redisClient, redisReady } = await import("../cache/redis");
    const cacheKey = `pdf:${req.params.id}`;

    if (!redisClient || !redisReady) {
      res.status(404).json({
        success: false,
        error: { code: "not_ready", message: "PDF not ready yet" },
      });
      return;
    }

    const filePath = await redisClient.get(cacheKey);
    if (!filePath) {
      res.status(404).json({
        success: false,
        error: { code: "not_ready", message: "PDF not ready yet" },
      });
      return;
    }

    // Check the file actually exists on disk
    const fsModule = await import("fs");
    if (!fsModule.existsSync(filePath)) {
      await redisClient.del(cacheKey);
      res.status(404).json({
        success: false,
        error: { code: "not_ready", message: "PDF file not found" },
      });
      return;
    }

    // Build filename: {SchoolName}_{Subject}_{Class}_{Date}.pdf
    const safeSchool = assignment.schoolName.replace(/[^a-zA-Z0-9-_]/g, "_");
    const safeSubject = assignment.subject.replace(/[^a-zA-Z0-9-_]/g, "_");
    const safeClass = assignment.className.replace(/[^a-zA-Z0-9-_]/g, "_");
    const date = new Date().toISOString().split("T")[0];
    const fileName = `${safeSchool}_${safeSubject}_${safeClass}_${date}.pdf`;

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename="${fileName}"`);

    const stream = fsModule.createReadStream(filePath);
    stream.on("end", async () => {
      // Clean up: delete Redis key and temp file after download
      await redisClient.del(cacheKey);
      fsModule.unlink(filePath, () => undefined);
    });
    stream.pipe(res);
  })
);

export default router;
