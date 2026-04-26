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

  /* =========================
     🎨 UI HELPERS
  ========================= */

  const getIcon = (n: any) => {
    const type = (n.type || "").toLowerCase()

    if (type.includes("payment")) return "💰"
    if (type.includes("withdraw")) return "🏦"
    if (type.includes("kyc")) return "🛡️"
    if (type.includes("update")) return "📢"

    return "🔔"
  }

  const cleanMessage = (msg: string) => {
    if (!msg) return ""
    if (msg.includes("$0")) return "Recibiste una donación en tu campaña"
    return msg
  }

  if (loading) return <div className="p-10 text-center">Cargando...</div>

  return (
    <main className="bg-white min-h-screen">

      <section className="max-w-4xl mx-auto px-6 py-10">

        <h1 className="text-2xl font-bold mb-6">
          🔔 Notificaciones
        </h1>

        {notifications.length === 0 && (
          <p className="text-gray-500">
            No tienes notificaciones
          </p>
        )}

        <div className="space-y-3">

          {notifications.map(n => {

            const message = cleanMessage(n.message)

            return (
              <div
                key={n.id}
                className={`p-4 rounded-xl border transition hover:shadow-sm ${
                  n.read ? "bg-white" : "bg-green-50 border-green-400"
                }`}
              >

                <div className="flex gap-3">

                  {/* ICON */}
                  <div className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-100">
                    <span className="text-lg">
                      {getIcon(n)}
                    </span>
                  </div>

                  {/* CONTENT */}
                  <div className="flex-1">

                    {/* TITLE */}
                    <div className="flex justify-between items-start">

                      <p className="font-semibold text-sm text-gray-800">
                        {n.title || "Nueva notificación"}
                      </p>

                      {!n.read && (
                        <button
                          onClick={() => markAsRead(n.id)}
                          className="text-xs text-green-600 hover:underline"
                        >
                          Marcar como leído
                        </button>
                      )}

                    </div>

                    {/* MESSAGE */}
                    {message && (
                      <p className="text-sm text-gray-600 mt-1">
                        {message}
                      </p>
                    )}

                    {/* 💰 MONTO */}
                    {n.metadata?.amount > 0 && (
                      <p className="text-sm text-green-600 font-semibold mt-1">
                        +${Number(n.metadata.amount).toLocaleString()}
                      </p>
                    )}

                    {/* 🏷 CAMPAÑA */}
                    {n.metadata?.campaign_title && (
                      <p className="text-xs text-gray-400 mt-1">
                        Campaña: {n.metadata.campaign_title}
                      </p>
                    )}

                    {/* FECHA */}
                    <p className="text-xs text-gray-400 mt-2">
                      {new Date(n.created_at).toLocaleString()}
                    </p>

                  </div>

                </div>

              </div>
            )
          })}

        </div>

      </section>

    </main>
  )
}