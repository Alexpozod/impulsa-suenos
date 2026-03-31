export function getOrgId(user: any) {
  // 🔥 versión inicial (simple y segura)
  return user?.organization_id || "00000000-0000-0000-0000-000000000000"
}
