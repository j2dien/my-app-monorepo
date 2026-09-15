import { eq } from "drizzle-orm";

import { db } from "../../db";
import { users } from "../../db/schema";

import type { CreateUserInput } from "./user.schema";

export const userRepository = {
  async findAll() {
    return db
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
        createdAt: users.createdAt,
        updatedAt: users.updatedAt,
      })
      .from(users);
  },

  async findById(id: string) {
    const [user] = await db
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
        createdAt: users.createdAt,
        updatedAt: users.updatedAt,
      })
      .from(users)
      .where(eq(users.id, id))
      .limit(1);

    return user ?? null;
  },

  async findByEmail(email: string) {
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    return user ?? null;
  },

  async create(input: CreateUserInput) {
    const [user] = await db.insert(users).values(input).returning({
      id: users.id,
      name: users.name,
      email: users.email,
      createdAt: users.createdAt,
      updatedAt: users.updatedAt,
    });

    if (!user) {
      throw new Error("Failed to create user");
    }

    return user;
  },
};
