import { drizzle } from "drizzle-orm/bun-sql";

import { appEnv } from "../config/env";
import * as schema from "./schema";

export const db = drizzle({
  connection: {
    url: appEnv.DATABASE_URL,
  },
  schema,
});
