import {
  afterAll,
  beforeEach,
  describe,
  expect,
  test,
} from "bun:test";

import { sql } from "drizzle-orm";

import { app } from "@/app";
import { db } from "@/db";
import { users } from "@/db/schema/users";
import {
  insertTestUser,
} from '../helpers/user-fixture'
import {
  parseJson,
} from '../helpers/response'
import type {
  CreateUserResponse,
  ApiErrorResponse,
  UsersListResponse,
  UserResponse,
} from '../helpers/api-types'


describe("users API", () => {
  beforeEach(async () => {
    await db.delete(users);
  });

  afterAll(async () => {
    await db.delete(users);
  });

  test("GET /api/v1/users returns paginated users", async () => {
    await db.insert(users).values([
      {
        name: "John Doe",
        email: "john@example.com",
      },
      {
        name: "Jane Doe",
        email: "jane@example.com",
      },
    ]);

    const response = await app.request(
      "/api/v1/users?page=1&pageSize=20",
    );

    expect(response.status).toBe(200);

    const body = await parseJson<UsersListResponse>(response)

    expect(body).toMatchObject({
      pagination: {
        page: 1,
        pageSize: 20,
        total: 2,
        totalPages: 1,
      },
    });

    expect(body.data).toHaveLength(2);

    expect(
      body.data.map(
        (user: {
          name: string;
          email: string;
        }) => ({
          name: user.name,
          email: user.email,
        }),
      ),
    ).toEqual(
      expect.arrayContaining([
        {
          name: "John Doe",
          email: "john@example.com",
        },
        {
          name: "Jane Doe",
          email: "jane@example.com",
        },
      ]),
    );
  });

  test("GET /api/v1/users respects page and pageSize", async () => {
    await db.insert(users).values(
      Array.from(
        {
          length: 25,
        },
        (_, index) => ({
          name: `User ${index + 1}`,
          email: `user${index + 1}@example.com`,
        }),
      ),
    );

    const response = await app.request(
      "/api/v1/users?page=2&pageSize=10",
    );

    expect(response.status).toBe(200);

   const body = await parseJson<UsersListResponse>(response)

    expect(body.pagination).toEqual({
      page: 2,
      pageSize: 10,
      total: 25,
      totalPages: 3,
    });

    expect(body.data).toHaveLength(10);
  });

  test("GET /api/v1/users filters users by search", async () => {
    await db.insert(users).values([
      {
        name: "John Doe",
        email: "john@example.com",
      },
      {
        name: "Jane Doe",
        email: "jane@example.com",
      },
      {
        name: "Alice Smith",
        email: "alice@example.com",
      },
    ]);

    const response = await app.request(
      "/api/v1/users?search=john&page=1&pageSize=20",
    );

    expect(response.status).toBe(200);

    const body = await parseJson<UsersListResponse>(response)

    expect(body.data).toHaveLength(1);

    expect(body.data[0]).toMatchObject({
      name: "John Doe",
      email: "john@example.com",
    });

    expect(body.pagination).toEqual({
      page: 1,
      pageSize: 20,
      total: 1,
      totalPages: 1,
    });
  });

  test("GET /api/v1/users/:id returns user detail", async () => {
    const createdUser =
      await insertTestUser()

    if (!createdUser) {
      throw new Error("Failed to create test user");
    }

    const response = await app.request(
      `/api/v1/users/${createdUser.id}`,
    );

    expect(response.status).toBe(200);

    const body = await parseJson<UserResponse>(response);

    expect(body.data).toMatchObject({
      id: createdUser.id,
      name: "John Doe",
      email: "john@example.com",
    });

    expect(body.data.createdAt).toBeDefined();
    expect(body.data.updatedAt).toBeDefined();
  });

  test("GET /api/v1/users/:id returns USER_NOT_FOUND", async () => {
    const userId =
      "11111111-1111-4111-8111-111111111111";

    const response = await app.request(
      `/api/v1/users/${userId}`,
    );

    expect(response.status).toBe(404);

    const body = await parseJson<ApiErrorResponse>(response);

    expect(body.error).toMatchObject({
      code: "USER_NOT_FOUND",
      message: "User not found",
    });

    expect(body.error.requestId).toBeDefined();
  });

  test("POST /api/v1/users creates a user", async () => {
    const response = await app.request(
      "/api/v1/users",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: "John Doe",
          email: "john@example.com",
        }),
      },
    );

    expect(response.status).toBe(201);

    const body = await parseJson<UserResponse>(response);

    expect(body.data).toMatchObject({
      name: "John Doe",
      email: "john@example.com",
    });

    expect(body.data.id).toBeDefined();
    expect(body.data.createdAt).toBeDefined();
    expect(body.data.updatedAt).toBeDefined();

    const storedUsers = await db
      .select()
      .from(users);

    expect(storedUsers).toHaveLength(1);

    const [storedUser] = storedUsers;

    if (!storedUser) {
      throw new Error(
        "Expected created user in database",
      );
    }

    expect(storedUser).toMatchObject({
      name: "John Doe",
      email: "john@example.com",
    });
  });

  test("POST /api/v1/users normalizes input", async () => {
    const response = await app.request(
      "/api/v1/users",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: "  John Doe  ",
          email: "  JOHN@EXAMPLE.COM  ",
        }),
      },
    );

    expect(response.status).toBe(201);

    const body = await parseJson<CreateUserResponse>(response);

    expect(body.data).toMatchObject({
      name: "John Doe",
      email: "john@example.com",
    });
  });

  test("POST /api/v1/users rejects invalid payload", async () => {
    const response = await app.request(
      "/api/v1/users",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: "",
          email: "not-an-email",
        }),
      },
    );

    expect(response.status).toBe(400);

    const body = await parseJson<ApiErrorResponse>(response);

    expect(body.error.code).toBeDefined();
    expect(body.error.requestId).toBeDefined();

    expect(body.error.fields).toBeDefined();
  });

  test("POST /api/v1/users returns EMAIL_ALREADY_EXISTS for duplicate email", async () => {
    await db.insert(users).values({
      name: "Existing User",
      email: "john@example.com",
    });

    const response = await app.request(
      "/api/v1/users",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: "John Doe",
          email: "john@example.com",
        }),
      },
    );

    expect(response.status).toBe(409);

    const body = await parseJson<ApiErrorResponse>(response);

    expect(body.error).toMatchObject({
      code: "EMAIL_ALREADY_EXISTS",
      message: "Email already registered",
    });

    expect(body.error.requestId).toBeDefined();

  });

  test("PATCH /api/v1/users/:id updates a user", async () => {
    const createdUser =
      await insertTestUser()

    if (!createdUser) {
      throw new Error(
        "Failed to create test user",
      );
    }

    const response = await app.request(
      `/api/v1/users/${createdUser.id}`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: "John Smith",
          email: "john.smith@example.com",
        }),
      },
    );

    expect(response.status).toBe(200);

    const body = await parseJson<UserResponse>(response);

    expect(body.data).toMatchObject({
      id: createdUser.id,
      name: "John Smith",
      email: "john.smith@example.com",
    });

    const storedUsers = await db
      .select()
      .from(users);

    expect(storedUsers).toHaveLength(1);

    const [storedUser] = storedUsers;

    if (!storedUser) {
      throw new Error(
        "Expected updated user in database",
      );
    }

    expect(storedUser).toMatchObject({
      id: createdUser.id,
      name: "John Smith",
      email: "john.smith@example.com",
    });
  });

  test("PATCH /api/v1/users/:id returns EMAIL_ALREADY_EXISTS for duplicate email", async () => {
    const john =
      await insertTestUser({
        name: 'John Doe',
        email: 'john@example.com',
      })

    await insertTestUser({
      name: 'Jane Doe',
      email: 'jane@example.com',
    })

    if (!john) {
      throw new Error(
        "Failed to create John test user",
      );
    }

    const response = await app.request(
      `/api/v1/users/${john.id}`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: "John Doe",
          email: "jane@example.com",
        }),
      },
    );

    expect(response.status).toBe(409);

    const body = await parseJson<ApiErrorResponse>(response);

    expect(body.error).toMatchObject({
      code: "EMAIL_ALREADY_EXISTS",
      message: "Email already registered",
    });

    expect(
      body.error.requestId,
    ).toBeDefined();

    const storedUsers = await db
      .select()
      .from(users);

    const storedJohn =
      storedUsers.find(
        (user) =>
          user.id === john.id,
      );

    if (!storedJohn) {
      throw new Error(
        "Expected John to remain in database",
      );
    }

    expect(storedJohn).toMatchObject({
      name: "John Doe",
      email: "john@example.com",
    });
  });

  test("PATCH /api/v1/users/:id returns USER_NOT_FOUND", async () => {
    const userId =
      "11111111-1111-4111-8111-111111111111";

    const response = await app.request(
      `/api/v1/users/${userId}`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: "John Smith",
          email: "john.smith@example.com",
        }),
      },
    );

    expect(response.status).toBe(404);

    const body = await parseJson<ApiErrorResponse>(response);

    expect(body.error).toMatchObject({
      code: "USER_NOT_FOUND",
      message: "User not found",
    });

    expect(
      body.error.requestId,
    ).toBeDefined();
  });

  test(
    'DELETE /api/v1/users/:id deletes a user',
    async () => {
      const createdUser =
        await insertTestUser()

      if (!createdUser) {
        throw new Error(
          'Failed to create test user',
        )
      }

      const response = await app.request(
        `/api/v1/users/${createdUser.id}`,
        {
          method: 'DELETE',
        },
      )

      expect(response.status).toBe(204)

      const remainingUsers = await db
        .select()
        .from(users)

      expect(remainingUsers).toHaveLength(0)
    },
  )

  test(
    'DELETE /api/v1/users/:id returns USER_NOT_FOUND',
    async () => {
      const userId =
        '11111111-1111-4111-8111-111111111111'

      const response = await app.request(
        `/api/v1/users/${userId}`,
        {
          method: 'DELETE',
        },
      )

      expect(response.status).toBe(404)

      const body = await parseJson<ApiErrorResponse>(response)

      expect(body.error).toMatchObject({
        code: 'USER_NOT_FOUND',
        message: 'User not found',
      })

      expect(
        body.error.requestId,
      ).toBeDefined()
    },
  )

  test(
    'GET /api/v1/users sorts users by name ascending',
    async () => {
      await db.insert(users).values([
        {
          name: 'Charlie',
          email: 'charlie@example.com',
        },
        {
          name: 'Alice',
          email: 'alice@example.com',
        },
        {
          name: 'Bob',
          email: 'bob@example.com',
        },
      ])

      const response = await app.request(
        '/api/v1/users?page=1&pageSize=20&sortBy=name&sortOrder=asc',
      )

      expect(response.status).toBe(200)

      const body = await parseJson<UsersListResponse>(response)

      expect(
        body.data.map(
          (user) => user.name,
        ),
      ).toEqual([
        'Alice',
        'Bob',
        'Charlie',
      ])
    },
  )

  test(
    'GET /api/v1/users sorts users by name descending',
    async () => {
      await db.insert(users).values([
        {
          name: 'Charlie',
          email: 'charlie@example.com',
        },
        {
          name: 'Alice',
          email: 'alice@example.com',
        },
        {
          name: 'Bob',
          email: 'bob@example.com',
        },
      ])

      const response = await app.request(
        '/api/v1/users?page=1&pageSize=20&sortBy=name&sortOrder=desc',
      )

      expect(response.status).toBe(200)

      const body = await parseJson<UsersListResponse>(response)

      expect(
        body.data.map(
          (user) => user.name,
        ),
      ).toEqual([
        'Charlie',
        'Bob',
        'Alice',
      ])
    },
  )

  test(
    'GET /api/v1/users rejects invalid sortBy',
    async () => {
      const response = await app.request(
        '/api/v1/users?sortBy=invalid',
      )

      expect(response.status).toBe(400)

      const body = await parseJson<ApiErrorResponse>(response)

      expect(
        body.error.code,
      ).toBeDefined()

      expect(
        body.error.requestId,
      ).toBeDefined()
    },
  )

  test(
    'GET /api/v1/users rejects invalid page',
    async () => {
      const response = await app.request(
        '/api/v1/users?page=0',
      )

      expect(response.status).toBe(400)
    },
  )

  test(
    'GET /api/v1/users rejects invalid pageSize',
    async () => {
      const response = await app.request(
        '/api/v1/users?pageSize=999',
      )

      expect(response.status).toBe(400)
    },
  )

  test(
    'GET /api/v1/users uses default pagination and sorting',
    async () => {
      await db.insert(users).values({
        name: 'John Doe',
        email: 'john@example.com',
      })

      const response = await app.request(
        '/api/v1/users',
      )

      expect(response.status).toBe(200)

      const body = await parseJson<UsersListResponse>(response)

      expect(body.pagination).toMatchObject({
        page: 1,
        pageSize: 20,
      })
    },
  )
});
