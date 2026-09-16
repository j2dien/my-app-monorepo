export class ApiError extends Error {
    public readonly code: string
    public readonly status: number
    public readonly fields?: Record<string, string>
    public readonly requestId?: string

    constructor(
        code: string,
        message: string,
        status: number,
        fields?: Record<string, string>,
        requestId?: string,
    ) {
        super(message)

        this.name = 'ApiError'
        this.code = code
        this.status = status
        this.fields = fields
        this.requestId = requestId
    }
}

interface ApiErrorResponse {
    readonly status: number
    json(): Promise<unknown>
}

export async function throwApiError(
    response: ApiErrorResponse,
): Promise<never> {
    let body: unknown

    try {
        body = await response.json()
    } catch {
        throw new ApiError(
            'UNKNOWN_ERROR',
            'Unexpected server response',
            response.status,
        )
    }

    if (
        typeof body === 'object' &&
        body !== null &&
        'error' in body
    ) {
        const error = (
            body as {
                error?: {
                    code?: string
                    message?: string
                    fields?: Record<string, string>
                    requestId?: string
                }
            }
        ).error

        throw new ApiError(
            error?.code ?? 'UNKNOWN_ERROR',
            error?.message ?? 'Request failed',
            response.status,
            error?.fields,
            error?.requestId,
        )
    }

    throw new ApiError(
        'UNKNOWN_ERROR',
        'Request failed',
        response.status,
    )
}
