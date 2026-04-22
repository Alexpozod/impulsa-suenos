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

  /* =========================
     🔥 LOAD INICIAL
  ========================= */
  async function loadInitial() {
    try {
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

    } catch (err) {
      console.error("❌ audit load error:", err)
    }
  }

  /* =========================
     ⚡ REALTIME
  ========================= */
  useEffect(() => {

    loadInitial()

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
        }
      )
      .subscribe()

    return () => {
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

  return (
    <div className="p-6 space-y-6 text-white">

      {/* HEADER */}
      <h1 className="text-2xl font-bold">
        🚀 Audit Dashboard (LIVE)
      </h1>

      {/* ALERTA GLOBAL */}
      {errors > 0 && (
        <div className="bg-red-600 text-white p-3 rounded">
          🚨 Hay errores activos en el sistema
        </div>
      )}

      {/* MÉTRICAS */}
      <div className="flex gap-4 flex-wrap">

        <div className="bg-red-100 px-4 py-2 rounded">
          ❌ Errores: {errors}
        </div>

        <div className="bg-yellow-100 px-4 py-2 rounded">
          ⚠️ Warnings: {warnings}
        </div>

        <div className="bg-green-100 px-4 py-2 rounded">
          📊 Eventos: {logs.length}
        </div>

      </div>

      {/* FILTROS */}
      <div className="flex gap-2 flex-wrap">
        {filters.map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1 border rounded ${
              filter === f ? "bg-black text-white" : ""
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {/* STREAM */}
      <div className="space-y-3">
        {filtered.map((log) => {

          const isError = log.action?.includes("error")
          const isWarning = log.action?.includes("warning")

          return (
            <div
              key={log.id}
              className={`border p-4 rounded shadow-sm text-black ${
  isError
    ? "bg-red-50 border-red-300"
    : isWarning
    ? "bg-yellow-50 border-yellow-300"
    : "bg-white"
}`}
            >

              {/* HEADER LOG */}
              <div className="flex justify-between items-center">
                <div className="flex gap-2 items-center">
                  <span className="font-semibold text-black">
                    {log.action}
                  </span>

                  <span className="text-xs px-2 py-0.5 rounded bg-gray-200">
                    {log.actor_id === "system" ? "SYSTEM" : "AUDIT"}
                  </span>
                </div>

                <span className="text-xs text-gray-500">
                  {new Date(log.created_at).toLocaleTimeString()}
                </span>
              </div>

              {/* ENTITY */}
              <div className="text-sm text-gray-700 mt-1">
                {log.entity} → {log.entity_id || "-"}
              </div>

              {/* METADATA */}
              <pre className="text-xs bg-gray-100 text-black p-2 mt-2 rounded overflow-auto">
                {JSON.stringify(log.metadata, null, 2)}
              </pre>

            </div>
          )
        })}
      </div>

    </div>
  )
}