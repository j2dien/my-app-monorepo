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

type UserDto = {
  id: string;
  name: string;
  email: string;
  createdAt: string;
  updatedAt: string;
};

type UsersListResponse = {
  data: UserDto[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
};

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

    const body = await response.json() as UsersListResponse;

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
  
    const body = await response.json() as UsersListResponse;
  
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
  
    const body = await response.json() as UsersListResponse;
  
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
});