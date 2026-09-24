import {
  afterAll,
  beforeEach,
  describe,
  expect,
  test,
} from 'bun:test'

import { testClient } from 'hono/testing'

import { app } from '@/app'
import { db } from '@/db'
import { users } from '@/db/schema/users'

import {
  insertTestUser,
  insertTestUsers,
} from '../helpers/user-fixture'

import {
  parseJson,
} from '../helpers/response'

import type {
  ApiErrorResponse,
  CreateUserResponse,
  UserResponse,
  UsersListResponse,
} from '../helpers/api-types'

const client = testClient(app)

describe('users API', () => {
  beforeEach(async () => {
    await db.delete(users)
  })

  afterAll(async () => {
    await db.delete(users)
  })

  describe('GET /api/v1/users', () => {
    test(
      'returns paginated users',
      async () => {
        await insertTestUsers([
          {
            name: 'John Doe',
            email: 'john@example.com',
          },
          {
            name: 'Jane Doe',
            email: 'jane@example.com',
          },
        ])

        const response =
          await client.api.v1.users.$get({
            query: {
              page: '1',
              pageSize: '20',
            },
          })

        expect(response.status).toBe(200)

        if (response.status !== 200) {
          throw new Error(
            `Expected 200, received ${response.status}`,
          )
        }

        const body =
          await response.json()

        expect(body.data).toHaveLength(2)

        expect(
          body.pagination,
        ).toMatchObject({
          page: 1,
          pageSize: 20,
          total: 2,
          totalPages: 1,
        })
      },
    )

    test(
      'respects page and pageSize',
      async () => {
        await insertTestUsers(
          Array.from(
            {
              length: 25,
            },
            (_, index) => ({
              name:
                `User ${index + 1}`,
              email:
                `user${index + 1}@example.com`,
            }),
          ),
        )

        const response =
          await client.api.v1.users.$get({
            query: {
              page: '2',
              pageSize: '10',
            },
          })

        expect(response.status).toBe(200)

        if (response.status !== 200) {
          throw new Error(
            `Expected 200, received ${response.status}`,
          )
        }

        const body =
          await response.json()

        expect(
          body.pagination,
        ).toEqual({
          page: 2,
          pageSize: 10,
          total: 25,
          totalPages: 3,
        })

        expect(
          body.data,
        ).toHaveLength(10)
      },
    )

    test(
      'filters users by search',
      async () => {
        await insertTestUsers([
          {
            name: 'John Doe',
            email: 'john@example.com',
          },
          {
            name: 'Jane Doe',
            email: 'jane@example.com',
          },
          {
            name: 'Alice Smith',
            email: 'alice@example.com',
          },
        ])

        const response =
          await client.api.v1.users.$get({
            query: {
              search: 'john',
              page: '1',
              pageSize: '20',
            },
          })

        expect(response.status).toBe(200)

        if (response.status !== 200) {
          throw new Error(
            `Expected 200, received ${response.status}`,
          )
        }

        const body =
          await response.json()

        expect(
          body.data,
        ).toHaveLength(1)

        expect(
          body.data[0],
        ).toMatchObject({
          name: 'John Doe',
          email: 'john@example.com',
        })

        expect(
          body.pagination,
        ).toEqual({
          page: 1,
          pageSize: 20,
          total: 1,
          totalPages: 1,
        })
      },
    )

    test(
      'sorts users by name ascending',
      async () => {
        await insertTestUsers([
          {
            name: 'Charlie',
            email:
              'charlie@example.com',
          },
          {
            name: 'Alice',
            email:
              'alice@example.com',
          },
          {
            name: 'Bob',
            email:
              'bob@example.com',
          },
        ])

        const response =
          await client.api.v1.users.$get({
            query: {
              page: '1',
              pageSize: '20',
              sortBy: 'name',
              sortOrder: 'asc',
            },
          })

        expect(response.status).toBe(200)

        if (response.status !== 200) {
          throw new Error(
            `Expected 200, received ${response.status}`,
          )
        }

        const body =
          await response.json()

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
      'sorts users by name descending',
      async () => {
        await insertTestUsers([
          {
            name: 'Charlie',
            email:
              'charlie@example.com',
          },
          {
            name: 'Alice',
            email:
              'alice@example.com',
          },
          {
            name: 'Bob',
            email:
              'bob@example.com',
          },
        ])

        const response =
          await client.api.v1.users.$get({
            query: {
              page: '1',
              pageSize: '20',
              sortBy: 'name',
              sortOrder: 'desc',
            },
          })

        expect(response.status).toBe(200)

        if (response.status !== 200) {
          throw new Error(
            `Expected 200, received ${response.status}`,
          )
        }

        const body =
          await response.json()

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
      'uses default pagination and sorting',
      async () => {
        await insertTestUsers([
          {
            name: 'Old User',
            email: 'old@example.com',
            createdAt: new Date(
              '2026-09-20T00:00:00.000Z',
            ),
          },
          {
            name: 'Newest User',
            email:
              'newest@example.com',
            createdAt: new Date(
              '2026-09-22T00:00:00.000Z',
            ),
          },
          {
            name: 'Middle User',
            email:
              'middle@example.com',
            createdAt: new Date(
              '2026-09-21T00:00:00.000Z',
            ),
          },
        ])

        const response =
          await client.api.v1.users.$get({
            query: {},
          })

        expect(response.status).toBe(200)

        if (response.status !== 200) {
          throw new Error(
            `Expected 200, received ${response.status}`,
          )
        }

        const body =
          await response.json()

        expect(
          body.pagination,
        ).toMatchObject({
          page: 1,
          pageSize: 20,
          total: 3,
          totalPages: 1,
        })

        expect(
          body.data.map(
            (user) => user.name,
          ),
        ).toEqual([
          'Newest User',
          'Middle User',
          'Old User',
        ])
      },
    )

    test(
      'rejects invalid sortBy',
      async () => {
        const response =
          await app.request(
            '/api/v1/users?sortBy=invalid',
          )

        expect(
          response.status,
        ).toBe(400)

        const body =
          await parseJson<ApiErrorResponse>(
            response,
          )

        expect(
          body.error.code,
        ).toBeDefined()

        expect(
          body.error.requestId,
        ).toBeDefined()
      },
    )

    test(
      'rejects invalid page',
      async () => {
        const response =
          await app.request(
            '/api/v1/users?page=0',
          )

        expect(
          response.status,
        ).toBe(400)
      },
    )

    test(
      'rejects invalid pageSize',
      async () => {
        const response =
          await app.request(
            '/api/v1/users?pageSize=999',
          )

        expect(
          response.status,
        ).toBe(400)
      },
    )
  })

  describe(
    'GET /api/v1/users/:id',
    () => {
      test(
        'returns user detail',
        async () => {
          const createdUser =
            await insertTestUser()

          const response =
            await client.api.v1.users[
              ':id'
            ].$get({
              param: {
                id: createdUser.id,
              },
            })

          expect(
            response.status,
          ).toBe(200)

          if (
            response.status !== 200
          ) {
            throw new Error(
              `Expected 200, received ${response.status}`,
            )
          }

          const body =
            await response.json()

          expect(
            body.data,
          ).toMatchObject({
            id: createdUser.id,
            name: 'John Doe',
            email:
              'john@example.com',
          })

          expect(
            body.data.createdAt,
          ).toBeDefined()

          expect(
            body.data.updatedAt,
          ).toBeDefined()
        },
      )

      test(
        'returns USER_NOT_FOUND',
        async () => {
          const userId =
            '11111111-1111-4111-8111-111111111111'

          const response =
            await app.request(
              `/api/v1/users/${userId}`,
            )

          expect(
            response.status,
          ).toBe(404)

          const body =
            await parseJson<ApiErrorResponse>(
              response,
            )

          expect(
            body.error,
          ).toMatchObject({
            code:
              'USER_NOT_FOUND',
            message:
              'User not found',
          })

          expect(
            body.error.requestId,
          ).toBeDefined()
        },
      )
    },
  )

  describe(
    'POST /api/v1/users',
    () => {
      test(
        'creates a user',
        async () => {
          const response =
            await client.api.v1.users.$post({
              json: {
                name: 'John Doe',
                email:
                  'john@example.com',
              },
            })

          expect(
            response.status,
          ).toBe(201)

          if (!response.ok) {
            throw new Error(
              await response.text(),
            )
          }

          const body =
            await response.json()

          expect(
            body.data,
          ).toMatchObject({
            name: 'John Doe',
            email:
              'john@example.com',
          })

          expect(
            body.data.id,
          ).toBeDefined()

          expect(
            body.data.createdAt,
          ).toBeDefined()

          expect(
            body.data.updatedAt,
          ).toBeDefined()

          const storedUsers =
            await db
              .select()
              .from(users)

          expect(
            storedUsers,
          ).toHaveLength(1)

          const [storedUser] =
            storedUsers

          if (!storedUser) {
            throw new Error(
              'Expected created user in database',
            )
          }

          expect(
            storedUser,
          ).toMatchObject({
            name: 'John Doe',
            email:
              'john@example.com',
          })
        },
      )

      test(
        'normalizes input',
        async () => {
          const response =
            await app.request(
              '/api/v1/users',
              {
                method: 'POST',
                headers: {
                  'Content-Type':
                    'application/json',
                },
                body: JSON.stringify({
                  name:
                    '  John Doe  ',
                  email:
                    '  JOHN@EXAMPLE.COM  ',
                }),
              },
            )

          expect(
            response.status,
          ).toBe(201)

          const body =
            await parseJson<CreateUserResponse>(
              response,
            )

          expect(
            body.data,
          ).toMatchObject({
            name: 'John Doe',
            email:
              'john@example.com',
          })
        },
      )

      test(
        'rejects invalid payload',
        async () => {
          const response =
            await app.request(
              '/api/v1/users',
              {
                method: 'POST',
                headers: {
                  'Content-Type':
                    'application/json',
                },
                body: JSON.stringify({
                  name: '',
                  email:
                    'not-an-email',
                }),
              },
            )

          expect(
            response.status,
          ).toBe(400)

          const body =
            await parseJson<ApiErrorResponse>(
              response,
            )

          expect(
            body.error.code,
          ).toBeDefined()

          expect(
            body.error.requestId,
          ).toBeDefined()

          expect(
            body.error.fields,
          ).toBeDefined()
        },
      )

      test(
        'returns EMAIL_ALREADY_EXISTS for duplicate email',
        async () => {
          await insertTestUser({
            name:
              'Existing User',
            email:
              'john@example.com',
          })

          const response =
            await app.request(
              '/api/v1/users',
              {
                method: 'POST',
                headers: {
                  'Content-Type':
                    'application/json',
                },
                body: JSON.stringify({
                  name: 'John Doe',
                  email:
                    'john@example.com',
                }),
              },
            )

          expect(
            response.status,
          ).toBe(409)

          const body =
            await parseJson<ApiErrorResponse>(
              response,
            )

          expect(
            body.error,
          ).toMatchObject({
            code:
              'EMAIL_ALREADY_EXISTS',
            message:
              'Email already registered',
          })

          expect(
            body.error.requestId,
          ).toBeDefined()

          const storedUsers =
            await db
              .select()
              .from(users)

          expect(
            storedUsers,
          ).toHaveLength(1)
        },
      )
    },
  )

  describe(
    'PATCH /api/v1/users/:id',
    () => {
      test(
        'updates a user',
        async () => {
          const createdUser =
            await insertTestUser()

          const response =
            await client.api.v1.users[
              ':id'
            ].$patch({
              param: {
                id: createdUser.id,
              },
              json: {
                name:
                  'John Smith',
                email:
                  'john.smith@example.com',
              },
            })

          expect(
            response.status,
          ).toBe(200)

          if (
            response.status !== 200
          ) {
            throw new Error(
              `Expected 200, received ${response.status}`,
            )
          }

          const body =
            await response.json()

          expect(
            body.data,
          ).toMatchObject({
            id: createdUser.id,
            name: 'John Smith',
            email:
              'john.smith@example.com',
          })

          const storedUsers =
            await db
              .select()
              .from(users)

          expect(
            storedUsers,
          ).toHaveLength(1)

          const [storedUser] =
            storedUsers

          if (!storedUser) {
            throw new Error(
              'Expected updated user in database',
            )
          }

          expect(
            storedUser,
          ).toMatchObject({
            id: createdUser.id,
            name: 'John Smith',
            email:
              'john.smith@example.com',
          })
        },
      )

      test(
        'returns EMAIL_ALREADY_EXISTS for duplicate email',
        async () => {
          const john =
            await insertTestUser({
              name: 'John Doe',
              email:
                'john@example.com',
            })

          await insertTestUser({
            name: 'Jane Doe',
            email:
              'jane@example.com',
          })

          const response =
            await app.request(
              `/api/v1/users/${john.id}`,
              {
                method: 'PATCH',
                headers: {
                  'Content-Type':
                    'application/json',
                },
                body: JSON.stringify({
                  name: 'John Doe',
                  email:
                    'jane@example.com',
                }),
              },
            )

          expect(
            response.status,
          ).toBe(409)

          const body =
            await parseJson<ApiErrorResponse>(
              response,
            )

          expect(
            body.error,
          ).toMatchObject({
            code:
              'EMAIL_ALREADY_EXISTS',
            message:
              'Email already registered',
          })

          expect(
            body.error.requestId,
          ).toBeDefined()

          const storedUsers =
            await db
              .select()
              .from(users)

          const storedJohn =
            storedUsers.find(
              (user) =>
                user.id === john.id,
            )

          if (!storedJohn) {
            throw new Error(
              'Expected John to remain in database',
            )
          }

          expect(
            storedJohn,
          ).toMatchObject({
            name: 'John Doe',
            email:
              'john@example.com',
          })
        },
      )

      test(
        'returns USER_NOT_FOUND',
        async () => {
          const userId =
            '11111111-1111-4111-8111-111111111111'

          const response =
            await app.request(
              `/api/v1/users/${userId}`,
              {
                method: 'PATCH',
                headers: {
                  'Content-Type':
                    'application/json',
                },
                body: JSON.stringify({
                  name:
                    'John Smith',
                  email:
                    'john.smith@example.com',
                }),
              },
            )

          expect(
            response.status,
          ).toBe(404)

          const body =
            await parseJson<ApiErrorResponse>(
              response,
            )

          expect(
            body.error,
          ).toMatchObject({
            code:
              'USER_NOT_FOUND',
            message:
              'User not found',
          })

          expect(
            body.error.requestId,
          ).toBeDefined()
        },
      )
    },
  )

  describe(
    'DELETE /api/v1/users/:id',
    () => {
      test(
        'deletes a user',
        async () => {
          const createdUser =
            await insertTestUser({
              name: 'John Doe',
              email:
                'john@example.com',
            })

          const response =
            await client.api.v1.users[
              ':id'
            ].$delete({
              param: {
                id: createdUser.id,
              },
            })

          expect(
            response.status,
          ).toBe(204)

          const remainingUsers =
            await db
              .select()
              .from(users)

          expect(
            remainingUsers,
          ).toHaveLength(0)
        },
      )

      test(
        'returns USER_NOT_FOUND',
        async () => {
          const userId =
            '11111111-1111-4111-8111-111111111111'

          const response =
            await app.request(
              `/api/v1/users/${userId}`,
              {
                method: 'DELETE',
              },
            )

          expect(
            response.status,
          ).toBe(404)

          const body =
            await parseJson<ApiErrorResponse>(
              response,
            )

          expect(
            body.error,
          ).toMatchObject({
            code:
              'USER_NOT_FOUND',
            message:
              'User not found',
          })

          expect(
            body.error.requestId,
          ).toBeDefined()
        },
      )
    },
  )
})