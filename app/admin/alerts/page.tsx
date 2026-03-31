"use client"

import { useEffect, useState } from "react"

export default function AlertsPage() {
  const [alerts, setAlerts] = useState<any[]>([])

  useEffect(() => {
    loadAlerts()
  }, [])

  const loadAlerts = async () => {
    try {
      const res = await fetch("/api/admin/alerts")
      const data = await res.json()
      setAlerts(data || [])
    } catch (e) {
      console.error("error loading alerts", e)
    }
  }

  return (
    <div className="min-h-screen bg-black text-white p-10">
      <h1 className="text-3xl font-bold mb-6">
        🚨 Alertas de fraude
      </h1>

      <div className="space-y-4">
        {alerts.map((a) => (
          <div
            key={a.id}
            className="border border-red-500 p-4 rounded-xl"
          >
            <p className="text-sm text-gray-400">
              {new Date(a.created_at).toLocaleString()}
            </p>

            <p className="font-bold text-red-400">
              {a.action}
            </p>

            <pre className="text-xs mt-2 overflow-auto">
              {JSON.stringify(a.metadata, null, 2)}
            </pre>
          </div>
        ))}

        {alerts.length === 0 && (
          <p className="text-gray-400">
            No hay alertas aún
          </p>
        )}
      </div>
    </div>
  )
}
