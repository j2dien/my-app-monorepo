import { db } from '../../../db'
import { users } from '../../../db/schema/users'

type NewUser =
  typeof users.$inferInsert

export async function insertTestUser(
  overrides: Partial<NewUser> = {},
) {
  const [user] = await db
    .insert(users)
    .values({
      name: 'John Doe',
      email: 'john@example.com',
      ...overrides,
    })
    .returning()

  if (!user) {
    throw new Error(
      'Failed to create test user',
    )
  }

  return user
}