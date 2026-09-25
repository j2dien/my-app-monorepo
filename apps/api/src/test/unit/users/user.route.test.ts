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
  describe('GET /api/v1/users/:id', () => {
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

  describe('POST /api/v1/users', () => {
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
  })

  describe('PATCH /api/v1/users/:id', () => {
    test('rejects invalid user id',
      async () => {
        const response = await app.request(
          '/api/v1/users/not-a-uuid',
          {
            method: 'PATCH',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              name: 'John Smith',
              email: 'john.smith@example.com'
            })
          }
        )

        expect(response.status).toBe(400)
      })

    test(
      'rejects invalid update payload',
      async () => {
        const userId =
          '11111111-1111-4111-8111-111111111111'

        const response = await app.request(
          `/api/v1/users/${userId}`,
          {
            method: 'PATCH',
            headers: {
              'Content-Type':
                'application/json',
            },
            body: JSON.stringify({
              name: '',
              email: 'not-an-email',
            }),
          },
        )

        expect(response.status)
          .toBe(400)
      },
    )
  })

  describe('DELETE /api/v1/users/:id', () => {
    test(
        'rejects invalid user id',
        async () => {
          const response = await app.request(
            '/api/v1/users/not-a-uuid',
            {
              method: 'DELETE',
            },
          )

          expect(response.status)
            .toBe(400)
        },
      )
  })
})
