import "dotenv/config";
import { z } from "zod";

const serverEnvSchema = z.object({
  PORT: z.coerce.number().int().positive().default(4000),
  FRONTEND_ORIGIN: z.string().trim().url().optional(),
});

const geminiEnvSchema = z.object({
  GEMINI_API_KEY: z.string().trim().min(1).default("AIzaSyBfNp8kzMgCpwS5LnansQ8yqs9L6N9Wknw"),
  GEMINI_MODEL: z.string().trim().min(1).default("gemini-2.0-flash"),
});

export function getServerEnv() {
  return serverEnvSchema.parse(process.env);
}

export function getGeminiEnv() {
  const envWithCompatKey = {
    ...process.env,
    GEMINI_API_KEY: process.env.GEMINI_API_KEY ?? process.env.GOOGLE_API_KEY ?? process.env.GEMINI_KEY,
  };

  return geminiEnvSchema.parse(envWithCompatKey);
}
