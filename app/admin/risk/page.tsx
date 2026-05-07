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
  const [lastUpdate, setLastUpdate] = useState("")
  const [error, setError] = useState("")

  useEffect(() => {

  load()

  const interval = setInterval(() => {
    load()
  }, 30000)

  return () => clearInterval(interval)

}, [])

  const load = async () => {

  try {

    setError("")

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

setLastUpdate(
  new Date().toLocaleTimeString()
)

    } catch (err) {
      console.error("❌ FRONT RISK ERROR:", err)
      setError("Error cargando panel antifraude")
    }

    setLoading(false)
  }

 if (loading) {

  return (

    <div className="
      min-h-screen
      bg-[#020617]
      flex
      items-center
      justify-center
    ">

      <div className="text-center">

        <div
          className="
            w-16
            h-16
            border-4
            border-red-500/20
            border-t-red-400
            rounded-full
            animate-spin
            mx-auto
            mb-6
          "
        />

        <p className="
          text-slate-300
          text-lg
          font-medium
        ">
          Cargando Threat Intelligence Center...
        </p>

      </div>

    </div>

  )
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

<p className="
  text-slate-500
  text-sm
  mt-2
">
  Última actualización:
  {" "}
  {lastUpdate || "--:--"}
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

  <div className="
    flex
    flex-col
    lg:flex-row
    lg:items-center
    lg:justify-between
    gap-4
  ">

    {/* LEFT */}
    <div>

      <p className="
        text-white
        font-semibold
        break-all
      ">
        {u.user_id}
      </p>

      <div className="
        flex
        flex-wrap
        gap-2
        mt-3
      ">

        <RiskBadge
          color={
            u.score >= 80
              ? "red"
              : u.score >= 50
              ? "yellow"
              : "green"
          }
          text={`Risk Score: ${u.score}`}
        />

        <RiskBadge
          color={
            u.status === "blocked"
              ? "red"
              : "blue"
          }
          text={u.status}
        />

      </div>

    </div>

    {/* RIGHT */}
    <RiskLevel score={u.score} />

  </div>

</Card>
        ))}
      </Section>

      {/* WITHDRAWALS */}
      <Section title="Retiros sospechosos">
        {data.pending_withdrawals.length === 0 && <Empty text="Sin retiros sospechosos" />}

        {data.pending_withdrawals.map((w: any) => (
          <Card key={w.id}>

  <div className="
    flex
    flex-col
    lg:flex-row
    lg:items-center
    lg:justify-between
    gap-4
  ">

    <div>

      <p className="
        text-white
        font-semibold
        break-all
      ">
        {w.user_email}
      </p>

      <p className="
        text-slate-400
        text-sm
        mt-1
      ">
        Retiro marcado como sospechoso
      </p>

    </div>

    <div className="
      px-4
      py-2
      rounded-xl
      bg-red-500/10
      border
      border-red-500/20
      text-red-300
      font-bold
    ">
      ${Number(w.amount).toLocaleString()}
    </div>

  </div>

</Card>
        ))}
      </Section>

      {/* ALERTS */}
      <Section title="Alertas de fraude">
        {data.fraud_logs.length === 0 && <Empty text="Sin alertas" />}

        {data.fraud_logs.slice(0, 20).map((l: any) => (
          <div
  key={l.id}
  className="
    bg-red-950/20
    border
    border-red-500/20
    rounded-xl
    p-4
  "
>

  <div className="
    flex
    flex-col
    lg:flex-row
    lg:items-center
    lg:justify-between
    gap-4
  ">

    <div>

      <p className="
  text-red-300
  font-semibold
  uppercase
  tracking-wide
">
  {(l.type || l.reason)?.replaceAll("_", " ")}
</p>

      <p className="
        text-slate-400
        text-sm
        mt-1
        break-all
      ">
        {l.user_id || "Sistema"}
      </p>

    </div>

    <RiskBadge
      color="red"
      text="Threat Detected"
    />

  </div>

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

  <div className="
    flex
    flex-col
    lg:flex-row
    lg:items-center
    lg:justify-between
    gap-4
  ">

    <div>

      <p className="
        text-white
        font-semibold
        break-all
      ">
        Payment: {p.payment_id}
      </p>

      <p className="
        text-slate-400
        text-sm
        mt-1
      ">
        Evento monitoreado por motor antifraude
      </p>

    </div>

    <RiskBadge
      color={
        p.status === "approved"
          ? "green"
          : p.status === "pending"
          ? "yellow"
          : "red"
      }
      text={
  p.status === "approved"
    ? "Approved"

    : p.status === "pending"
    ? "Pending Review"

    : "Rejected"
}
    />

  </div>

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

      <div className="
  space-y-3
  max-h-[500px]
  overflow-y-auto
  pr-2
  scrollbar-thin
  scrollbar-thumb-slate-700
  scrollbar-track-transparent
">

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

function RiskBadge({
  color,
  text
}: any) {

  const styles: any = {

    red:
      "bg-red-500/10 border-red-500/20 text-red-300",

    yellow:
      "bg-yellow-500/10 border-yellow-500/20 text-yellow-300",

    green:
      "bg-emerald-500/10 border-emerald-500/20 text-emerald-300",

    blue:
      "bg-blue-500/10 border-blue-500/20 text-blue-300"

  }

  return (

    <div
      className={`
        px-3
        py-1
        rounded-lg
        border
        text-xs
        font-medium
        ${styles[color]}
      `}
    >
      {text}
    </div>
  )
}

function RiskLevel({
  score
}: any) {

  const color =
    score >= 80
      ? "bg-red-500"

      : score >= 50
      ? "bg-yellow-500"

      : "bg-emerald-500"

  return (

    <div className="
      flex
      flex-col
      items-end
      gap-2
      min-w-[140px]
    ">

      <div className="
        text-xs
        text-slate-400
      ">
        Threat Level
      </div>

      <div className="
        w-full
        h-2
        rounded-full
        bg-slate-800
        overflow-hidden
      ">

        <div
          className={`
            h-full
            ${color}
          `}
          style={{
           width: `${Math.max(0, Math.min(Number(score || 0), 100))}%`
          }}
        />

      </div>

    </div>
  )
}