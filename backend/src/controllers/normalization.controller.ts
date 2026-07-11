import type { Request, Response } from "express";
import { normalizeImportBatches } from "../services/gemini-normalization.service";

export async function normalizeImportController(request: Request, response: Response) {
  const result = await normalizeImportBatches(request.body);
  response.status(200).json(result);
}
