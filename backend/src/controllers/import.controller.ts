import type { Request, Response } from "express";
import { prepareImportBatches } from "../services/import-preparation.service";

export function prepareImportController(request: Request, response: Response) {
  const result = prepareImportBatches(request.body);
  response.status(200).json(result);
}
