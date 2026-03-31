"use client"

import { useEffect, useState } from "react"

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

  async function fetchLogs() {
    const res = await fetch("/api/audit-log/list")
    const data = await res.json()
    setLogs(data.logs || [])
  }

  useEffect(() => {
    fetchLogs()

    // 🔴 LIVE MODE (polling simple estable en Vercel)
    const interval = setInterval(() => {
      fetchLogs()
    }, 3000)

    return () => clearInterval(interval)
  }, [])

  const filteredLogs =
    filter === "all"
      ? logs
      : logs.filter((l) => l.action === filter)

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-xl font-bold">Audit Dashboard (Live)</h1>

      {/* FILTERS */}
      <div className="flex gap-2 flex-wrap">
        {["all", "payout.approved", "payment.success", "campaign.flagged"].map(
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

      {/* LOG STREAM */}
      <div className="space-y-2 mt-4">
        {filteredLogs.map((log) => (
          <div
            key={log.id}
            className="border p-3 rounded bg-white shadow-sm"
          >
            <div className="flex justify-between">
              <span className="font-semibold">{log.action}</span>
              <span className="text-xs text-gray-500">
                {new Date(log.created_at).toLocaleString()}
              </span>
            </div>

            <div className="text-sm text-gray-600">
              entity: {log.entity} | id: {log.entity_id}
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
