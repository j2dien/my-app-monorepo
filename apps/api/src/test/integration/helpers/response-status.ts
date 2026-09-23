import { expect } from 'bun:test'

export function expectStatus<
  T extends { status: number },
  S extends T['status'],
>(
  response: T,
  status: S,
): asserts response is Extract<
  T,
  { status: S }
> {
  expect(response.status).toBe(status)

  if (response.status !== status) {
    throw new Error(
      `Expected ${status}, received ${response.status}`,
    )
  }
}