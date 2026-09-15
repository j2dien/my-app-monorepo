// test/unit/users/user.route.test.ts

import {
  describe,
  expect,
  test,
} from 'bun:test'

import { app } from '../../../../src/app'

type ValidationErrorBody = {
  error: {
    code: string
    fields: Record<string, string>
  }
}

describe('users route', () => {
  test('rejects invalid create payload', async () => {
    const response = await app.request(
      '/api/v1/users',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: '',
          email: 'invalid-email',
        }),
      },
    )

    expect(response.status).toBe(400)

    const body =
      await response.json() as ValidationErrorBody

    expect(body.error.code)
      .toBe('VALIDATION_ERROR')

    expect(body.error.fields)
      .toMatchObject({
        name: 'Name is required',
        email: 'Email is invalid',
      })
  })

  test('rejects invalid user id', async () => {
    const response = await app.request(
      '/api/v1/users/not-a-uuid',
    )

    expect(response.status).toBe(400)

    const body =
      await response.json() as ValidationErrorBody

    expect(body.error.code)
      .toBe('VALIDATION_ERROR')
  })
})
