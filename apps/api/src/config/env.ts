import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z
    .enum(["development", "test", "production"])
    .default("development"),

  PORT: z.coerce.number().int().positive().default(3000),

  CORS_ORIGIN: z.url().default("http://localhost:5173"),

  DATABASE_URL: z.string().min(1),
});

const parsed = envSchema.safeParse(Bun.env);

if (!parsed.success) {
  console.error(
    JSON.stringify(
      {
        level: "fatal",
        message: "Invalid environment configuration",
        errors: z.treeifyError(parsed.error),
      },
      null,
      2,
    ),
  );

  process.exit(1);
}

export const env = parsed.data;
