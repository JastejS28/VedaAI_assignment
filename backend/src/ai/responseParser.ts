/**
 * Parse a JSON response from Gemini, handling markdown code fences,
 * stray leading/trailing text, and other common quirks.
 */
export function parseJsonResponse(raw: string): unknown {
	// 1. Strip markdown code fences
	let cleaned = raw.replace(/```json\s*/gi, "").replace(/```\s*/g, "");

	// 2. Try to extract JSON object/array from noisy responses
	//    (Gemini sometimes adds explanatory text before/after JSON)
	const objectMatch = cleaned.match(/(\{[\s\S]*\})/);
	const arrayMatch = cleaned.match(/(\[[\s\S]*\])/);

	if (objectMatch) {
		cleaned = objectMatch[1];
	} else if (arrayMatch) {
		cleaned = arrayMatch[1];
	}

	cleaned = cleaned.trim();

	try {
		return JSON.parse(cleaned) as unknown;
	} catch (parseError: unknown) {
		const message =
			parseError instanceof Error ? parseError.message : "JSON parse failed";

		// Log truncated response for debugging
		console.error(
			"[responseParser] Failed to parse Gemini response:",
			message
		);
		console.error(
			"[responseParser] Raw response (first 500 chars):",
			raw.slice(0, 500)
		);

		throw new Error(`Failed to parse AI response as JSON: ${message}`);
	}
}
