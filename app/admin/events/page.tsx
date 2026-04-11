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
      <div className="p-6 text-white bg-slate-950 min-h-screen">
        Cargando eventos...
      </div>
    )
  }

  return (
    <main className="p-6 bg-slate-950 text-white min-h-screen">

      <h1 className="text-2xl font-bold mb-6">
        📡 Eventos del sistema
      </h1>

      {events.length === 0 && (
        <p className="text-slate-400">
          No hay eventos registrados
        </p>
      )}

      <div className="space-y-3">

        {events.map((e) => {

          const color =
            e.severity === "critical"
              ? "bg-red-900 border-red-700"
              : e.severity === "warning"
              ? "bg-yellow-900 border-yellow-700"
              : "bg-slate-900 border-slate-800"

          return (
            <div
              key={e.id}
              className={`p-4 rounded-xl border ${color}`}
            >

              <p className="text-xs opacity-60">
                {new Date(e.created_at).toLocaleString()}
              </p>

              <p className="font-semibold mt-1">
                {e.type}
              </p>

              <p className="text-sm opacity-90">
                {e.message}
              </p>

            </div>
          )
        })}

      </div>

    </main>
  )
}