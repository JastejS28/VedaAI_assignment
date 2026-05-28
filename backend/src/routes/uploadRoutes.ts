import { Router } from "express";
import path from "path";
import fs from "fs";
import multer from "multer";
import { asyncHandler } from "../utils/asyncHandler";

const router = Router();

const uploadDir = path.resolve(process.env.UPLOAD_DIR ?? "uploads");

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, uploadDir);
  },
  filename: (_req, file, cb) => {
    const safeName = file.originalname.replace(/[^a-zA-Z0-9._-]/g, "_");
    cb(null, `${Date.now()}_${safeName}`);
  },
});

const maxSizeMb = Number(process.env.MAX_FILE_SIZE_MB ?? "10");

const upload = multer({
  storage,
  limits: { fileSize: maxSizeMb * 1024 * 1024 },
});

router.post(
  "/",
  upload.single("file"),
  asyncHandler(async (req, res) => {
    const file = req.file;

    if (!file) {
      res.status(400).json({
        success: false,
        error: { code: "validation_error", message: "File is required" },
      });
      return;
    }

    const isPdf = file.mimetype === "application/pdf";
    const isImage = file.mimetype.startsWith("image/");

    if (!isPdf && !isImage) {
      res.status(400).json({
        success: false,
        error: { code: "validation_error", message: "Unsupported file type" },
      });
      return;
    }

    const fileType = isPdf ? "pdf" : "image";
    const fileRef = `${req.protocol}://${req.get("host")}/uploads/${file.filename}`;

    res.status(201).json({ success: true, fileRef, fileType });
  })
);

export default router;
