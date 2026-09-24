const POSTGRES_UNIQUE_VIOLATION =
  '23505'

export function isPostgresUniqueViolation(
  error: unknown,
): boolean {
  let current: unknown = error

  while (
    current &&
    typeof current === 'object'
  ) {
    if (
      'code' in current &&
      current.code ===
        POSTGRES_UNIQUE_VIOLATION
    ) {
      return true
    }

    if (!('cause' in current)) {
      return false
    }

    current = current.cause
  }

  return false
}