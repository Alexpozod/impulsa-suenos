'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/src/lib/supabase'

export default function NotificationsPage() {

  const [notifications, setNotifications] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    load()
  }, [])

  const load = async () => {

    const { data: sessionData } = await supabase.auth.getSession()
    const token = sessionData?.session?.access_token

    const res = await fetch('/api/notifications', {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })

    const data = await res.json()
    setNotifications(data || [])
    setLoading(false)
  }

  const markAsRead = async (id: string) => {

    await fetch('/api/notifications', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id })
    })

    setNotifications(prev =>
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    )
  }

  const getMessage = (type: string) => {

    switch (type) {
      case "campaign_update_approved":
        return "✅ Tus cambios fueron aprobados"
      case "campaign_update_rejected":
        return "❌ Tus cambios fueron rechazados"
      case "payment_received":
        return "💰 Recibiste una donación"
      default:
        return "🔔 Nueva notificación"
    }
  }

  if (loading) return <div className="p-6">Cargando...</div>

  return (
    <main className="p-6 bg-slate-950 text-white min-h-screen">

      <h1 className="text-2xl font-bold mb-6">
        🔔 Notificaciones
      </h1>

      {notifications.length === 0 && (
        <p className="text-gray-400">No tienes notificaciones</p>
      )}

      <div className="space-y-3">

        {notifications.map(n => (
          <div
            key={n.id}
            className={`p-4 rounded-xl ${
              n.read ? "bg-slate-900" : "bg-slate-800 border border-green-500"
            }`}
          >

            <p className="text-sm">

  {/* ✅ PRIORIDAD REAL */}
  {n.title || getMessage(n.type)}

</p>

{/* 🔥 MENSAJE INTELIGENTE (FIX REAL) */}
{(() => {
  let msg = n.message || ""

  // ❌ si viene con $0 lo corregimos
  if (msg.includes("$0")) {
    msg = "Recibiste una donación en tu campaña"
  }

  return msg ? (
    <p className="text-xs text-gray-400 mt-1">
      {msg}
    </p>
  ) : null
})()}
            <div className="flex justify-between mt-2 text-xs text-gray-400">

              <span>
                {new Date(n.created_at).toLocaleString()}
              </span>

              {!n.read && (
                <button
                  onClick={() => markAsRead(n.id)}
                  className="text-green-400"
                >
                  Marcar como leído
                </button>
              )}

            </div>

          </div>
        ))}

      </div>

    </main>
  )
}