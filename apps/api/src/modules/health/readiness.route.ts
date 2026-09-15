import { sql } from "drizzle-orm";
import { Hono } from "hono";

import { db } from "../../db";

export const readinessRoute = new Hono().get("/", async (c) => {
  await db.execute(sql`select 1`);

  return c.json({
    status: "ready" as const,
    database: "ok" as const,
    timestamp: new Date().toISOString(),
  });
});
