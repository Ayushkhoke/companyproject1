import axios from "axios";
import type {
  NormalizeImportRequest,
  NormalizedImportResponse,
  PreparedImportResponse,
  PrepareImportRequest,
} from "@groweasy/shared";

const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:4000";

const apiClient = axios.create({
  baseURL: apiBaseUrl,
  headers: {
    "Content-Type": "application/json",
  },
});

function formatApiError(error: unknown) {
  if (axios.isAxiosError(error)) {
    return error.response?.data?.message ?? error.message;
  }

  return error instanceof Error ? error.message : "Unexpected API error.";
}

export async function prepareImport(payload: PrepareImportRequest): Promise<PreparedImportResponse> {
  try {
    const response = await apiClient.post<PreparedImportResponse>("/imports/prepare", payload);
    return response.data;
  } catch (error) {
    throw new Error(formatApiError(error));
  }
}

export async function normalizeImport(payload: NormalizeImportRequest): Promise<NormalizedImportResponse> {
  try {
    const response = await apiClient.post<NormalizedImportResponse>("/imports/normalize", payload);
    return response.data;
  } catch (error) {
    throw new Error(formatApiError(error));
  }
}
