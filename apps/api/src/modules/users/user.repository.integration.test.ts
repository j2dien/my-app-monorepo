import {
    afterAll,
    beforeEach,
    describe,
    expect,
    test,
} from 'bun:test'

import { cleanupDatabase } from '../../test/cleanup'
import { userRepository } from './user.repository'

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

        expect(user).toBeDefined()

        expect(user.id).toBeString()
        expect(user.name).toBe('John Doe')
        expect(user.email).toBe('john@example.com')

        expect(user.createdAt).toBeInstanceOf(Date)
        expect(user.updatedAt).toBeInstanceOf(Date)
    })

    test('finds user by id', async () => {
        const created =
            await userRepository.create({
                name: 'John Doe',
                email: 'john@example.com',
            })

        const user =
            await userRepository.findById(
                created!.id,
            )

        expect(user).not.toBeNull()

        expect(user).toMatchObject({
            id: created!.id,
            name: 'John Doe',
            email: 'john@example.com',
        })
    })

    test('returns null when user id does not exist', async () => {
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

        expect(user).not.toBeNull()

        expect(user).toMatchObject({
            name: 'Jane Doe',
            email: 'jane@example.com',
        })
    })

    test('returns null when email does not exist', async () => {
        const user =
            await userRepository.findByEmail(
                'missing@example.com',
            )

        expect(user).toBeNull()
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

        const result =
            await userRepository.findAll()

        expect(result).toHaveLength(2)

        expect(
            result.map((user) => user.email),
        ).toEqual(
            expect.arrayContaining([
                'john@example.com',
                'jane@example.com',
            ]),
        )
    })

    test('rejects duplicate email', async () => {
        await userRepository.create({
            name: 'John Doe',
            email: 'john@example.com',
        })

        expect(
            userRepository.create({
                name: 'Another John',
                email: 'john@example.com',
            }),
        ).rejects.toThrow()
    })
})