// user.service.test.ts

import { afterEach, describe, expect, mock, test } from "bun:test";

import { AppError } from "../../errors/app-error";

const findById = mock();
const findByEmail = mock();
const findAll = mock();
const create = mock();

mock.module("./user.repository", () => ({
  userRepository: {
    findById,
    findByEmail,
    findAll,
    create,
  },
}));

const { userService } = await import("./user.service");

afterEach(() => {
  mock.clearAllMocks();
});

describe("userService", () => {
  test("getUser returns user", async () => {
    findById.mockResolvedValue({
      id: "f6ea515e-3870-4611-a49f-9dcdd61fdc0c",
      name: "John",
      email: "john@example.com",
    });

    const result = await userService.getUser(
      "f6ea515e-3870-4611-a49f-9dcdd61fdc0c",
    );

    expect(result.email).toBe("john@example.com");
  });

  test("getUser throws USER_NOT_FOUND", async () => {
    findById.mockResolvedValue(null);

    try {
      await userService.getUser("f6ea515e-3870-4611-a49f-9dcdd61fdc0c");

      throw new Error("Expected getUser to throw");
    } catch (error) {
      expect(error).toBeInstanceOf(AppError);

      expect((error as AppError).code).toBe("USER_NOT_FOUND");
    }
  });

  test("createUser rejects existing email", async () => {
    findByEmail.mockResolvedValue({
      id: "some-id",
      email: "john@example.com",
    });

    try {
      await userService.createUser({
        name: "John",
        email: "john@example.com",
      });

      throw new Error("Expected createUser to throw");
    } catch (error) {
      expect((error as AppError).code).toBe("EMAIL_ALREADY_EXISTS");
    }

    expect(create).not.toHaveBeenCalled();
  });

  test("createUser creates user", async () => {
    findByEmail.mockResolvedValue(null);

    create.mockResolvedValue({
      id: "new-id",
      name: "John",
      email: "john@example.com",
    });

    const user = await userService.createUser({
      name: "John",
      email: "john@example.com",
    });

    expect(create).toHaveBeenCalledWith({
      name: "John",
      email: "john@example.com",
    });

    expect(user.email).toBe("john@example.com");
  });
});
