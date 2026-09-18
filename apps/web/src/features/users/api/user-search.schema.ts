import { z } from "zod";

import {
  SORT_ORDERS,
  USER_PAGE_SIZES,
  USER_SORT_VALUES,
} from "./user.constants";

export const userSearchSchema = z.object({
  page: z.number().int().positive().default(1).catch(1),

  pageSize: z.literal(USER_PAGE_SIZES).default(20).catch(20),

  search: z.string().trim().max(100).optional(),

  sortBy: z.enum(USER_SORT_VALUES).default("createdAt").catch("createdAt"),

  sortOrder: z.enum(SORT_ORDERS).default("desc").catch("desc"),
});

export type UserSearch = z.infer<typeof userSearchSchema>;
