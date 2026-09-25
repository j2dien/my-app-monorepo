import { eq, asc, desc, ilike, or } from "drizzle-orm";

import { db } from "../../db";
import { users } from "../../db/schema";

import type {
  UsersQuery,
  CreateUserInput,
  UpdateUserInput,
} from "./user.schema";

export const userRepository = {
  async findMany({ page, pageSize, search, sortBy, sortOrder }: UsersQuery) {
    const offset = (page - 1) * pageSize;

    const condition = search
      ? or(ilike(users.name, `%${search}%`), ilike(users.email, `%${search}%`))
      : undefined;

    const sortColumn = {
      name: users.name,
      email: users.email,
      createdAt: users.createdAt,
    }[sortBy];

    const sort = sortOrder === "asc" ? asc : desc;

    const [items, total] = await Promise.all([
      db
        .select({
          id: users.id,
          name: users.name,
          email: users.email,
          createdAt: users.createdAt,
          updatedAt: users.updatedAt,
        })
        .from(users)
        .where(condition)
        // primary ordering
        .orderBy(
          sort(sortColumn),

          // deterministic tie-breaker
          asc(users.id),
        )
        .limit(pageSize)
        .offset(offset),

      db.$count(users, condition),
    ]);

    return {
      items,
      total,
    };
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

  async update(id: string, input: UpdateUserInput) {
    const [user] = await db
      .update(users)
      .set({
        ...input,
        updatedAt: new Date(),
      })
      .where(eq(users.id, id))
      .returning();

    return user ?? null;
  },

  async delete(id: string) {
    const [user] = await db.delete(users).where(eq(users.id, id)).returning({
      id: users.id,
    });

    return user ?? null;
  },
};

export type UserRepository = typeof userRepository
