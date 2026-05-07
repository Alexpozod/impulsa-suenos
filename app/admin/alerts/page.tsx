"use client"

import { useEffect, useState } from "react"

export default function AlertsDashboard() {

  const [alerts, setAlerts] = useState<any[]>([])
  const [severity, setSeverity] = useState("")
  const [status, setStatus] = useState("open")

  const loadAlerts = async () => {
    let url = `/api/admin/alerts?status=${status}`

    if (severity) {
      url += `&severity=${severity}`
    }

    const res = await fetch(url)
    const data = await res.json()

    setAlerts(data || [])
  }

  useEffect(() => {
    loadAlerts()
  }, [severity, status])

  const resolveAlert = async (id: string) => {
    await fetch("/api/admin/alerts/resolve", {
      method: "POST",
      body: JSON.stringify({ id })
    })

    loadAlerts()
  }

  return (
    <div className="
  min-h-screen
  bg-[#020617]
  text-white
  p-6
  lg:p-10
  overflow-x-hidden
">

      <div className="
  flex
  flex-col
  lg:flex-row
  lg:items-center
  lg:justify-between
  gap-6
  mb-10
">

  {/* LEFT */}
  <div>

    <h1 className="
      text-4xl
      font-black
      tracking-tight
      text-white
    ">
      🚨 Incident Response Center
    </h1>

    <p className="text-slate-400 mt-2">
      Gestión y resolución de alertas críticas de la plataforma
    </p>

  </div>

  {/* RIGHT */}
  <div className="flex flex-wrap gap-3">

    <StatusBadge
      color="red"
      text={`${alerts.filter(a => a.severity === "critical").length} críticas`}
    />

    <StatusBadge
      color="yellow"
      text={`${alerts.filter(a => a.status === "open").length} abiertas`}
    />

    <StatusBadge
      color="blue"
      text="Monitoring Active"
    />

  </div>

</div>

<div className="
  grid
  md:grid-cols-2
  xl:grid-cols-4
  gap-4
  mb-8
">

  <SummaryCard
    title="Alertas totales"
    value={alerts.length}
    color="blue"
  />

  <SummaryCard
    title="Críticas"
    value={
      alerts.filter(a => a.severity === "critical").length
    }
    color="red"
  />

  <SummaryCard
    title="Abiertas"
    value={
      alerts.filter(a => a.status === "open").length
    }
    color="yellow"
  />

  <SummaryCard
    title="Resueltas"
    value={
      alerts.filter(a => a.status === "resolved").length
    }
    color="green"
  />

</div>

<div className="
  flex
  flex-wrap
  items-center
  gap-3
  mb-6
">

  <LiveIndicator
    color="green"
    text="Detection Engine Active"
  />

  <LiveIndicator
    color="blue"
    text="Realtime Monitoring"
  />

  <LiveIndicator
    color="yellow"
    text={`${alerts.filter(a => a.status === "open").length} incidents pending`}
  />

</div>

      {/* FILTROS */}
      <div className="
  bg-slate-900/80
  border
  border-slate-800
  rounded-2xl
  p-5
  mb-8
  flex
  flex-col
  lg:flex-row
  lg:items-center
  gap-4
  shadow-xl
">

  <select
    value={severity}
    onChange={(e) => setSeverity(e.target.value)}
    className="
      bg-slate-950
      border
      border-slate-700
      px-4
      py-3
      rounded-xl
      text-sm
      text-white
      outline-none
      focus:border-red-500
    "
  >
    <option value="">All severity</option>
    <option value="critical">Critical</option>
    <option value="warning">Warning</option>
  </select>

  <select
    value={status}
    onChange={(e) => setStatus(e.target.value)}
    className="
      bg-slate-950
      border
      border-slate-700
      px-4
      py-3
      rounded-xl
      text-sm
      text-white
      outline-none
      focus:border-yellow-500
    "
  >
    <option value="open">Open</option>
    <option value="resolved">Resolved</option>
  </select>

</div>

      {/* LISTA */}
      <div className="space-y-4">

{alerts.length === 0 && (

  <div
    className="
      bg-slate-900/80
      border
      border-slate-800
      rounded-2xl
      p-12
      text-center
      shadow-xl
    "
  >

    <div className="
      text-6xl
      mb-6
    ">
      🛡️
    </div>

    <h3 className="
      text-2xl
      font-bold
      text-white
      mb-2
    ">
      No existen incidentes activos
    </h3>

    <p className="text-slate-400">
      El sistema antifraude no detectó amenazas recientes
    </p>

  </div>

)}

        {alerts.map((a) => (
          <div
            key={a.id}
            className={`
  rounded-2xl
  border
  p-5
  shadow-xl
  transition-all
  duration-300
  hover:scale-[1.01]

  ${
    a.severity === "critical"
      ? "border-red-500/40 bg-red-950/20"

      : "border-yellow-500/40 bg-yellow-950/20"
  }
`}
          >

            <div className="
  flex
  items-center
  justify-between
  gap-4
  mb-4
">
  <div className="
  h-px
  bg-gradient-to-r
  from-white/10
  to-transparent
  mb-4
"/>
             <div className="flex items-center gap-3">

  <div className="text-xl">

    {a.severity === "critical"
      ? "🔴"
      : "🟠"}

  </div>

  <div>
    {a.type?.replaceAll("_", " ").toUpperCase()}
  </div>

</div>

              <div
  className={`
    text-xs
    px-3
    py-1
    rounded-full
    font-semibold

    ${
      a.severity === "critical"

        ? "bg-red-500/10 text-red-300 border border-red-500/20"

        : "bg-yellow-500/10 text-yellow-300 border border-yellow-500/20"
    }
  `}
>
                {a.severity.toUpperCase()}
              </div>
            </div>

            <div className="
  flex
  flex-wrap
  gap-3
  mb-4
">

  <div className="
    px-3
    py-1
    rounded-lg
    bg-slate-950/80
    border
    border-slate-700
    text-xs
    text-slate-300
  ">
    Campaign: {a.campaign_id}
  </div>

  {a.score && (

    <div className="
      px-3
      py-1
      rounded-lg
      bg-red-500/10
      border
      border-red-500/20
      text-xs
      text-red-300
    ">
      Risk Score: {a.score}
    </div>

  )}

</div>

            {a.score && (
              <div className="text-sm mb-2">
                Risk score: {a.score}
              </div>
            )}

            {a.flags && (
              <div className="
  bg-black/30
  border
  border-red-500/10
  rounded-xl
  p-3
  text-xs
  text-red-200
  mb-4
  overflow-x-auto
">
  {JSON.stringify(a.flags, null, 2)}
</div>
            )}

            <div className="
  text-xs
  text-slate-500
  mb-4
">
              🕒 {new Date(a.created_at).toLocaleString()}
            </div>

            {a.status === "open" && (
              <button
                onClick={() => resolveAlert(a.id)}
                className="
  bg-emerald-500
  hover:bg-emerald-400
  px-4
  py-2
  rounded-xl
  text-sm
  font-medium
  transition-all
  duration-300
  hover:scale-[1.02]
  shadow-lg
  shadow-emerald-500/20
"
              >
                Resolve Incident
              </button>
            )}

          </div>
        ))}

      </div>

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

    blue:
      "bg-blue-500/10 border-blue-500/20 text-blue-300"

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

function LiveIndicator({
  color,
  text
}: any) {

  const styles: any = {

    green:
      "bg-emerald-400",

    blue:
      "bg-blue-400",

    yellow:
      "bg-yellow-400"

  }

  return (

    <div className="
      flex
      items-center
      gap-3
      px-4
      py-2
      rounded-xl
      border
      border-slate-800
      bg-slate-900/80
    ">

      <div
        className={`
          w-2
          h-2
          rounded-full
          animate-pulse
          ${styles[color]}
        `}
      />

      <span className="
        text-sm
        text-slate-300
      ">
        {text}
      </span>

    </div>
  )
}