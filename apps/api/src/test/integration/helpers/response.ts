export async function parseJson<T>(
  response: Response,
): Promise<T> {
  return (await response.json()) as T
}