import {
  describe,
  expect,
  test,
} from "bun:test";

import { app } from "../../../app";

describe("GET /api/v1/health", () => {
  test("returns application health", async () => {
    const response = await app.request(
      "/api/v1/health",
    );

    expect(response.status).toBe(200);

    const body = await response.json() as {
      status: string;
    };

    expect(body.status).toBe("ok");
  });
});
