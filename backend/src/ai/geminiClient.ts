import { GoogleGenerativeAI } from "@google/generative-ai";

export interface GeminiRequest {
	system: string;
	user: string;
}

export async function generateWithGemini(request: GeminiRequest): Promise<string> {
	const apiKey = process.env.GEMINI_API_KEY;

	if (!apiKey) {
		throw new Error("GEMINI_API_KEY is not set");
	}

	const client = new GoogleGenerativeAI(apiKey);
	const model = client.getGenerativeModel({
		model: "gemini-2.5-flash",
		systemInstruction: request.system,
	});

	const response = await model.generateContent(request.user);
	return response.response.text();
}
