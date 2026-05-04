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
    <div className="min-h-screen bg-black text-white p-8">

      <h1 className="text-3xl font-bold mb-6">
        🚨 Fraud Monitoring Dashboard
      </h1>

      {/* FILTROS */}
      <div className="flex gap-4 mb-6">

        <select
          value={severity}
          onChange={(e) => setSeverity(e.target.value)}
          className="bg-gray-900 border p-2 rounded"
        >
          <option value="">All severity</option>
          <option value="critical">Critical</option>
          <option value="warning">Warning</option>
        </select>

        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="bg-gray-900 border p-2 rounded"
        >
          <option value="open">Open</option>
          <option value="resolved">Resolved</option>
        </select>

      </div>

      {/* LISTA */}
      <div className="space-y-4">

        {alerts.map((a) => (
          <div
            key={a.id}
            className={`p-4 rounded-xl border ${
              a.severity === "critical"
                ? "border-red-500 bg-red-900/20"
                : "border-yellow-500 bg-yellow-900/20"
            }`}
          >

            <div className="flex justify-between items-center mb-2">
              <div className="font-bold">
                {a.type}
              </div>

              <div className="text-sm">
                {a.severity.toUpperCase()}
              </div>
            </div>

            <div className="text-sm text-gray-300 mb-2">
              Campaign: {a.campaign_id}
            </div>

            {a.score && (
              <div className="text-sm mb-2">
                Risk score: {a.score}
              </div>
            )}

            {a.flags && (
              <div className="text-xs text-red-300 mb-2">
                Flags: {JSON.stringify(a.flags)}
              </div>
            )}

            <div className="text-xs text-gray-500 mb-3">
              {new Date(a.created_at).toLocaleString()}
            </div>

            {a.status === "open" && (
              <button
                onClick={() => resolveAlert(a.id)}
                className="bg-primary px-3 py-1 rounded text-sm"
              >
                ✅ Mark as resolved
              </button>
            )}

          </div>
        ))}

      </div>

    </div>
  )
}