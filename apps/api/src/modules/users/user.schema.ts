import { z } from "zod";

export { createUserSchema, updateUserSchema } from "@app/contracts/users";

export type { CreateUserInput, UpdateUserInput } from "@app/contracts/users";

export const userIdParamSchema = z.object({
  id: z.uuid(),
});

export const usersQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),

  pageSize: z.coerce.number().int().min(1).max(100).default(20),

  search: z.string().trim().max(100).optional(),
});

export type UsersQuery = z.infer<typeof usersQuerySchema>;
