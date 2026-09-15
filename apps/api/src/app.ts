import { Hono } from "hono";
import { cors } from "hono/cors";
import { requestId } from "hono/request-id";
import { secureHeaders } from "hono/secure-headers";

import { env } from "./config/env";
import { AppError } from "./errors/app-error";
import { requestLogger } from "./middleware/request-logger";
import { v1 } from "./routes/v1";

export const base = new Hono();

base.use("*", secureHeaders());

base.use("*", requestId());

base.use("*", requestLogger);

base.use(
  "/api/*",
  cors({
    origin: env.CORS_ORIGIN,

    allowMethods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],

    allowHeaders: ["Content-Type", "Authorization", "X-Request-Id"],

    exposeHeaders: ["X-Request-Id"],

    maxAge: 600,
  }),
);

export const app = base
  .route("/api/v1", v1)
  .notFound((c) => {
    return c.json(
      {
        error: {
          code: "NOT_FOUND",
          message: "Route not found",
          requestId: c.get("requestId"),
        },
      },
      404,
    );
  })
  .onError((error, c) => {
    const requestId = c.get("requestId");

    if (error instanceof AppError) {
      return c.json(
        {
          error: {
            code: error.code,
            message: error.message,
            requestId,
          },
        },
        error.status,
      );
    }

    console.error(
      JSON.stringify({
        level: "error",
        requestId,
        message: error.message,
        stack: env.NODE_ENV === "production" ? undefined : error.stack,
      }),
    );

    return c.json(
      {
        error: {
          code: "INTERNAL_SERVER_ERROR",
          message: "Internal server error",
          requestId,
        },
      },
      500,
    );
  });

export type AppType = typeof app;
