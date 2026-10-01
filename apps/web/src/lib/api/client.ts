import type { AppType } from "@app/api/app";
import { hc } from "hono/client";
import { apiBaseUrl } from "@/config/env";

export const api = hc<AppType>(apiBaseUrl);
