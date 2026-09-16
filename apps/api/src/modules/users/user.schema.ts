import { z } from "zod";

export {
  createUserSchema,
  updateUserSchema
} from "@app/contracts/users"

export type {
  CreateUserInput,
  UpdateUserInput
} from "@app/contracts/users"

export const userIdParamSchema = z.object({
  id: z.uuid(),
});

