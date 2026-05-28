import Redis from "ioredis";

let redisReady = false;

function createRedisClient(): Redis | null {
	const url = process.env.REDIS_URL;

	if (!url) {
		console.warn("REDIS_URL is not set; Redis disabled");
		return null;
	}

	// ioredis accepts the full URL including rediss:// for TLS
	const client = new Redis(url, {
		maxRetriesPerRequest: null,
		// Upstash uses rediss:// which automatically enables TLS in ioredis
		tls: url.startsWith("rediss://") ? {} : undefined,
	});

	client.on("ready", () => {
		console.log("Redis connected");
		redisReady = true;
	});

	client.on("end", () => {
		redisReady = false;
	});

	client.on("error", (error: Error) => {
		console.warn(`Redis error: ${error.message}`);
	});

	return client;
}

const redisClient = createRedisClient();

export { redisClient, redisReady };
