import { Router } from "express";
import { normalizeImportController } from "../controllers/normalization.controller";

export const normalizationRoutes = Router();

normalizationRoutes.post("/imports/normalize", normalizeImportController);
