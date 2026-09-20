import { app } from "./app";
import { env } from "./config/env";

Bun.serve({
  fetch: app.fetch,
})

export default {
  port: env.PORT,
  fetch: app.fetch,
};
