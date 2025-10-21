/**
 * Generates a unique ID with a specified prefix
 * @param prefix The prefix to use for the ID
 * @returns A unique ID string
 */
export function generateId(prefix: string): string {
  const timestamp = Date.now().toString().slice(-6)
  const random = Math.floor(Math.random() * 10000)
    .toString()
    .padStart(4, "0")
  return `${prefix}-${timestamp}-${random}`
}
