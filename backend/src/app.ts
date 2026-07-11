import express from "express";
import { getServerEnv } from "./config/env";
import { importRoutes } from "./routes/import.routes";
import { normalizationRoutes } from "./routes/normalization.routes";
import { errorHandler } from "./middlewares/error-handler";

export function createApp() {
  const app = express();
  const serverEnv = getServerEnv();
  const allowedOrigin = serverEnv.FRONTEND_ORIGIN ?? "http://localhost:3000";

  app.use((request, response, next) => {
    response.setHeader("Access-Control-Allow-Origin", allowedOrigin);
    response.setHeader("Vary", "Origin");
    response.setHeader("Access-Control-Allow-Methods", "GET,POST,PUT,PATCH,DELETE,OPTIONS");
    response.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
    response.setHeader("Access-Control-Max-Age", "86400");

    if (request.method === "OPTIONS") {
      response.sendStatus(204);
      return;
    }

    next();
  });

  app.use(express.json({ limit: "10mb" }));

  app.get("/health", (_request, response) => {
    response.status(200).json({ status: "ok" });
  });

  app.use(importRoutes);
  app.use(normalizationRoutes);
  app.use(errorHandler);

  return app;
}
