'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/src/lib/supabase'

export default function AdminCampaigns() {

  const [data, setData] = useState<any[]>([])
  const [loadingId, setLoadingId] = useState<string | null>(null)

  useEffect(() => {
    load()
  }, [])

  const load = async () => {
    try {
      const res = await fetch('/api/admin/campaigns')
      const json = await res.json()
      setData(json || [])
    } catch (err) {
      console.error("❌ LOAD ERROR:", err)
    }
  }

  const handleAction = async (campaign_id: string, action: string) => {

    const confirmMsg = {
      delete: "¿Eliminar campaña?",
      block: "¿Bloquear campaña?",
      activate: "¿Activar campaña?"
    }[action]

    if (!confirm(confirmMsg)) return

    try {
      setLoadingId(campaign_id)

      // 🔐 TOKEN (CRÍTICO)
      const { data: sessionData } = await supabase.auth.getSession()
      const token = sessionData?.session?.access_token

      if (!token) {
        alert("Sesión inválida")
        return
      }

      const res = await fetch('/api/admin/campaigns/manage', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` // 🔥 FIX CLAVE
        },
        body: JSON.stringify({ campaign_id, action })
      })

      const result = await res.json()

      if (!res.ok) {
        console.error("❌ ERROR API:", result)
        alert(result.error || "Error ejecutando acción")
        return
      }

      // 🔄 REFRESH
      await load()

    } catch (err) {
      console.error("❌ ERROR FRONT:", err)
      alert("Error ejecutando acción")
    } finally {
      setLoadingId(null)
    }
  }

  return (
    <div className="p-6 text-white bg-slate-950 min-h-screen">

      <h1 className="text-2xl font-bold mb-6">🚀 Campañas</h1>

      {data.map(c => (
        <div
          key={c.id}
          className="border border-slate-800 p-4 rounded-xl mb-4 bg-slate-900"
        >

          <p className="font-bold text-lg">{c.title}</p>

          <p className="text-sm text-slate-400 mb-2">
            {c.description}
          </p>

          <p className="text-sm">
            Estado: <b>{c.status}</b>
          </p>

          <p className="text-sm mb-3">
            Recaudado: ${Number(c.total_raised || 0).toLocaleString()}
          </p>

          <div className="flex flex-wrap gap-2 mb-2">

            <button
              onClick={() => handleAction(c.id, 'activate')}
              disabled={loadingId === c.id}
              className={`px-3 py-1 rounded text-sm ${
                loadingId === c.id
                  ? "bg-gray-500"
                  : "bg-green-600 hover:bg-green-700"
              }`}
            >
              Activar
            </button>

            <button
              onClick={() => handleAction(c.id, 'block')}
              disabled={loadingId === c.id}
              className={`px-3 py-1 rounded text-sm ${
                loadingId === c.id
                  ? "bg-gray-500"
                  : "bg-yellow-600 hover:bg-yellow-700"
              }`}
            >
              Bloquear
            </button>

            <button
              onClick={() => handleAction(c.id, 'delete')}
              disabled={loadingId === c.id}
              className={`px-3 py-1 rounded text-sm ${
                loadingId === c.id
                  ? "bg-gray-500"
                  : "bg-red-600 hover:bg-red-700"
              }`}
            >
              Eliminar
            </button>

          </div>

          <a
            href={`/admin/campaign/${c.id}`}
            className="text-blue-400 text-sm inline-block"
          >
            Ver detalle →
          </a>

          {loadingId === c.id && (
            <p className="text-xs text-slate-400 mt-2">
              Procesando...
            </p>
          )}

        </div>
      ))}

    </div>
  )
}