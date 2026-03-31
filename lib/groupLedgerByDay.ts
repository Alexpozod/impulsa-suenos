export function groupLedgerByDay(ledger: any[]) {
  const map: Record<string, any> = {}

  for (const tx of ledger) {
    const date = new Date(tx.created_at).toISOString().split("T")[0]

    if (!map[date]) {
      map[date] = {
        date,
        income: 0,
        withdrawals: 0
      }
    }

    if (tx.type === "payment") {
      map[date].income += Number(tx.amount)
    } else {
      map[date].withdrawals += Number(tx.amount)
    }
  }

  return Object.values(map)
}
