import { app } from "./app";
import { appEnv } from "./config/env";

Bun.serve({
  fetch: app.fetch,
});

export default {
  port: appEnv.PORT,
  fetch: app.fetch,
};
