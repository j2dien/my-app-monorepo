import { z } from "zod";

const envSchema = z.object({
  VITE_API_URL: z.url(),
});

const parsed = envSchema.safeParse(import.meta.env);

if (!parsed.success) {
  console.error("Invalid frontend environment", parsed.error);

  throw new Error("Invalid frontend environment");
}

export const env = parsed.data;
