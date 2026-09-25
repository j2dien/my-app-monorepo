import { Hono } from "hono";
import { sql } from "drizzle-orm";

import { db } from "../../db";

export const readinessRoute =
  new Hono().get("/", async (c) => {
    try {
      await db.execute(
        sql`select 1`,
      );

      return c.json(
        {
          status: "ready",
        },
        200,
      );
    } catch {
      return c.json(
        {
          status: "not_ready",
        },
        503,
      );
    }
  });