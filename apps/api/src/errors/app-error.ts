import type { ApiErrorDetails } from "@app/contracts";
import type { ContentfulStatusCode } from "hono/utils/http-status";

export class AppError extends Error {
  readonly code: string;
  readonly status: ContentfulStatusCode;
  readonly details?: ApiErrorDetails | undefined;

  constructor(code: string, message: string, status: ContentfulStatusCode, details?: ApiErrorDetails) {
    super(message);

    this.name = "AppError";
    this.code = code;
    this.status = status;
    this.details = details;
  }
}
