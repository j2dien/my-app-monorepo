import { hc } from "hono/client";

import type { AppType } from "@app/api/app";

import { env } from "../../config/env";

export const api = hc<AppType>(env.VITE_API_URL);
