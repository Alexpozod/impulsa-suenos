"use client"

import { useEffect, useState } from "react"

type RiskUser = {
  id: string
  user_id: string
  score: number
  status: string
}

type Withdrawal = {
  id: string
  user_email: string
  amount: number
  status: string
  created_at: string
}

type FraudLog = {
  id: string
  user_id: string
  reason: string
  created_at: string
}

export default function RiskAdminPage() {
  const [riskUsers, setRiskUsers] = useState<RiskUser[]>([])
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([])
  const [logs, setLogs] = useState<FraudLog[]>([])
  const [loading, setLoading] = useState(true)

  async function loadData() {
    setLoading(true)

    const res = await fetch("/api/admin/risk")
    const data = await res.json()

    setRiskUsers(data.risk_users || [])
    setWithdrawals(data.pending_withdrawals || [])
    setLogs(data.fraud_logs || [])

    setLoading(false)
  }

  useEffect(() => {
    loadData()
  }, [])

  async function updateStatus(userId: string, status: string) {
    await fetch("/api/admin/user-risk", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, status })
    })

    loadData()
  }

  if (loading) {
    return <div className="p-6">Cargando panel antifraude...</div>
  }

  return (
    <div className="p-6 space-y-8">

      <h1 className="text-2xl font-bold">🚨 Panel Antifraude</h1>

      {/* USERS */}
      <div>
        <h2 className="text-xl font-semibold mb-2">Usuarios en riesgo</h2>

        <table className="w-full border">
          <thead>
            <tr>
              <th>User</th>
              <th>Score</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>
            {riskUsers.map(u => (
              <tr key={u.id}>
                <td>{u.user_id}</td>
                <td>{u.score}</td>
                <td>{u.status}</td>
                <td className="space-x-2">
                  <button onClick={() => updateStatus(u.user_id, "blocked")}>
                    Block
                  </button>

                  <button onClick={() => updateStatus(u.user_id, "normal")}>
                    Unblock
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* WITHDRAWALS */}
      <div>
        <h2 className="text-xl font-semibold mb-2">Retiros pendientes</h2>

        <ul>
          {withdrawals.map(w => (
            <li key={w.id}>
              {w.user_email} - ${w.amount} - {w.status}
            </li>
          ))}
        </ul>
      </div>

      {/* LOGS */}
      <div>
        <h2 className="text-xl font-semibold mb-2">Logs de fraude</h2>

        <ul>
          {logs.map(l => (
            <li key={l.id}>
              {l.user_id} → {l.reason}
            </li>
          ))}
        </ul>
      </div>

    </div>
  )
}
