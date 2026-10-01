import { app } from "./app";
import { appEnv } from "./config/env";

const server = Bun.serve({
  port: appEnv.PORT,
  hostname: "0.0.0.0",
  fetch: app.fetch,
});

console.log(`API running at ${server.url}`);
