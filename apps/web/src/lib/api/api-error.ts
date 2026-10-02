import {
  apiErrorSchema,
  type ApiErrorDetails,
} from "@app/contracts";

interface ErrorResponse {
  readonly status: number;
  json(): Promise<unknown>;
}

interface ApiClientErrorOptions {
  status: number;
  code: string;
  message: string;
  requestId?: string | undefined;
  details?: ApiErrorDetails | undefined;
}

export class ApiClientError extends Error {
  readonly status: number;
  readonly code: string;
  readonly requestId: string | undefined;
  readonly details: ApiErrorDetails | undefined;

  constructor({
    status,
    code,
    message,
    requestId,
    details,
  }: ApiClientErrorOptions) {
    super(message);

    this.name = "ApiClientError";
    this.status = status;
    this.code = code;
    this.requestId = requestId;
    this.details = details;
  }
}

export async function createApiError(
  response: ErrorResponse,
): Promise<ApiClientError> {
  let payload: unknown;

  try {
    payload = await response.json();
  } catch {
    return new ApiClientError({
      status: response.status,
      code: "HTTP_ERROR",
      message: `Request failed with status ${response.status}`,
    });
  }

  const parsed = apiErrorSchema.safeParse(payload);

  if (!parsed.success) {
    return new ApiClientError({
      status: response.status,
      code: "HTTP_ERROR",
      message: `Request failed with status ${response.status}`,
    });
  }

  return new ApiClientError({
    status: response.status,
    code: parsed.data.error.code,
    message: parsed.data.error.message,
    requestId: parsed.data.error.requestId,
    details: parsed.data.error.details,
  });
}