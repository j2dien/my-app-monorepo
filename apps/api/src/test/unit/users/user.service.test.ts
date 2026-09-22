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

const findMany = mock()
const findById = mock()
const findByEmail = mock()
const create = mock()
const update = mock()
const deleteUser = mock()

const repository = {
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
        email: 'john.smith@example.com',
        createdAt: new Date(),
        updatedAt: new Date(),
      })
  
      const user =
        await userService.updateUser(
          '1',
          {
            name: 'John Smith',
            email: 'john.smith@example.com',
          },
        )
  
      expect(update)
        .toHaveBeenCalledWith(
          '1',
          {
            name: 'John Smith',
            email: 'john.smith@example.com',
          },
        )
  
      expect(user).toMatchObject({
        id: '1',
        name: 'John Smith',
        email: 'john.smith@example.com',
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
            email: 'john.smith@example.com',
          },
        ),
      ).rejects.toMatchObject({
        code: 'USER_NOT_FOUND',
        status: 404,
      })
  
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
    'deletes user',
    async () => {
      deleteUser.mockResolvedValue({
        id: '1',
        name: 'John',
        email: 'john@example.com',
        createdAt: new Date(),
        updatedAt: new Date(),
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
