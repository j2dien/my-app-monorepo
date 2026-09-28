import { z } from "zod";

const envSchema = z.object({
  VITE_API_URL: z.url(),
});

export function parseFrontendEnv(input: unknown) {
  const parsed = envSchema.safeParse(input);

  if (!parsed.success) {
    console.error("Invalid frontend environment", parsed.error);

    throw new Error("Invalid frontend environment");
  }

  return parsed.data;
}

export const env = parseFrontendEnv(import.meta.env);
