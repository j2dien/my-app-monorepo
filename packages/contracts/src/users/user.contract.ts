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

export const createUserInputSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Name is required")
    .max(100, "Name must be at most 100 characters"),

  email: z.email("Invalid email address"),
});

export const updateUserInputSchema = createUserInputSchema
  .partial()
  .refine(
    (input) => Object.keys(input).length > 0,
    {
      message: "At least one field must be provided",
    },
  );

export const usersQuerySchema = z.object({
  page: z.coerce
    .number()
    .int()
    .positive()
    .default(1),

  pageSize: z.coerce
    .number()
    .int()
    .min(1)
    .max(100)
    .default(10),

  search: z
    .string()
    .trim()
    .min(1)
    .optional(),

  sortBy: z
    .enum(["name", "email", "createdAt"])
    .default("createdAt"),

  sortOrder: z
    .enum(["asc", "desc"])
    .default("desc"),
});

export const userResponseSchema =
  createDataResponseSchema(userSchema);

export const usersResponseSchema =
  createPaginatedResponseSchema(userSchema);

export type User =
  z.infer<typeof userSchema>;

export type CreateUserInput =
  z.infer<typeof createUserInputSchema>;

export type UpdateUserInput =
  z.infer<typeof updateUserInputSchema>;

export type UsersQueryParams =
  z.infer<typeof usersQuerySchema>;

export type UserResponse =
  z.infer<typeof userResponseSchema>;

export type UsersResponse =
  z.infer<typeof usersResponseSchema>;