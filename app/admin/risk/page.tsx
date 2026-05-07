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
    <div className="
  min-h-screen
  bg-[#020617]
  text-white
  p-6
  lg:p-10
  overflow-x-hidden
  space-y-8
">

      <div className="
  flex
  flex-col
  lg:flex-row
  lg:items-center
  lg:justify-between
  gap-6
">

  {/* LEFT */}
  <div>

    <h1 className="
      text-4xl
      font-black
      tracking-tight
      text-white
    ">
      🛡️ Threat Intelligence Center
    </h1>

    <p className="text-slate-400 mt-2">
      Monitoreo preventivo y análisis avanzado de riesgo
    </p>

  </div>

  {/* RIGHT */}
  <div className="flex flex-wrap gap-3">

    <StatusBadge
      color="green"
      text="Detection Active"
    />

    <StatusBadge
      color="yellow"
      text={`${data.risk_users.length} usuarios en riesgo`}
    />

    <StatusBadge
      color="red"
      text={`${data.fraud_logs.length} eventos sospechosos`}
    />

  </div>

</div>

<div className="
  grid
  md:grid-cols-2
  xl:grid-cols-4
  gap-4
">

  <SummaryCard
    title="Usuarios riesgosos"
    value={data.risk_users.length}
    color="yellow"
  />

  <SummaryCard
    title="Fraud logs"
    value={data.fraud_logs.length}
    color="red"
  />

  <SummaryCard
    title="Retiros sospechosos"
    value={data.pending_withdrawals.length}
    color="blue"
  />

  <SummaryCard
    title="Eventos monitoreados"
    value={data.payment_events.length}
    color="green"
  />

</div>

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

    <div
      className="
        bg-slate-900/80
        border
        border-slate-800
        rounded-2xl
        p-6
        shadow-xl
        backdrop-blur-sm
      "
    >

      <div className="
        flex
        items-center
        justify-between
        mb-6
      ">

        <h2 className="
          text-xl
          font-bold
          text-white
        ">
          {title}
        </h2>

        <div className="
          px-3
          py-1
          rounded-full
          bg-slate-800
          border
          border-slate-700
          text-xs
          text-slate-400
        ">
          LIVE
        </div>

      </div>

      <div className="space-y-3">
        {children}
      </div>

    </div>
  )
}

function Card({ children }: any) {

  return (

    <div
      className="
        bg-slate-950/70
        border
        border-slate-800
        rounded-xl
        p-4
        transition-all
        duration-300
        hover:bg-slate-900
        hover:scale-[1.01]
      "
    >
      {children}
    </div>
  )
}

function Empty({ text }: any) {

  return (

    <div
      className="
        flex
        flex-col
        items-center
        justify-center
        text-center
        py-10
      "
    >

      <div className="
        w-14
        h-14
        rounded-full
        bg-slate-800
        border
        border-slate-700
        flex
        items-center
        justify-center
        text-2xl
        mb-4
      ">
        🛡️
      </div>

      <p className="text-slate-300 font-medium">
        {text}
      </p>

    </div>
  )
}

function StatusBadge({
  color,
  text
}: any) {

  const styles: any = {

    red:
      "bg-red-500/10 border-red-500/20 text-red-300",

    yellow:
      "bg-yellow-500/10 border-yellow-500/20 text-yellow-300",

    green:
      "bg-emerald-500/10 border-emerald-500/20 text-emerald-300"

  }

  return (

    <div
      className={`
        px-4
        py-2
        rounded-xl
        border
        text-sm
        font-medium
        ${styles[color]}
      `}
    >
      {text}
    </div>
  )
}

function SummaryCard({
  title,
  value,
  color
}: any) {

  const styles: any = {

    red:
      "from-red-500/20 border-red-500/20 text-red-300",

    yellow:
      "from-yellow-500/20 border-yellow-500/20 text-yellow-300",

    blue:
      "from-blue-500/20 border-blue-500/20 text-blue-300",

    green:
      "from-emerald-500/20 border-emerald-500/20 text-emerald-300"

  }

  return (

    <div
      className={`
        bg-gradient-to-br
        to-slate-900
        ${styles[color]}
        border
        rounded-2xl
        p-5
        shadow-xl
      `}
    >

      <p className="text-sm text-slate-400">
        {title}
      </p>

      <p className="
        text-3xl
        font-black
        mt-2
      ">
        {value}
      </p>

    </div>
  )
}