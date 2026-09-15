import { z } from "zod";

export const createUserSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Name is required")
    .max(100, "Name must be at most 100 characters"),

  email: z.string().trim().toLowerCase().pipe(z.email("Email is invalid")),
});

export const userIdParamSchema = z.object({
  id: z.uuid(),
});

export type CreateUserInput = z.infer<typeof createUserSchema>;
