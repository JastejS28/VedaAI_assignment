import "dotenv/config";
import express from "express";
import cors from "cors";
import path from "path";
import http from "http";
import { connectMongo } from "./db/connect";
import { errorHandler } from "./middleware/errorHandler";
import { requireAuth } from "./middleware/authMiddleware";
import authRoutes from "./routes/authRoutes";
import assignmentRoutes from "./routes/assignmentRoutes";
import uploadRoutes from "./routes/uploadRoutes";
import { initWebSocketServer } from "./websocket/wsServer";
import "./workers/generationWorker";
import "./workers/sectionRegenerationWorker";
import "./workers/pdfWorker";

const app = express();
const server = http.createServer(app);

app.use(cors({
	origin: process.env.CORS_ORIGIN ?? "http://localhost:3000",
	credentials: true,
}));
app.use(express.json({ limit: "10mb" }));

app.use("/api/auth", authRoutes);
app.use("/api/assignments", requireAuth, assignmentRoutes);
app.use("/api/upload", requireAuth, uploadRoutes);
app.use(
	"/uploads",
	express.static(path.resolve(process.env.UPLOAD_DIR ?? "uploads"))
);

app.use(errorHandler);

const port = Number(process.env.PORT ?? "4000");

async function startServer(): Promise<void> {
	await connectMongo();
	initWebSocketServer(server);

	server.listen(port, () => {
		console.log(`API server listening on port ${port}`);
	});
}

startServer().catch((error: unknown) => {
	const message = error instanceof Error ? error.message : "Unknown error";
	console.error(`Server startup failed: ${message}`);
	process.exit(1);
});
