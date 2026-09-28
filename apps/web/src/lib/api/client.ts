import type { AppType } from "@app/api/app";
import { hc } from "hono/client";

import { env } from "../../config/env";

export const api = hc<AppType>(env.VITE_API_URL);
