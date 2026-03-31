export type Role = "admin" | "system" | "user"

export function canAccess(role: Role, action: string) {
  const rules: Record<string, Role[]> = {
    "payout.approve": ["admin"],
    "campaign.block": ["admin"],
    "audit.read": ["admin", "system"],
    "ledger.read": ["admin", "system"],
  }

  return rules[action]?.includes(role) || false
}
