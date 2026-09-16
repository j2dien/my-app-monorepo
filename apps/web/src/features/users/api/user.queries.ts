import { queryOptions } from '@tanstack/react-query'

import { api } from '@/lib/api/client'
import { throwApiError } from '@/lib/api/error'

export const usersQueryOptions =
    queryOptions({
        queryKey: ["users"],
        staleTime: 30_000,

        queryFn: async () => {
            const response = await api.api.v1.users.$get()

            if (!response.ok) {
                return throwApiError(response)
            }

            const body = await response.json()

            return body.data
        }
    })

export function userQueryOptions(userId: string) {
    return queryOptions({
        queryKey: ["users", userId],
        staleTime: 30_000,

        queryFn: async () => {
            const response = await api.api.v1.users[":id"].$get({
                param: {
                    id: userId
                }
            })

            if (!response.ok) {
                return throwApiError(response)
            }

            const body = await response.json()

            return body.data
        }
    })
}