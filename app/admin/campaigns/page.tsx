'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/src/lib/supabase'

type Campaign = {
  id: string
  title: string
  description: string
  status: string
  total_raised: number
}

export default function AdminCampaigns() {

  const [data, setData] = useState<Campaign[]>([])
  const [loadingId, setLoadingId] = useState<string | null>(null)
  const [statusFilter, setStatusFilter] = useState("active")

  const [counts, setCounts] = useState({
    active: 0,
    blocked: 0,
    deleted: 0,
    all: 0
  })

  useEffect(() => {
    load()
  }, [statusFilter])

  const load = async () => {
    try {

      const res = await fetch(`/api/admin/campaigns?status=${statusFilter}`)
      const json = await res.json()

      // 🔥 FIX CRÍTICO (ANTES ESTABA MAL)
      setData(Array.isArray(json.data) ? json.data : [])

      // 🔥 YA NO HACEMOS DOBLE FETCH
      setCounts(json.stats || {
        active: 0,
        blocked: 0,
        deleted: 0,
        all: 0
      })

    } catch (err) {
      console.error("❌ LOAD ERROR:", err)
      setData([])
    }
  }

  const handleAction = async (campaign_id: string, action: string) => {

    const confirmMsg = {
      delete: "¿Eliminar campaña?",
      block: "¿Bloquear campaña?",
      activate: "¿Activar campaña?",
      restore: "¿Restaurar campaña?"
    }[action]

    if (!confirm(confirmMsg)) return

    try {
      setLoadingId(campaign_id)

      const { data: sessionData } = await supabase.auth.getSession()
      const token = sessionData?.session?.access_token

      const res = await fetch('/api/admin/campaigns/manage', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ campaign_id, action })
      })

      const result = await res.json()

      if (!res.ok) {
        console.error("❌ ERROR API:", result)
        alert(result.error || "Error")
        return
      }

      await load()

    } catch (err) {
      console.error("❌ ACTION ERROR:", err)
    } finally {
      setLoadingId(null)
    }
  }

  return (
    <div className="p-6 text-white bg-slate-950 min-h-screen">

      <h1 className="text-2xl font-bold mb-6">🚀 Campañas (Admin)</h1>

      {/* TABS */}
      <div className="flex gap-2 mb-6 flex-wrap">

        {[
          { key: "active", label: "Activas", count: counts.active },
          { key: "blocked", label: "Bloqueadas", count: counts.blocked },
          { key: "deleted", label: "Eliminadas", count: counts.deleted },
          { key: "all", label: "Todas", count: counts.all },
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => setStatusFilter(tab.key)}
            className={`px-4 py-2 rounded-lg text-sm ${
              statusFilter === tab.key
                ? "bg-green-600"
                : "bg-slate-800 hover:bg-slate-700"
            }`}
          >
            {tab.label} ({tab.count})
          </button>
        ))}

      </div>

      {/* LISTADO */}
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

          <div className="flex flex-wrap gap-2">

            {c.status !== "active" && (
              <button
                onClick={() => handleAction(c.id, 'activate')}
                disabled={loadingId === c.id}
                className="bg-green-600 px-3 py-1 rounded text-sm"
              >
                Activar
              </button>
            )}

            {c.status !== "blocked" && (
              <button
                onClick={() => handleAction(c.id, 'block')}
                disabled={loadingId === c.id}
                className="bg-yellow-600 px-3 py-1 rounded text-sm"
              >
                Bloquear
              </button>
            )}

            {c.status !== "deleted" && (
              <button
                onClick={() => handleAction(c.id, 'delete')}
                disabled={loadingId === c.id}
                className="bg-red-600 px-3 py-1 rounded text-sm"
              >
                Eliminar
              </button>
            )}

            {c.status === "deleted" && (
              <button
                onClick={() => handleAction(c.id, 'restore')}
                disabled={loadingId === c.id}
                className="bg-blue-600 px-3 py-1 rounded text-sm"
              >
                Restaurar
              </button>
            )}

          </div>

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