export type Role = "admin" | "contador" | "system" | "user"

export function canAccess(role: Role, path: string) {

  // ADMIN → TODO
  if (role === "admin") return true

  // CONTADOR → SOLO LECTURA
  if (role === "contador") {
    return (
      path.startsWith("/contador") ||
      path.startsWith("/api/admin/export") ||
      path.startsWith("/api/admin/finance")
    )
  }

  return false
}