import { zValidator } from "@hono/zod-validator";
import type { ApiError, ApiErrorDetails} from "@app/contracts"
import type { ZodType } from "zod";

export function validator<T extends ZodType, Target extends "json" | "param" | "query">(
  target: Target,
  schema: T,
) {
  return zValidator(target, schema, (result, c) => {
    if (result.success) {
      return;
    }

    const fields: Record<string, string[]> = {};
    const formErrors: string[] = [];

    const details: ApiErrorDetails = {
      ...(Object.keys(fields).length > 0 ? { fields } : {}),
      ...(formErrors.length > 0 ? { formErrors } : {})
    }

    return c.json(
      {
        error: {
          code: "VALIDATION_ERROR",
          message: "Invalid request",
          requestId: c.get("requestId"),
          details,
        },
      } satisfies ApiError,
      400,
    );
  });
}
