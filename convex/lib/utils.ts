/**
 * Utility function to handle promises and return [error, result] tuple
 */
export async function handlePromise<T>(
  promise: Promise<T>
): Promise<[Error | null, T | null]> {
  try {
    const result = await promise
    return [null, result]
  } catch (error) {
    return [error as Error, null]
  }
}
