"use client"

import { useEffect, useState } from "react"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

type AuditLog = {
  id: string
  action: string
  entity: string
  entity_id: string
  metadata: any
  actor_id: string
  created_at: string
}

export default function AuditDashboard() {
  const [logs, setLogs] = useState<AuditLog[]>([])
  const [filter, setFilter] = useState("all")
  const [loading, setLoading] = useState(true)
  const [lastUpdate, setLastUpdate] = useState("")

  /* =========================
     🔥 LOAD INICIAL
  ========================= */
  async function loadInitial() {
    try {
      setLoading(true)
      const [auditRes, systemRes] = await Promise.all([
        fetch("/api/audit-log/list"),
        fetch("/api/system-events/list")
      ])

      const auditData = await auditRes.json()
      const systemData = await systemRes.json()

      const auditLogs = (auditData.logs || []).map((l: any) => ({
        ...l,
      }))

      const systemLogs = (systemData.logs || []).map((l: any) => ({
        id: l.id,
        action: l.type,
        entity: "system",
        entity_id: "",
        metadata: l.metadata,
        actor_id: "system",
        created_at: l.created_at
      }))

      const combined = [...auditLogs, ...systemLogs]

      setLogs(
  combined.sort(
    (a, b) =>
      new Date(b.created_at).getTime() -
      new Date(a.created_at).getTime()
  )
)

setLastUpdate(
  new Date().toLocaleTimeString()
)

  } catch (err) {
  console.error("❌ audit load error:", err)
} finally {
  setLoading(false)
}

}

  /* =========================
     ⚡ REALTIME
  ========================= */
  useEffect(() => {

    loadInitial()
    const interval = setInterval(() => {
      loadInitial()
    }, 30000)

    const channel = supabase
      .channel("audit-live")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "audit_logs"
        },
        (payload) => {
          const newLog = payload.new as AuditLog

          setLogs((prev) => [newLog, ...prev])

          setLastUpdate(
            new Date().toLocaleTimeString()
          )
        }
      )
      .subscribe()

    return () => {
  clearInterval(interval)
  supabase.removeChannel(channel)
}

  }, [])

  /* =========================
     🎯 FILTROS
  ========================= */
  const filters = [
    "all",
    "payout_requested",
    "payout_paid",
    "payout_rejected",
    "campaign_created",
    "notification_email_error"
  ]

  const filtered =
    filter === "all"
      ? logs
      : logs.filter((l) => l.action === filter)

  /* =========================
     📊 MÉTRICAS
  ========================= */
  const errors = logs.filter(l => l.action?.includes("error")).length
  const warnings = logs.filter(l => l.action?.includes("warning")).length

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
            border-blue-500/20
            border-t-blue-400
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
          Cargando auditoría avanzada...
        </p>

      </div>

    </div>
  )
}

  return (

  <main className="
    min-h-screen
    bg-[#020617]
    text-white
    p-6
    lg:p-10
    overflow-x-hidden
  ">

    <div className="space-y-5">

      {/* HEADER */}
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
      text-3xl
      font-black
      tracking-tight
      text-white
    ">
      🧾 Governance & Audit Center
    </h1>

    <p className="text-slate-400 mt-2">
      Auditoría avanzada, trazabilidad y monitoreo de acciones críticas
    </p>

  </div>

  {/* RIGHT */}
<div className="flex flex-wrap gap-3">

  <StatusBadge
    color="green"
    text="Realtime Audit Active"
  />

  <StatusBadge
    color="yellow"
    text={`${warnings} warnings`}
  />

  <StatusBadge
    color="red"
    text={`${errors} errores`}
  />

  <StatusBadge
    color="green"
    text={`Sync ${lastUpdate || "--:--"}`}
  />

</div>

</div>

{/* LIVE INDICATORS */}
<div className="
  flex
  flex-wrap
  items-center
  gap-3
">

  <LiveIndicator
    color="green"
    text="Supabase Realtime Connected"
  />

  <LiveIndicator
    color="blue"
    text="Audit Stream Active"
  />

  <LiveIndicator
    color="yellow"
    text={`${logs.length} eventos cargados`}
  />

</div>

{/* SUMMARY */}
<div className="
  grid
  md:grid-cols-2
  xl:grid-cols-4
  gap-3
">

  <SummaryCard
    title="Eventos auditados"
    value={logs.length}
    color="blue"
  />

  <SummaryCard
    title="Errores"
    value={errors}
    color="red"
  />

  <SummaryCard
    title="Warnings"
    value={warnings}
    color="yellow"
  />

  <SummaryCard
    title="Eventos sistema"
    value={
      logs.filter(l => l.actor_id === "system").length
    }
    color="green"
  />

</div>

      {/* ALERTA GLOBAL */}
      {errors > 0 && (
        <div className="bg-red-600 text-white p-3 rounded">
          🚨 Hay errores activos en el sistema
        </div>
      )}

            {/* FILTER CENTER */}
<div className="
  bg-slate-900/80
  border
  border-slate-800
  rounded-xl
  p-4
  shadow-xl
">

  <div className="
    flex
    items-center
    justify-between
    mb-3
  ">

    <div>

      <h2 className="
        text-lg
        font-bold
        text-white
      ">
        🎯 Audit Filters
      </h2>

      <p className="
        text-sm
        text-slate-400
        mt-1
      ">
        Filtrado avanzado de eventos auditados
      </p>

    </div>

    <div className="
      px-3
      py-1
      rounded-full
      bg-blue-500/10
      border
      border-blue-500/20
      text-blue-300
      text-xs
      font-medium
    ">
      {filtered.length} resultados
    </div>

  </div>

  <div className="
    flex
    flex-wrap
    gap-3
  ">

    {filters.map((f) => {

      const active =
        filter === f

      return (

        <button
          key={f}
          onClick={() => setFilter(f)}
          className={`
            px-4
            py-2
            rounded-xl
            border
            text-sm
            font-medium
            transition-all
            duration-300

            ${
              active

                ? `
                  bg-blue-500/20
                  border-blue-500/30
                  text-blue-300
                  shadow-lg
                  shadow-blue-500/10
                `

                : `
                  bg-slate-950
                  border-slate-700
                  text-slate-400
                  hover:border-slate-500
                  hover:text-white
                `
            }
          `}
        >

          {f.replaceAll("_", " ")}

        </button>
      )
    })}

  </div>

</div>

{/* EMPTY */}
{filtered.length === 0 && (

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
      🧾
    </div>

    <h3 className="
      text-2xl
      font-bold
      text-white
      mb-2
    ">
      No existen eventos auditados
    </h3>

    <p className="text-slate-400">
      No hay registros para el filtro seleccionado
    </p>

  </div>

)}

     {/* AUDIT STREAM */}
<div className="
  space-y-4
  max-h-[950px]
  overflow-y-auto
  pr-2
">

  {filtered.map((log) => {

    const isError =
      log.action?.includes("error")

    const isWarning =
      log.action?.includes("warning")

    const severityStyles =
      isError

        ? {
            border: "border-red-500/30",
            bg: "bg-red-500/10",
            badge: "bg-red-500/10 border-red-500/20 text-red-300",
            icon: "🔴"
          }

        : isWarning

        ? {
            border: "border-yellow-500/30",
            bg: "bg-yellow-500/10",
            badge: "bg-yellow-500/10 border-yellow-500/20 text-yellow-300",
            icon: "🟠"
          }

        : {
            border: "border-blue-500/20",
            bg: "bg-blue-500/10",
            badge: "bg-blue-500/10 border-blue-500/20 text-blue-300",
            icon: "🔵"
          }

    return (

      <div
        key={log.id}
        className={`
          ${severityStyles.bg}
          ${severityStyles.border}
          border
          rounded-xl
          p-4
          shadow-xl
          transition-all
          duration-300
          hover:scale-[1.01]
        `}
      >

        {/* TOP */}
        <div className="
          flex
          flex-col
          lg:flex-row
          lg:items-center
          lg:justify-between
          gap-3
          mb-3
        ">

          <div className="flex items-center gap-3">

            <div className="text-2xl">
              {severityStyles.icon}
            </div>

            <div>

              <p className="
                text-white
                font-bold
                uppercase
                tracking-wide
              ">
                {log.action?.replaceAll("_", " ")}
              </p>

              <p className="
                text-slate-400
                text-sm
                mt-1
              ">
                {log.entity} → {log.entity_id || "N/A"}
              </p>

            </div>

          </div>

          <div
            className={`
              ${severityStyles.badge}
              px-3
              py-1
              rounded-xl
              border
              text-xs
              font-semibold
            `}
          >

            {isError
              ? "ERROR"

              : isWarning
              ? "WARNING"

              : "INFO"}

          </div>

        </div>

        {/* METADATA */}
        <div className="
          bg-black/20
          border
          border-white/5
          rounded-xl
          p-4
          mb-4
          overflow-x-auto
        ">

          <pre className="
            text-xs
            text-slate-300
            whitespace-pre-wrap
          ">
{JSON.stringify(log.metadata, null, 2)}
          </pre>

        </div>

        {/* FOOTER */}
        <div className="
          flex
          flex-col
          lg:flex-row
          lg:items-center
          lg:justify-between
          gap-3
          text-xs
          text-slate-500
        ">

          <div className="flex items-center gap-2">

            <span className="
              px-2
              py-1
              rounded-lg
              bg-slate-900
              border
              border-slate-700
            ">
              {log.actor_id === "system"
                ? "SYSTEM"

                : "AUDIT"}
            </span>

            <span>
              ID: {log.id}
            </span>

          </div>

          <span>
            🕒 {new Date(log.created_at).toLocaleString()}
          </span>

        </div>

      </div>
    )
  })}

</div>

    </div>

  </main>
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
      "bg-blue-500/10 border-blue-500/20 text-blue-300",

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
        rounded-xl
        p-4
        shadow-xl
      `}
    >

      <p className="text-sm text-slate-400">
        {title}
      </p>

      <p className="
        text-2xl
        font-black
        mt-1
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