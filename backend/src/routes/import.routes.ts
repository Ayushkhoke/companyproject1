import { Router } from "express";
import { prepareImportController } from "../controllers/import.controller";

export const importRoutes = Router();

importRoutes.post("/imports/prepare", prepareImportController);
