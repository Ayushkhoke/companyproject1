import { GoogleGenerativeAI } from "@google/generative-ai";
import {
  aiNormalizedImportSchema,
  normalizeImportRequestSchema,
  normalizedImportResponseSchema,
  type AiNormalizedImport,
  type NormalizedBatchResult,
  type NormalizedImportResponse,
  type NormalizeImportRequest,
  type RawCsvRow,
} from "@groweasy/shared";
import { getGeminiEnv } from "../config/env";
import { buildImportNormalizationPrompt } from "../prompts/import-normalization.prompt";
import { extractJsonPayload } from "../utils/extract-json";

export interface NormalizeImportBatchInput {
  batchNumber: number;
  records: RawCsvRow[];
}

export type NormalizeImportInput = NormalizeImportRequest;

const generationConfig = {
  temperature: 0,
  responseMimeType: "application/json",
};

function buildUserPrompt(batch: NormalizeImportBatchInput) {
  return [
    `Batch number: ${batch.batchNumber}`,
    "Normalize each row to GrowEasy CRM format.",
    "Return only JSON matching { \"records\": [...] }.",
    "Input rows:",
    JSON.stringify(batch.records, null, 2),
  ].join("\n");
}

function parseModelResponse(text: string) {
  const extracted = extractJsonPayload(text);
  const parsed = JSON.parse(extracted) as unknown;
  return aiNormalizedImportSchema.parse(parsed);
}

export async function normalizeImportBatches(input: NormalizeImportInput): Promise<NormalizedImportResponse> {
  const geminiEnv = getGeminiEnv();
  const genAI = new GoogleGenerativeAI(geminiEnv.GEMINI_API_KEY);
  const model = genAI.getGenerativeModel({
    model: geminiEnv.GEMINI_MODEL,
    generationConfig,
    systemInstruction: buildImportNormalizationPrompt(),
  });

  const normalizedRecords: AiNormalizedImport["records"] = [];
  const normalizedBatches: NormalizedBatchResult[] = [];

  for (const batch of input.batches) {
    try {
      const result = await model.generateContent(buildUserPrompt(batch));
      const responseText = result.response.text();
      const parsed = parseModelResponse(responseText);

      normalizedRecords.push(...parsed.records);
      normalizedBatches.push({
        batchNumber: batch.batchNumber,
        records: parsed.records,
        rawJson: responseText.trim(),
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unexpected Gemini API error.";
      const normalizedMessage = message.includes("429") || message.includes("quota") || message.includes("Too Many Requests")
        ? "Gemini quota exhausted or rate limited. Please wait a moment, reduce the number of requests, or upgrade your Gemini plan."
        : `Gemini normalization failed for batch ${batch.batchNumber}: ${message}`;
      throw new Error(normalizedMessage);
    }
  }

  const response: NormalizedImportResponse = {
    batchSize: input.batchSize,
    batchCount: input.batches.length,
    records: normalizedRecords,
    skippedRecordCount: 0,
    batches: normalizedBatches,
  };

  const trimmedFileName = input.fileName?.trim();
  if (trimmedFileName) {
    response.fileName = trimmedFileName;
  }

  return normalizedImportResponseSchema.parse(response);
}
