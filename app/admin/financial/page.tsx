"use client"

import { useFinancialDashboard } from "@/hooks/useFinancialDashboard"

export default function FinancialDashboard() {
  const { data, loading } = useFinancialDashboard()

  if (loading) {
    return <div className="p-6">Cargando métricas...</div>
  }

  const totalRaised = data.reduce(
    (acc, c) => acc + (c.raised || 0),
    0
  )

  const totalSpent = data.reduce(
    (acc, c) => acc + (c.spent || 0),
    0
  )

  const totalBalance = data.reduce(
    (acc, c) => acc + (c.balance || 0),
    0
  )

  return (
    <div className="p-6 space-y-6">

      {/* HEADER */}
      <h1 className="text-2xl font-bold">
        💰 Financial Dashboard
      </h1>

      {/* METRICS */}
      <div className="grid grid-cols-3 gap-4">

        <div className="p-4 border rounded-xl">
          <p>Total Raised</p>
          <h2 className="text-xl font-bold">
            ${totalRaised}
          </h2>
        </div>

        <div className="p-4 border rounded-xl">
          <p>Total Spent</p>
          <h2 className="text-xl font-bold">
            ${totalSpent}
          </h2>
        </div>

        <div className="p-4 border rounded-xl">
          <p>Total Balance</p>
          <h2 className="text-xl font-bold">
            ${totalBalance}
          </h2>
        </div>

      </div>

      {/* CAMPAIGNS TABLE */}
      <div className="border rounded-xl p-4">
        <h2 className="font-bold mb-4">
          Campaign Breakdown
        </h2>

        <table className="w-full text-sm">
          <thead>
            <tr>
              <th className="text-left">Campaign</th>
              <th>Raised</th>
              <th>Spent</th>
              <th>Balance</th>
              <th>Tickets</th>
            </tr>
          </thead>

          <tbody>
            {data.map((c: any) => (
              <tr key={c.id} className="border-t">
                <td>{c.title}</td>
                <td>${c.raised}</td>
                <td>${c.spent}</td>
                <td>${c.balance}</td>
                <td>{c.ticketsSold}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

    </div>
  )
}
