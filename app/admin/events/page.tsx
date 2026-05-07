'use client'

import { useEffect, useState } from "react"

type Event = {
  id: string
  type: string
  severity: "info" | "warning" | "critical"
  message: string
  created_at: string
}

export default function AdminEventsPage() {

  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    load()
  }, [])

  const load = async () => {
    try {
      const res = await fetch("/api/admin/events")
      const data = await res.json()
      setEvents(data || [])
    } catch (err) {
      console.error("Error cargando eventos", err)
    } finally {
      setLoading(false)
    }
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
          Cargando eventos del sistema...
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

      {/* HEADER */}
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
      📡 System Events Center
    </h1>

    <p className="text-slate-400 mt-2">
      Monitoreo operativo y eventos internos de la plataforma
    </p>

  </div>

  {/* RIGHT */}
  <div className="flex flex-wrap gap-3">

    <StatusBadge
      color="blue"
      text={`${events.length} eventos`}
    />

    <StatusBadge
      color="yellow"
      text={`${events.filter(e => e.severity === "warning").length} warnings`}
    />

    <StatusBadge
      color="red"
      text={`${events.filter(e => e.severity === "critical").length} críticos`}
    />

  </div>

</div>

{/* SUMMARY */}
<div className="
  grid
  md:grid-cols-2
  xl:grid-cols-4
  gap-4
  mb-8
">

  <SummaryCard
    title="Eventos totales"
    value={events.length}
    color="blue"
  />

  <SummaryCard
    title="Críticos"
    value={
      events.filter(e => e.severity === "critical").length
    }
    color="red"
  />

  <SummaryCard
    title="Warnings"
    value={
      events.filter(e => e.severity === "warning").length
    }
    color="yellow"
  />

  <SummaryCard
    title="Info"
    value={
      events.filter(e => e.severity === "info").length
    }
    color="green"
  />

</div>

      {events.length === 0 && (
        <p className="text-slate-400">
          No hay eventos registrados
        </p>
      )}

      {/* EMPTY */}
{events.length === 0 && (

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
      📡
    </div>

    <h3 className="
      text-2xl
      font-bold
      text-white
      mb-2
    ">
      No existen eventos registrados
    </h3>

    <p className="text-slate-400">
      El sistema no reporta actividad reciente
    </p>

  </div>

)}

{/* EVENTS STREAM */}
<div className="
  space-y-4
  max-h-[900px]
  overflow-y-auto
  pr-2
">

  {events.map((e) => {

    const severityStyles =
      e.severity === "critical"

        ? {
            border: "border-red-500/30",
            bg: "bg-red-500/10",
            badge: "bg-red-500/10 border-red-500/20 text-red-300",
            icon: "🔴"
          }

        : e.severity === "warning"

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
        key={e.id}
        className={`
          ${severityStyles.bg}
          ${severityStyles.border}
          border
          rounded-2xl
          p-5
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
          gap-4
          mb-4
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
                {e.type?.replaceAll("_", " ")}
              </p>

              <p className="
                text-slate-400
                text-sm
                mt-1
              ">
                Evento operativo del sistema
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
            {e.severity.toUpperCase()}
          </div>

        </div>

        {/* MESSAGE */}
        <div className="
          bg-black/20
          border
          border-white/5
          rounded-xl
          p-4
          mb-4
        ">

          <p className="
            text-slate-200
            text-sm
            leading-relaxed
          ">
            {e.message}
          </p>

        </div>

        {/* FOOTER */}
        <div className="
          flex
          items-center
          justify-between
          text-xs
          text-slate-500
        ">

          <span>
            Event ID: {e.id}
          </span>

          <span>
            🕒 {new Date(e.created_at).toLocaleString()}
          </span>

        </div>

      </div>
    )
  })}

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