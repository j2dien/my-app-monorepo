import {
  describe,
  expect,
  test,
} from 'bun:test'

import {
  isPostgresUniqueViolation,
} from '../../../lib/postgres-error'

describe('isPostgresUniqueViolation', () => {
  test(
    'returns true for postgres unique violation',
    () => {
      const error = {
        code: '23505',
      }

      expect(
        isPostgresUniqueViolation(
          error,
        ),
      ).toBe(true)
    },
  )

  test(
    'returns true for nested postgres unique violation',
    () => {
      const error = {
        cause: {
          code: '23505',
        },
      }

      expect(
        isPostgresUniqueViolation(
          error,
        ),
      ).toBe(true)
    },
  )

  test(
    'returns false for another postgres error',
    () => {
      const error = {
        code: '23503',
      }

      expect(
        isPostgresUniqueViolation(
          error,
        ),
      ).toBe(false)
    },
  )

  test(
    'returns false for regular error',
    () => {
      expect(
        isPostgresUniqueViolation(
          new Error(
            'Something went wrong',
          ),
        ),
      ).toBe(false)
    },
  )

  test(
    'returns false for unknown values',
    () => {
      expect(
        isPostgresUniqueViolation(
          null,
        ),
      ).toBe(false)

      expect(
        isPostgresUniqueViolation(
          undefined,
        ),
      ).toBe(false)

      expect(
        isPostgresUniqueViolation(
          'error',
        ),
      ).toBe(false)
    },
  )

  test(
    'returns true for deeply nested unique violation',
    () => {
      const error = {
        cause: {
          cause: {
            code: '23505',
          },
        },
      }
  
      expect(
        isPostgresUniqueViolation(
          error,
        ),
      ).toBe(true)
    },
  )
})