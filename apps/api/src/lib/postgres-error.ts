// apps/api/src/lib/postgres-error.ts

type PostgresErrorLike = {
  code?: string;
  constraint_name?: string;
};

export function isPostgresUniqueViolation(
  error: unknown,
): error is PostgresErrorLike {
  if (typeof error !== "object" || error === null) {
    return false;
  }

  const candidate = error as PostgresErrorLike;

  return candidate.code === "23505";
}
