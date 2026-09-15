import { describe, expect, test } from "bun:test";

import { app } from "../../app";

describe("GET /api/v1/ready", () => {
  test("returns database ready", async () => {
    const response = await app.request("/api/v1/ready");

    expect(response.status).toBe(200);

    const body = (await response.json()) as {
      status: string;
    };

    expect(body.status).toBe("ready");
  });
});
