import {
  prepareImportRequestSchema,
  preparedImportResponseSchema,
  type PreparedImportResponse,
  type RawCsvRow,
} from "@groweasy/shared";
import { chunkArray } from "../utils/chunk-array";

const defaultBatchSize = 25;

function normalizeCellValue(value: string) {
  return value.trim().replace(/\s+/g, " ");
}

function normalizeRow(row: RawCsvRow): RawCsvRow {
  return Object.entries(row).reduce<RawCsvRow>((accumulator, [key, value]) => {
    accumulator[key] = normalizeCellValue(value);
    return accumulator;
  }, {});
}

function isEmptyRow(row: RawCsvRow) {
  return Object.values(row).every((value) => value.trim().length === 0);
}

export function prepareImportBatches(payload: unknown): PreparedImportResponse {
  const request = prepareImportRequestSchema.parse(payload);
  const batchSize = request.batchSize ?? defaultBatchSize;
  const normalizedRows = request.records.map(normalizeRow);
  const retainedRows = normalizedRows.filter((row) => !isEmptyRow(row));
  const batches = chunkArray(retainedRows, batchSize).map((records, index) => ({
    batchNumber: index + 1,
    records,
  }));

  const response: PreparedImportResponse = {
    batchSize,
    receivedRecords: request.records.length,
    retainedRecords: retainedRows.length,
    skippedEmptyRecords: request.records.length - retainedRows.length,
    batchCount: batches.length,
    batches,
  };

  const trimmedFileName = request.fileName?.trim();
  if (trimmedFileName) {
    response.fileName = trimmedFileName;
  }

  return preparedImportResponseSchema.parse(response);
}
