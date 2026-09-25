import {
  describe,
  expect,
  mock,
  test,
} from "bun:test";

import { Hono } from "hono";

const execute = mock(async () => []);

mock.module("../../../db", () => ({
  db: {
    execute,
  },
}));

const {
  readinessRoute,
} = await import(
  "../../../modules/health/readiness.route"
);

const app = new Hono().route(
  "/ready",
  readinessRoute,
);

describe("GET /ready", () => {
  test(
    "returns database ready",
    async () => {
      const response =
        await app.request("/ready");

      expect(
        response.status,
      ).toBe(200);

      const body =
        (await response.json()) as {
          status: string;
        };

      expect(
        body.status,
      ).toBe("ready");

      expect(execute)
        .toHaveBeenCalledTimes(1);
    },
  );
});