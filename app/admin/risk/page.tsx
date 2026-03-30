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

// 🆕 Stripe-like payment events
type PaymentEvent = {
  id: string
  payment_id: string
  event_type: string
  status: string
  created_at: string
}

export default function RiskAdminPage() {
  const [riskUsers, setRiskUsers] = useState<RiskUser[]>([])
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([])
  const [logs, setLogs] = useState<FraudLog[]>([])
  const [payments, setPayments] = useState<PaymentEvent[]>([])
  const [loading, setLoading] = useState(true)

  async function loadData() {
    setLoading(true)

    const res = await fetch("/api/admin/risk")
    const data = await res.json()

    setRiskUsers(data.risk_users || [])
    setWithdrawals(data.pending_withdrawals || [])
    setLogs(data.fraud_logs || [])
    setPayments(data.payment_events || []) // 🆕

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

  // 🧠 Group payments like Stripe
  const grouped = payments.reduce((acc: any, event) => {
    if (!acc[event.payment_id]) acc[event.payment_id] = []
    acc[event.payment_id].push(event)
    return acc
  }, {})

  const paymentGroups = Object.entries(grouped)

  return (
    <div className="p-6 space-y-10">

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

      {/* 💳 STRIPE-LIKE PAYMENTS DASHBOARD */}
      <div>
        <h2 className="text-xl font-bold mb-4">
          💳 Payment Intelligence (Stripe-like)
        </h2>

        <div className="space-y-3">
          {paymentGroups.map(([paymentId, events]: any) => {
            const last = events[events.length - 1]

            return (
              <div
                key={paymentId}
                className="border rounded p-4 bg-white"
              >
                <div className="flex justify-between items-center">
                  <div className="font-mono text-sm">
                    {paymentId}
                  </div>

                  <div className="text-xs px-2 py-1 rounded bg-gray-100">
                    {last?.status}
                  </div>
                </div>

                <div className="text-xs text-gray-500 mt-1">
                  {events.length} events
                </div>

                <div className="mt-2 space-y-1">
                  {events.slice(-3).map((e: any) => (
                    <div key={e.id} className="text-xs">
                      <span className="font-semibold">
                        {e.event_type}
                      </span>
                      {" → "}
                      <span className="text-gray-500">
                        {e.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      </div>

    </div>
  )
}
