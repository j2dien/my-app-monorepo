import { AppError } from "../../errors/app-error";
import { isPostgresUniqueViolation } from "../../lib/postgres-error";

import { userRepository } from "./user.repository";

import type {
  CreateUserInput,
  UpdateUserInput,
  UsersQuery,
} from "./user.schema";

type UserRepository = typeof userRepository;

export function createUserService(repository: UserRepository) {
  return {
    async getUsers(query: UsersQuery) {
      const result = await repository.findMany(query);

      return {
        items: result.items,

        pagination: {
          page: query.page,
          pageSize: query.pageSize,
          total: result.total,

          totalPages: Math.ceil(result.total / query.pageSize),
        },
      };
    },

    async getUser(id: string) {
      const user = await repository.findById(id);

      if (!user) {
        throw new AppError("USER_NOT_FOUND", "User not found", 404);
      }

      return user;
    },

    async createUser(input: CreateUserInput) {
      const existing = await repository.findByEmail(input.email);

      if (existing) {
        throw new AppError(
          "EMAIL_ALREADY_EXISTS",
          "Email already registered",
          409,
        );
      }

      try {
        return await repository.create(input);
      } catch (error) {
        if (isPostgresUniqueViolation(error)) {
          throw new AppError(
            "EMAIL_ALREADY_EXISTS",
            "Email already registered",
            409,
          );
        }

        throw error;
      }
    },

    async updateUser(id: string, input: UpdateUserInput) {
      try {
        const user = await repository.update(id, input);

        if (!user) {
          throw new AppError("USER_NOT_FOUND", "User not found", 404);
        }

        return user;
      } catch (error) {
        if (isPostgresUniqueViolation(error)) {
          throw new AppError(
            "EMAIL_ALREADY_EXISTS",
            "Email already registered",
            409,
          );
        }

        throw error;
      }
    },

    async deleteUser(id: string) {
      const user = await repository.delete(id);

      if (!user) {
        throw new AppError("USER_NOT_FOUND", "User not found", 404);
      }
    },
  };
}

export const userService = createUserService(userRepository);
