"use client"

import { useEffect, useState } from "react"

export default function RiskAdminPage() {

  const [data, setData] = useState<any>({
    risk_users: [],
    pending_withdrawals: [],
    fraud_logs: [],
    payment_events: []
  })

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    load()
  }, [])

  const load = async () => {
    try {

      const res = await fetch("/api/admin/risk")

      if (!res.ok) {
        throw new Error("API error")
      }

      const json = await res.json()

      setData({
        risk_users: json.risk_users || [],
        pending_withdrawals: json.pending_withdrawals || [],
        fraud_logs: json.fraud_logs || [],
        payment_events: json.payment_events || []
      })

    } catch (err) {
      console.error("❌ FRONT RISK ERROR:", err)
      setError("Error cargando panel antifraude")
    }

    setLoading(false)
  }

  if (loading) {
    return <div className="p-6 text-white">Cargando panel antifraude...</div>
  }

  if (error) {
    return <div className="p-6 text-red-400">{error}</div>
  }

  return (
    <div className="p-6 bg-slate-950 text-white min-h-screen space-y-8">

      <h1 className="text-2xl font-bold">
        🚨 Panel Antifraude
      </h1>

      {/* USERS */}
      <Section title="Usuarios en riesgo">
        {data.risk_users.length === 0 && <Empty text="Sin usuarios en riesgo" />}

        {data.risk_users.map((u: any) => (
          <Card key={u.id}>
            {u.user_id} → score: {u.score} ({u.status})
          </Card>
        ))}
      </Section>

      {/* WITHDRAWALS */}
      <Section title="Retiros sospechosos">
        {data.pending_withdrawals.length === 0 && <Empty text="Sin retiros sospechosos" />}

        {data.pending_withdrawals.map((w: any) => (
          <Card key={w.id}>
            {w.user_email} → ${Number(w.amount).toLocaleString()}
          </Card>
        ))}
      </Section>

      {/* ALERTS */}
      <Section title="Alertas de fraude">
        {data.fraud_logs.length === 0 && <Empty text="Sin alertas" />}

        {data.fraud_logs.map((l: any) => (
          <div key={l.id} className="bg-red-900 p-3 rounded mb-2">
            {l.user_id || "Sistema"} → {l.type || l.reason}
          </div>
        ))}
      </Section>

      {/* PAYMENT EVENTS (FUTURO) */}
      <Section title="Eventos de pago (inteligencia)">
        {data.payment_events.length === 0 && (
          <Empty text="Sin eventos registrados" />
        )}

        {data.payment_events.slice(0, 20).map((p: any) => (
          <Card key={p.id}>
            {p.payment_id} → {p.status}
          </Card>
        ))}
      </Section>

    </div>
  )
}

/* =========================
   COMPONENTES
========================= */

function Section({ title, children }: any) {
  return (
    <div>
      <h2 className="font-semibold mb-2">{title}</h2>
      {children}
    </div>
  )
}

function Card({ children }: any) {
  return (
    <div className="bg-slate-900 p-3 rounded mb-2 border border-slate-800">
      {children}
    </div>
  )
}

function Empty({ text }: any) {
  return (
    <p className="text-slate-400 text-sm">{text}</p>
  )
}