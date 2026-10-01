import { z } from "zod";

import { paginationSchema } from "./pagination";

export const createDataResponseSchema = <T extends z.ZodType>(
  dataSchema: T,
) =>
  z.object({
    data: dataSchema,
  });

export const createPaginatedResponseSchema = <T extends z.ZodType>(
  itemSchema: T,
) =>
  z.object({
    data: z.array(itemSchema),
    pagination: paginationSchema,
  });
