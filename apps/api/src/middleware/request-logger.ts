import { createMiddleware } from "hono/factory";

export const requestLogger = createMiddleware(async (c, next) => {
  const startedAt = performance.now();

  await next();

  const durationMs = performance.now() - startedAt;

  console.log(
    JSON.stringify({
      level: "info",
      type: "request",
      requestId: c.get("requestId"),
      method: c.req.method,
      path: c.req.path,
      status: c.res.status,
      durationMs: Number(durationMs.toFixed(2)),
    }),
  );
});
