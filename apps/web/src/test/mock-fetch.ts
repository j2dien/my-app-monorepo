type FetchFunction = typeof fetch extends (...args: infer Args) => infer Result
  ? (...args: Args) => Result
  : never;

export function mockFetch(implementation: FetchFunction) {
  globalThis.fetch = implementation as unknown as typeof fetch;
}

export function mockJsonFetch(body: unknown, init?: ResponseInit) {
  mockFetch(async () => {
    return Response.json(body, init);
  });
}

export function mockFetchWithHandler(
  handler: (request: Request) => Response | Promise<Response>,
) {
  mockFetch(async (input, init) => {
    const request = input instanceof Request ? input : new Request(input, init);

    return handler(request);
  });
}