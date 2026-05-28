import mongoose from "mongoose";

export async function connectMongo(): Promise<void> {
	const uri = process.env.MONGODB_URI;

	if (!uri) {
		console.error("MONGODB_URI is not set");
		process.exit(1);
	}

	try {
		await mongoose.connect(uri);
	} catch (error: unknown) {
		const message = error instanceof Error ? error.message : "Unknown error";
		console.error(`MongoDB connection failed: ${message}`);
		process.exit(1);
	}
}
