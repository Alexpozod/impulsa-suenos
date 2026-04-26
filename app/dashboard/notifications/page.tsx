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
     🎨 UI HELPERS (SaaS style)
  ========================= */

  const getIcon = (n: any) => {
    const type = (n.type || "").toLowerCase()

    if (type.includes("payment")) return "💰"
    if (type.includes("withdraw")) return "🏦"
    if (type.includes("kyc")) return "🛡️"
    if (type.includes("update")) return "📢"

    return "🔔"
  }

  const getBorder = (n: any) => {
    if (!n.read) return "border border-green-500"
    return ""
  }

  const getBg = (n: any) => {
    return n.read ? "bg-slate-900" : "bg-slate-800"
  }

  /* =========================
     🧠 MENSAJE INTELIGENTE
  ========================= */

  const buildMessage = (n: any) => {

    let msg = n.message || ""

    // 🔥 limpiar $0
    if (msg.includes("$0")) {
      msg = "Recibiste una donación en tu campaña"
    }

    return msg
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

        {notifications.map(n => {

          const message = buildMessage(n)

          return (
            <div
              key={n.id}
              className={`p-4 rounded-xl transition ${getBg(n)} ${getBorder(n)}`}
            >

              {/* HEADER */}
              <div className="flex items-start gap-3">

                {/* ICON */}
                <div className="text-xl mt-1">
                  {getIcon(n)}
                </div>

                {/* CONTENT */}
                <div className="flex-1">

                  {/* TITLE */}
                  <p className="text-sm font-semibold">
                    {n.title || "Nueva notificación"}
                  </p>

                  {/* MESSAGE */}
                  {message && (
                    <p className="text-xs text-gray-400 mt-1">
                      {message}
                    </p>
                  )}

                  {/* 💰 MONTO */}
                  {n.metadata?.amount > 0 && (
                    <p className="text-xs text-green-400 mt-1 font-semibold">
                      +${Number(n.metadata.amount).toLocaleString()}
                    </p>
                  )}

                  {/* 🏷 CAMPAÑA */}
                  {n.metadata?.campaign_title && (
                    <p className="text-[11px] text-gray-500 mt-1">
                      Campaña: {n.metadata.campaign_title}
                    </p>
                  )}

                </div>

              </div>

              {/* FOOTER */}
              <div className="flex justify-between mt-3 text-xs text-gray-500">

                <span>
                  {new Date(n.created_at).toLocaleString()}
                </span>

                {!n.read && (
                  <button
                    onClick={() => markAsRead(n.id)}
                    className="text-green-400 hover:underline"
                  >
                    Marcar como leído
                  </button>
                )}

              </div>

            </div>
          )
        })}

      </div>

    </main>
  )
}