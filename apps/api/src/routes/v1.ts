// src/routes/v1.ts

import { Hono } from "hono";

import { healthRoute } from "../modules/health/health.route";
import { readinessRoute } from "../modules/health/readiness.route";
import { userRoute } from "../modules/users/user.route";

export const v1 = new Hono()
  .route("/health", healthRoute)
  .route("/ready", readinessRoute)
  .route("/users", userRoute);
