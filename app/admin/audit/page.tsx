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
     🔥 LOAD INICIAL (FIX)
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
      console.error("❌ error loading audit:", err)
    }
  }

  /* =========================
     🚀 USE EFFECT (ARREGLADO)
  ========================= */
  useEffect(() => {

    loadInitial() // 🔥 ESTO FALTABA

    // ⚡ REALTIME SOLO audit_logs
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
     🎯 FILTRO
  ========================= */
  const filtered =
    filter === "all"
      ? logs
      : logs.filter((l) => l.action === filter)

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-xl font-bold">
        Audit Dashboard (LIVE REALTIME)
      </h1>

      {/* FILTERS */}
      <div className="flex gap-2 flex-wrap">
        {["all", "payout_requested", "campaign_created", "notification_email_error"].map(
          (f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className="px-3 py-1 border rounded"
            >
              {f}
            </button>
          )
        )}
      </div>

      {/* STREAM */}
      <div className="space-y-2">
        {filtered.map((log) => (
          <div
            key={log.id}
            className="border p-3 rounded bg-white shadow-sm"
          >
            <div className="flex justify-between">
              <span className="font-semibold">{log.action}</span>
              <span className="text-xs text-gray-500">
                {new Date(log.created_at).toLocaleTimeString()}
              </span>
            </div>

            <div className="text-sm text-gray-600">
              {log.entity} → {log.entity_id}
            </div>

            <pre className="text-xs bg-gray-100 p-2 mt-2 rounded overflow-auto">
              {JSON.stringify(log.metadata, null, 2)}
            </pre>
          </div>
        ))}
      </div>
    </div>
  )
}