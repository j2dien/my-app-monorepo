import {
  describe,
  expect,
  test,
} from "bun:test";

import { Hono } from "hono";

import { healthRoute} from '../../../modules/health/health.route'

const app = new Hono().route("/health", healthRoute)

describe("GET /api/v1/health", () => {
  test("returns application health", async () => {
    const response = await app.request(
      "/health",
    );

    expect(response.status).toBe(200);

    const body = await response.json() as {
      status: string;
    };

    expect(body.status).toBe("ok");
  });
});
