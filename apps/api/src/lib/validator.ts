import { zValidator } from "@hono/zod-validator";
import type { ZodType } from "zod";

export function validator<
  T extends ZodType,
  Target extends "json" | "param" | "query",
>(target: Target, schema: T) {
  return zValidator(target, schema, (result, c) => {
    if (!result.success) {
      const fields = Object.fromEntries(
        result.error.issues.map((issue) => [
          issue.path.join("."),
          issue.message,
        ]),
      );

      return c.json(
        {
          error: {
            code: "VALIDATION_ERROR",
            message: "Invalid request",
            fields,
            requestId: c.get("requestId"),
          },
        },
        400,
      );
    }
  });
}