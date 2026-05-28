import axios, { type AxiosError } from "axios";

interface ApiErrorPayload {
	error?: {
		message?: string;
	};
}

const apiClient = axios.create({
	baseURL: process.env.NEXT_PUBLIC_API_URL,
	withCredentials: true,
});

function resolveErrorMessage(error: unknown): string {
	if (axios.isAxiosError(error)) {
		const axiosError = error as AxiosError<ApiErrorPayload>;
		const message = axiosError.response?.data?.error?.message;
		return message ?? axiosError.message;
	}

	return error instanceof Error ? error.message : "Unexpected error";
}

export async function apiPost<T>(url: string, data: unknown): Promise<T> {
	try {
		const response = await apiClient.post<T>(url, data);
		return response.data;
	} catch (error: unknown) {
		throw new Error(resolveErrorMessage(error));
	}
}

export async function apiGet<T>(url: string): Promise<T> {
	try {
		const response = await apiClient.get<T>(url);
		return response.data;
	} catch (error: unknown) {
		throw new Error(resolveErrorMessage(error));
	}
}

export async function apiUpload<T>(url: string, formData: FormData): Promise<T> {
	try {
		const response = await apiClient.post<T>(url, formData, {
			headers: { "Content-Type": "multipart/form-data" },
		});
		return response.data;
	} catch (error: unknown) {
		throw new Error(resolveErrorMessage(error));
	}
}
