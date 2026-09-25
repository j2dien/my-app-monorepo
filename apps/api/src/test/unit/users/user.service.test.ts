import {
  beforeEach,
  describe,
  expect,
  mock,
  test,
} from 'bun:test'

import {
  createUserService,
} from '../../../modules/users/user.service'

import type {
  UserRepository
} from '../../../modules/users/user.repository'

import type { UsersQuery } from '@/modules/users/user.schema'

const findMany = mock<UserRepository['findMany']>()
const findById = mock<UserRepository['findById']>()
const findByEmail = mock<UserRepository['findByEmail']>()
const create = mock<UserRepository['create']>()
const update = mock<UserRepository['update']>()
const deleteUser = mock<UserRepository['delete']>()

const repository: UserRepository = {
  findMany,
  findById,
  findByEmail,
  create,
  update,
  delete: deleteUser,
}

const userService =
  createUserService(repository)

beforeEach(() => {
  findMany.mockClear()
  findById.mockClear()
  findByEmail.mockClear()
  create.mockClear()
  update.mockClear()
  deleteUser.mockClear()
})

describe('userService', () => {
  describe('getUser', () => {
    test(
      'returns user by id',
      async () => {
        findById.mockResolvedValue({
          id: '1',
          name: 'John',
          email: 'john@example.com',
          createdAt: new Date(),
          updatedAt: new Date(),
        })

        const user =
          await userService.getUser('1')

        expect(user.email)
          .toBe('john@example.com')

        expect(findById)
          .toHaveBeenCalledWith('1')
      },
    )

    test(
      'throws USER_NOT_FOUND',
      async () => {
        findById.mockResolvedValue(null)

        expect(
          userService.getUser('1'),
        ).rejects.toMatchObject({
          code: 'USER_NOT_FOUND',
          status: 404,
        })
      },
    )

    test(
      'returns users with pagination',
      async () => {
        const query: UsersQuery = {
          page: 2,
          pageSize: 10,
          search: undefined,
          sortBy: 'createdAt',
          sortOrder: 'desc'
        } as const

        findMany.mockResolvedValue({
          items: [
            {
              id: '1',
              name: 'John',
              email: 'john@example.com',
              createdAt: new Date(),
              updatedAt: new Date(),
            },
            {
              id: '2',
              name: 'Jane',
              email: 'jane@example.com',
              createdAt: new Date(),
              updatedAt: new Date(),
            },
          ],
          total: 25,
        })

        const result = await userService.getUsers(query)

        expect(findMany).toHaveBeenCalledWith(query)

        expect(result.items).toHaveLength(2)

        expect(result.pagination)
          .toEqual({
            page: 2,
            pageSize: 10,
            total: 25,
            totalPages: 3,
          })
      }
    )

    test(
        'returns zero totalPages when there are no users',
        async () => {
          const query: UsersQuery = {
            page: 1,
            pageSize: 20,
            search: undefined,
            sortBy: 'createdAt',
            sortOrder: 'desc',
          } as const
    
          findMany.mockResolvedValue({
            items: [],
            total: 0,
          })
    
          const result =
            await userService.getUsers(query)
    
          expect(result.items)
            .toEqual([])
    
          expect(result.pagination)
            .toEqual({
              page: 1,
              pageSize: 20,
              total: 0,
              totalPages: 0,
            })
        },
      )
  })

  describe('createUser', () => {
    test(
      'creates user',
      async () => {
        findByEmail.mockResolvedValue(null)

        create.mockResolvedValue({
          id: '1',
          name: 'John',
          email: 'john@example.com',
          createdAt: new Date(),
          updatedAt: new Date(),
        })

        const user =
          await userService.createUser({
            name: 'John',
            email: 'john@example.com',
          })

        expect(findByEmail)
          .toHaveBeenCalledWith(
            'john@example.com',
          )

        expect(create)
          .toHaveBeenCalledWith({
            name: 'John',
            email: 'john@example.com',
          })

        expect(user.email)
          .toBe('john@example.com')
      },
    )

    test(
      'rejects existing email',
      async () => {
        findByEmail.mockResolvedValue({
          id: '1',
          name: 'John',
          email: 'john@example.com',
          createdAt: new Date(),
          updatedAt: new Date(),
        })

        expect(
          userService.createUser({
            name: 'John',
            email: 'john@example.com',
          }),
        ).rejects.toMatchObject({
          code: 'EMAIL_ALREADY_EXISTS',
          status: 409,
        })

        expect(create)
          .not
          .toHaveBeenCalled()
      },
    )

    test(
      'maps postgres unique violation to EMAIL_ALREADY_EXISTS',
      async () => {
        findByEmail.mockResolvedValue(null)

        const postgresError = {
          code: '23505',
        }

        create.mockRejectedValue(
          postgresError,
        )

        expect(
          userService.createUser({
            name: 'John',
            email: 'john@example.com',
          }),
        ).rejects.toMatchObject({
          code: 'EMAIL_ALREADY_EXISTS',
          status: 409,
        })
      },
    )
  })

  describe('updateUser', () => {
    test(
      'updates user',
      async () => {
        findById.mockResolvedValue({
          id: '1',
          name: 'John',
          email: 'john@example.com',
          createdAt: new Date(),
          updatedAt: new Date(),
        })

        findByEmail.mockResolvedValue(null)

        update.mockResolvedValue({
          id: '1',
          name: 'John Smith',
          email:
            'john.smith@example.com',
          createdAt: new Date(),
          updatedAt: new Date(),
        })

        const user =
          await userService.updateUser(
            '1',
            {
              name: 'John Smith',
              email:
                'john.smith@example.com',
            },
          )

        expect(findById)
          .toHaveBeenCalledWith('1')

        expect(findByEmail)
          .toHaveBeenCalledWith(
            'john.smith@example.com',
          )

        expect(update)
          .toHaveBeenCalledWith(
            '1',
            {
              name: 'John Smith',
              email:
                'john.smith@example.com',
            },
          )

        expect(user)
          .toMatchObject({
            id: '1',
            name: 'John Smith',
            email:
              'john.smith@example.com',
          })
      },
    )

    test(
      'throws USER_NOT_FOUND when updating missing user',
      async () => {
        findById.mockResolvedValue(null)

        expect(
          userService.updateUser(
            '1',
            {
              name: 'John Smith',
              email:
                'john.smith@example.com',
            },
          ),
        ).rejects.toMatchObject({
          code: 'USER_NOT_FOUND',
          status: 404,
        })

        expect(findByEmail)
          .not
          .toHaveBeenCalled()

        expect(update)
          .not
          .toHaveBeenCalled()
      },
    )

    test(
      'rejects duplicate email when updating user',
      async () => {
        findById.mockResolvedValue({
          id: '1',
          name: 'John',
          email: 'john@example.com',
          createdAt: new Date(),
          updatedAt: new Date(),
        })

        findByEmail.mockResolvedValue({
          id: '2',
          name: 'Jane',
          email: 'jane@example.com',
          createdAt: new Date(),
          updatedAt: new Date(),
        })

        expect(
          userService.updateUser(
            '1',
            {
              name: 'John',
              email: 'jane@example.com',
            },
          ),
        ).rejects.toMatchObject({
          code: 'EMAIL_ALREADY_EXISTS',
          status: 409,
        })

        expect(update)
          .not
          .toHaveBeenCalled()
      },
    )

    test(
      'maps postgres unique violation to EMAIL_ALREADY_EXISTS',
      async () => {
        findById.mockResolvedValue({
          id: '1',
          name: 'John',
          email: 'john@example.com',
          createdAt: new Date(),
          updatedAt: new Date(),
        })

        findByEmail.mockResolvedValue(null)

        const postgresError = {
          code: '23505',
        }

        update.mockRejectedValue(
          postgresError,
        )

        expect(
          userService.updateUser(
            '1',
            {
              name: 'John Smith',
              email:
                'john.smith@example.com',
            },
          ),
        ).rejects.toMatchObject({
          code: 'EMAIL_ALREADY_EXISTS',
          status: 409,
        })
      },
    )
  })

  describe('deleteUser', () => {
    test(
      'deletes user',
      async () => {
        deleteUser.mockResolvedValue({
          id: '1',
        })

        await userService.deleteUser('1')

        expect(deleteUser)
          .toHaveBeenCalledWith('1')
      },
    )

    test(
      'throws USER_NOT_FOUND when deleting missing user',
      async () => {
        deleteUser.mockResolvedValue(null)

        expect(
          userService.deleteUser('1'),
        ).rejects.toMatchObject({
          code: 'USER_NOT_FOUND',
          status: 404,
        })

        expect(deleteUser)
          .toHaveBeenCalledWith('1')
      },
    )
  })
})
