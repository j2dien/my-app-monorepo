import {
  afterAll,
  beforeEach,
  describe,
  expect,
  test,
} from 'bun:test'

import {
  userRepository,
} from '@/modules/users/user.repository'

import {
  cleanupDatabase,
} from '../../helpers/cleanup'

describe(
  'userRepository integration',
  () => {
    beforeEach(async () => {
      await cleanupDatabase()
    })

    afterAll(async () => {
      await cleanupDatabase()
    })

    describe('create', () => {
      test(
        'creates a user',
        async () => {
          const user =
            await userRepository.create({
              name: 'John Doe',
              email: 'john@example.com',
            })

          expect(user.id)
            .toBeString()

          expect(user.name)
            .toBe('John Doe')

          expect(user.email)
            .toBe(
              'john@example.com',
            )

          expect(
            user.createdAt,
          ).toBeInstanceOf(Date)

          expect(
            user.updatedAt,
          ).toBeInstanceOf(Date)
        },
      )

      test(
        'rejects duplicate email',
        async () => {
          await userRepository.create({
            name: 'John Doe',
            email: 'john@example.com',
          })

          expect(
            userRepository.create({
              name: 'Another John',
              email:
                'john@example.com',
            }),
          ).rejects.toThrow()
        },
      )
    })

    describe('findById', () => {
      test(
        'finds user by id',
        async () => {
          const created =
            await userRepository.create({
              name: 'John Doe',
              email:
                'john@example.com',
            })

          const user =
            await userRepository.findById(
              created.id,
            )

          expect(user)
            .toMatchObject({
              id: created.id,
              name: 'John Doe',
              email:
                'john@example.com',
            })
        },
      )

      test(
        'returns null for missing id',
        async () => {
          const user =
            await userRepository.findById(
              '550e8400-e29b-41d4-a716-446655440000',
            )

          expect(user).toBeNull()
        },
      )
    })

    describe('findByEmail', () => {
      test(
        'finds user by email',
        async () => {
          const created =
            await userRepository.create({
              name: 'Jane Doe',
              email:
                'jane@example.com',
            })

          const user =
            await userRepository.findByEmail(
              'jane@example.com',
            )

          expect(user)
            .toMatchObject({
              id: created.id,
              name: 'Jane Doe',
              email:
                'jane@example.com',
            })
        },
      )

      test(
        'returns null for missing email',
        async () => {
          const user =
            await userRepository.findByEmail(
              'missing@example.com',
            )

          expect(user).toBeNull()
        },
      )
    })

    describe('findMany', () => {
      test(
        'returns users with total',
        async () => {
          await userRepository.create({
            name: 'John Doe',
            email: 'john@example.com',
          })

          await userRepository.create({
            name: 'Jane Doe',
            email: 'jane@example.com',
          })

          const result =
            await userRepository.findMany({
              page: 1,
              pageSize: 20,
              sortBy: 'createdAt',
              sortOrder: 'desc',
            })

          expect(result.items)
            .toHaveLength(2)

          expect(result.total)
            .toBe(2)
        },
      )

      test(
        'filters users by search case-insensitively',
        async () => {
          await userRepository.create({
            name: 'John Doe',
            email: 'john@example.com',
          })

          await userRepository.create({
            name: 'Jane Doe',
            email: 'jane@example.com',
          })

          await userRepository.create({
            name: 'Alice Smith',
            email:
              'alice@example.com',
          })

          const result =
            await userRepository.findMany({
              page: 1,
              pageSize: 20,
              search: 'JOHN',
              sortBy: 'createdAt',
              sortOrder: 'desc',
            })

          expect(result.items)
            .toHaveLength(1)

          expect(
            result.items[0],
          ).toMatchObject({
            name: 'John Doe',
            email:
              'john@example.com',
          })

          expect(result.total)
            .toBe(1)
        },
      )

      test(
        'filters users by email search',
        async () => {
          await userRepository.create({
            name: 'John Doe',
            email: 'john@example.com',
          })

          await userRepository.create({
            name: 'Jane Doe',
            email: 'jane@example.com',
          })

          const result =
            await userRepository.findMany({
              page: 1,
              pageSize: 20,
              search:
                'jane@example.com',
              sortBy: 'createdAt',
              sortOrder: 'desc',
            })

          expect(result.items)
            .toHaveLength(1)

          expect(
            result.items[0],
          ).toMatchObject({
            name: 'Jane Doe',
            email:
              'jane@example.com',
          })

          expect(result.total)
            .toBe(1)
        },
      )

      test(
        'sorts users by name ascending',
        async () => {
          await userRepository.create({
            name: 'Charlie',
            email:
              'charlie@example.com',
          })

          await userRepository.create({
            name: 'Alice',
            email:
              'alice@example.com',
          })

          await userRepository.create({
            name: 'Bob',
            email:
              'bob@example.com',
          })

          const result =
            await userRepository.findMany({
              page: 1,
              pageSize: 20,
              sortBy: 'name',
              sortOrder: 'asc',
            })

          expect(
            result.items.map(
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
          await userRepository.create({
            name: 'Charlie',
            email:
              'charlie@example.com',
          })

          await userRepository.create({
            name: 'Alice',
            email:
              'alice@example.com',
          })

          await userRepository.create({
            name: 'Bob',
            email:
              'bob@example.com',
          })

          const result =
            await userRepository.findMany({
              page: 1,
              pageSize: 20,
              sortBy: 'name',
              sortOrder: 'desc',
            })

          expect(
            result.items.map(
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
        'applies pagination offset',
        async () => {
          for (
            let index = 1;
            index <= 25;
            index += 1
          ) {
            await userRepository.create({
              name: `User ${String(
                index,
              ).padStart(2, '0')}`,
              email:
                `user${index}@example.com`,
            })
          }

          const result =
            await userRepository.findMany({
              page: 2,
              pageSize: 10,
              sortBy: 'name',
              sortOrder: 'asc',
            })

          expect(result.items)
            .toHaveLength(10)

          expect(result.total)
            .toBe(25)

          expect(
            result.items[0]?.name,
          ).toBe('User 11')

          expect(
            result.items[9]?.name,
          ).toBe('User 20')
        },
      )

      test(
        'returns empty items for page beyond available results',
        async () => {
          await userRepository.create({
            name: 'John Doe',
            email: 'john@example.com',
          })

          const result =
            await userRepository.findMany({
              page: 2,
              pageSize: 20,
              sortBy: 'createdAt',
              sortOrder: 'desc',
            })

          expect(result.items)
            .toEqual([])

          expect(result.total)
            .toBe(1)
        },
      )
    })

    describe('update', () => {
      test(
        'updates a user',
        async () => {
          const created =
            await userRepository.create({
              name: 'John Doe',
              email:
                'john@example.com',
            })

          const updated =
            await userRepository.update(
              created.id,
              {
                name: 'John Smith',
                email:
                  'john.smith@example.com',
              },
            )

          expect(updated)
            .toMatchObject({
              id: created.id,
              name: 'John Smith',
              email:
                'john.smith@example.com',
            })

          const stored =
            await userRepository.findById(
              created.id,
            )

          expect(stored)
            .toMatchObject({
              id: created.id,
              name: 'John Smith',
              email:
                'john.smith@example.com',
            })
        },
      )

      test(
        'updates updatedAt',
        async () => {
          const created =
            await userRepository.create({
              name: 'John Doe',
              email:
                'john@example.com',
            })

          const updated =
            await userRepository.update(
              created.id,
              {
                name: 'John Smith',
              },
            )

          expect(updated)
            .not
            .toBeNull()

          if (!updated) {
            throw new Error(
              'Expected updated user',
            )
          }

          expect(
            updated.updatedAt
              .getTime(),
          ).toBeGreaterThanOrEqual(
            created.updatedAt.getTime(),
          )
        },
      )

      test(
        'returns null for missing user',
        async () => {
          const result =
            await userRepository.update(
              '550e8400-e29b-41d4-a716-446655440000',
              {
                name: 'John Smith',
              },
            )

          expect(result).toBeNull()
        },
      )

      test(
        'rejects duplicate email',
        async () => {
          const john =
            await userRepository.create({
              name: 'John Doe',
              email:
                'john@example.com',
            })

          await userRepository.create({
            name: 'Jane Doe',
            email:
              'jane@example.com',
          })

          expect(
            userRepository.update(
              john.id,
              {
                email:
                  'jane@example.com',
              },
            ),
          ).rejects.toThrow()
        },
      )
    })

    describe('delete', () => {
      test(
        'deletes a user and returns its id',
        async () => {
          const created =
            await userRepository.create({
              name: 'John Doe',
              email:
                'john@example.com',
            })

          const deleted =
            await userRepository.delete(
              created.id,
            )

          expect(deleted)
            .toEqual({
              id: created.id,
            })

          const user =
            await userRepository.findById(
              created.id,
            )

          expect(user).toBeNull()
        },
      )

      test(
        'returns null when deleting missing user',
        async () => {
          const result =
            await userRepository.delete(
              '550e8400-e29b-41d4-a716-446655440000',
            )

          expect(result).toBeNull()
        },
      )
    })
  },
)