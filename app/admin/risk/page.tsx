"use client"

import { useEffect, useState } from "react"

export default function RiskAdminPage() {

  const [data, setData] = useState<any>(null)

  useEffect(() => {
    load()
  }, [])

  const load = async () => {
    const res = await fetch("/api/admin/risk")
    const json = await res.json()
    setData(json)
  }

  if (!data) return <div className="p-6">Cargando...</div>

  return (
    <div className="p-6 bg-slate-950 text-white min-h-screen space-y-8">

      <h1 className="text-2xl font-bold">
        🚨 Panel Antifraude
      </h1>

      {/* USERS */}
      <section>
        <h2 className="font-semibold mb-2">Usuarios en riesgo</h2>

        {data.risk_users.map((u: any) => (
          <div key={u.id} className="bg-slate-900 p-3 rounded mb-2">
            {u.user_id} → score: {u.score} ({u.status})
          </div>
        ))}
      </section>

      {/* WITHDRAWALS */}
      <section>
        <h2 className="font-semibold mb-2">Retiros sospechosos</h2>

        {data.pending_withdrawals.map((w: any) => (
          <div key={w.id} className="bg-slate-900 p-3 rounded mb-2">
            {w.user_email} → ${w.amount}
          </div>
        ))}
      </section>

      {/* ALERTS */}
      <section>
        <h2 className="font-semibold mb-2">Alertas</h2>

        {data.fraud_logs.map((l: any) => (
          <div key={l.id} className="bg-red-900 p-3 rounded mb-2">
            {l.user_id} → {l.reason}
          </div>
        ))}
      </section>

    </div>
  )
}