// test/integration/users/user.repository.test.ts

import {
    afterAll,
    beforeEach,
    describe,
    expect,
    test,
} from 'bun:test'

import { userRepository } from '../../../../src/modules/users/user.repository'
import { cleanupDatabase } from '../../helpers/cleanup'

describe('userRepository integration', () => {
    beforeEach(async () => {
        await cleanupDatabase()
    })

    afterAll(async () => {
        await cleanupDatabase()
    })

    test('creates a user', async () => {
        const user = await userRepository.create({
            name: 'John Doe',
            email: 'john@example.com',
        })

        expect(user.id).toBeString()
        expect(user.name).toBe('John Doe')
        expect(user.email).toBe('john@example.com')
        expect(user.createdAt).toBeInstanceOf(Date)
        expect(user.updatedAt).toBeInstanceOf(Date)
    })

    test('finds user by id', async () => {
        const created = await userRepository.create({
            name: 'John Doe',
            email: 'john@example.com',
        })

        const user =
            await userRepository.findById(created.id)

        expect(user).toMatchObject({
            id: created.id,
            name: 'John Doe',
            email: 'john@example.com',
        })
    })

    test('returns null for missing id', async () => {
        const user =
            await userRepository.findById(
                '550e8400-e29b-41d4-a716-446655440000',
            )

        expect(user).toBeNull()
    })

    test('finds user by email', async () => {
        await userRepository.create({
            name: 'Jane Doe',
            email: 'jane@example.com',
        })

        const user =
            await userRepository.findByEmail(
                'jane@example.com',
            )

        expect(user).toMatchObject({
            name: 'Jane Doe',
            email: 'jane@example.com',
        })
    })

    test('returns all users', async () => {
        await userRepository.create({
            name: 'John Doe',
            email: 'john@example.com',
        })

        await userRepository.create({
            name: 'Jane Doe',
            email: 'jane@example.com',
        })

        const users =
            await userRepository.findAll()

        expect(users).toHaveLength(2)
    })

    test('rejects duplicate email', async () => {
        await userRepository.create({
            name: 'John Doe',
            email: 'john@example.com',
        })

        await expect(
            userRepository.create({
                name: 'Another John',
                email: 'john@example.com',
            }),
        ).rejects.toThrow()
    })
})