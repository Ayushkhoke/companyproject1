import { z } from "zod";

export const allowedCrmStatuses = [
  "GOOD_LEAD_FOLLOW_UP",
  "DID_NOT_CONNECT",
  "BAD_LEAD",
  "SALE_DONE",
] as const;

export const allowedDataSources = [
  "leads_on_demand",
  "meridian_tower",
  "eden_park",
  "varah_swamy",
  "sarjapur_plots",
] as const;

export const rawCsvRowSchema = z.record(z.string());

export const preparedImportBatchSchema = z.object({
  batchNumber: z.number().int().min(1),
  records: z.array(rawCsvRowSchema),
});

export const prepareImportRequestSchema = z.object({
  fileName: z.string().trim().max(255).optional().or(z.literal("")),
  batchSize: z.coerce.number().int().min(1).max(50).optional(),
  records: z.array(rawCsvRowSchema).min(1),
});

export const preparedImportResponseSchema = z.object({
  fileName: z.string().trim().max(255).optional(),
  batchSize: z.number().int().min(1),
  receivedRecords: z.number().int().min(0),
  retainedRecords: z.number().int().min(0),
  skippedEmptyRecords: z.number().int().min(0),
  batchCount: z.number().int().min(0),
  batches: z.array(preparedImportBatchSchema),
});

export const crmImportRecordSchema = z.object({
  name: z.string().trim().max(200).optional().or(z.literal("")),
  email: z.string().trim().email().optional().or(z.literal("")),
  mobile_without_country_code: z.string().trim().min(7).max(20).optional().or(z.literal("")),
  crm_status: z.enum(allowedCrmStatuses).optional().or(z.literal("")),
  data_source: z.enum(allowedDataSources).optional().or(z.literal("")),
  crm_note: z.string().trim().max(2000).optional().or(z.literal("")),
  created_at: z
    .string()
    .datetime({ offset: true })
    .or(z.string().datetime())
    .optional()
    .or(z.literal("")),
});

export const normalizedCrmImportRecordSchema = crmImportRecordSchema.superRefine(
  (record, context) => {
    const hasEmail = Boolean(record.email?.trim());
    const hasPhone = Boolean(record.mobile_without_country_code?.trim());
    if (!hasEmail && !hasPhone) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Record must contain at least one email or phone.",
      });
    }
  }
);

export const normalizedBatchResultSchema = z.object({
  batchNumber: z.number().int().min(1),
  records: z.array(normalizedCrmImportRecordSchema),
  rawJson: z.string(),
});

export const normalizeImportRequestSchema = z.object({
  fileName: z.string().trim().max(255).optional().or(z.literal("")),
  batchSize: z.coerce.number().int().min(1).max(50),
  batches: z.array(preparedImportBatchSchema).min(1),
});

export const normalizedImportResponseSchema = z.object({
  fileName: z.string().trim().max(255).optional(),
  batchSize: z.number().int().min(1),
  batchCount: z.number().int().min(1),
  records: z.array(normalizedCrmImportRecordSchema),
  skippedRecordCount: z.number().int().min(0),
  batches: z.array(normalizedBatchResultSchema),
});

export const aiNormalizedImportSchema = z.object({
  records: z.array(normalizedCrmImportRecordSchema),
});

export type AllowedCrmStatus = (typeof allowedCrmStatuses)[number];
export type AllowedDataSource = (typeof allowedDataSources)[number];
export type RawCsvRow = z.infer<typeof rawCsvRowSchema>;
export type PreparedImportBatch = z.infer<typeof preparedImportBatchSchema>;
export type PrepareImportRequest = z.infer<typeof prepareImportRequestSchema>;
export type PreparedImportResponse = z.infer<typeof preparedImportResponseSchema>;
export type CrmImportRecord = z.infer<typeof crmImportRecordSchema>;
export type NormalizedCrmImportRecord = z.infer<typeof normalizedCrmImportRecordSchema>;
export type NormalizeImportRequest = z.infer<typeof normalizeImportRequestSchema>;
export type NormalizedBatchResult = z.infer<typeof normalizedBatchResultSchema>;
export type NormalizedImportResponse = z.infer<typeof normalizedImportResponseSchema>;
export type AiNormalizedImport = z.infer<typeof aiNormalizedImportSchema>;
