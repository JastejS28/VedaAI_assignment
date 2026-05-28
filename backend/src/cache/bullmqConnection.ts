import type { ConnectionOptions } from "bullmq";

/**
 * Parse a Redis URL into a BullMQ-compatible connection options object.
 * Supports both plain redis:// and TLS rediss:// (Upstash) URLs.
 */
export function getBullMQConnection(): ConnectionOptions {
	const url = process.env.REDIS_URL;
	if (!url) {
		throw new Error("REDIS_URL is not set for BullMQ");
	}

	try {
		const parsed = new URL(url);
		const useTls = parsed.protocol === "rediss:";

		return {
			host: parsed.hostname,
			port: Number(parsed.port) || 6379,
			password: parsed.password || undefined,
			db: parsed.pathname ? Number(parsed.pathname.slice(1)) || 0 : 0,
			maxRetriesPerRequest: null,
			...(useTls ? { tls: {} } : {}),
		};
	} catch {
		throw new Error(`Invalid REDIS_URL format: ${url}`);
	}
}
