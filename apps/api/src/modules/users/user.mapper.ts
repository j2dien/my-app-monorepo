import type { User } from "@app/contracts";
import { users } from "@/db/schema/users"

type UserRecord = typeof users.$inferSelect

export function toUserDto(user: UserRecord): User {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    createdAt: user.createdAt.toISOString(),
    updatedAt: user.updatedAt.toISOString(),
  };
}