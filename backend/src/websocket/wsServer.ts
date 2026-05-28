import type { Server as HttpServer } from "http";
import WebSocket, { WebSocketServer } from "ws";

export type WsMessage = Record<string, unknown> & { type: string };

const connectionMap = new Map<string, WebSocket>();

export function initWebSocketServer(server: HttpServer): void {
	const wss = new WebSocketServer({ server });

	wss.on("connection", (socket) => {
		socket.on("message", (data) => {
			try {
				const raw = typeof data === "string" ? data : data.toString();
				const parsed = JSON.parse(raw) as { type?: string; jobId?: string };

				if (parsed.type === "subscribe" && parsed.jobId) {
					connectionMap.set(parsed.jobId, socket);
				}
			} catch {
				// Ignore malformed messages.
			}
		});

		socket.on("close", () => {
			for (const [jobId, ws] of connectionMap.entries()) {
				if (ws === socket) {
					connectionMap.delete(jobId);
				}
			}
		});
	});
}

export function emitToJob(jobId: string, message: WsMessage): void {
	const socket = connectionMap.get(jobId);

	if (!socket || socket.readyState !== WebSocket.OPEN) {
		return;
	}

	socket.send(JSON.stringify(message));
}
