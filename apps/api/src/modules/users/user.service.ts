import { AppError } from "../../errors/app-error";
import { isPostgresUniqueViolation } from "../../lib/postgres-error";

import { userRepository } from "./user.repository";

import type { CreateUserInput } from "./user.schema";

export const userService = {
  async getUsers() {
    return userRepository.findAll();
  },

  async getUser(id: string) {
    const user = await userRepository.findById(id);

    if (!user) {
      throw new AppError("USER_NOT_FOUND", "User not found", 404);
    }

    return user;
  },

  async createUser(input: CreateUserInput) {
    const existing = await userRepository.findByEmail(input.email);

    if (existing) {
      throw new AppError(
        "EMAIL_ALREADY_EXISTS",
        "Email already registered",
        409,
      );
    }

    try {
      return await userRepository.create(input);
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
};
