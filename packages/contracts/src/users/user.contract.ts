import { z } from "zod";

import {
  createDataResponseSchema,
  createPaginatedResponseSchema,
} from "../common/response";

export const userSchema = z.object({
  id: z.uuid(),
  name: z.string().min(1),
  email: z.email(),
  createdAt: z.iso.datetime(),
  updatedAt: z.iso.datetime(),
});

export const userResponseSchema = createDataResponseSchema(userSchema);

export const usersResponseSchema =
  createPaginatedResponseSchema(userSchema);

export type User = z.infer<typeof userSchema>;
export type UserResponse = z.infer<typeof userResponseSchema>;
export type UsersResponse = z.infer<typeof usersResponseSchema>;