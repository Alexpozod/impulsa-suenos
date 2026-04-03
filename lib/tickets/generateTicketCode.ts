export function generateTicketCode(prefix: string, number: number): string {
  return `${prefix}-${String(number).padStart(6, "0")}`
}