'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/src/lib/supabase'

type Campaign = {
  id: string
  title: string
  description: string
  status: string
  total_raised: number

  goal_amount?: number

  user_email?: string

  created_at?: string

  image_url?: string

  images?: string[]
}

export default function AdminCampaigns() {

  const [data, setData] = useState<Campaign[]>([])
  const [loadingId, setLoadingId] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [statusFilter, setStatusFilter] = useState("active")
  const [search, setSearch] = useState("")

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
      setLoading(true)

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

      setLoading(false)
    } catch (err) {
      console.error("❌ LOAD ERROR:", err)
      setData([])
      setLoading(false)
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

<div className="grid md:grid-cols-4 gap-4 mb-6">

  <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
    <p className="text-sm text-slate-400">Activas</p>
    <p className="text-2xl font-bold text-green-400">
      {counts.active}
    </p>
  </div>

  <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
    <p className="text-sm text-slate-400">Bloqueadas</p>
    <p className="text-2xl font-bold text-yellow-300">
      {counts.blocked}
    </p>
  </div>

  <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
    <p className="text-sm text-slate-400">Eliminadas</p>
    <p className="text-2xl font-bold text-red-400">
      {counts.deleted}
    </p>
  </div>

  <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
    <p className="text-sm text-slate-400">Total</p>
    <p className="text-2xl font-bold text-primary">
      {counts.all}
    </p>
  </div>

</div>

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
                ? "bg-primary text-white"
                : "bg-slate-800 hover:bg-slate-700"
            }`}
          >
            {tab.label} ({tab.count})
          </button>
        ))}

      </div>

<div className="mb-6">

  <input
    type="text"
    placeholder="Buscar campaña..."
    value={search}
    onChange={(e) => setSearch(e.target.value)}
    className="
      w-full
      bg-slate-900
      border
      border-slate-800
      rounded-xl
      px-4
      py-3
      text-sm
      text-white
      outline-none
      focus:border-primary
    "
  />

</div>

{loading && (
  <p className="text-sm text-slate-400 mb-4">
    Cargando campañas...
  </p>
)}

      {/* LISTADO */}
      {data
  .filter((c) =>
    (c.title || "").toLowerCase().includes(search.toLowerCase()) ||
    (c.description || "").toLowerCase().includes(search.toLowerCase())
  )
  .map(c => (
        <div
          key={c.id}
          className="border border-slate-800 p-4 rounded-xl mb-4 bg-slate-900"
        >

          <div className="flex gap-4">

  {(c.image_url || c.images?.[0]) && (

    <img
      src={c.image_url || c.images?.[0]}
      alt={c.title}
      className="
        w-28
        h-28
        rounded-xl
        object-cover
        border
        border-slate-800
      "
    />

  )}

  <div className="flex-1">

    <p className="font-bold text-lg">
      {c.title}
    </p>

    <p className="text-sm text-slate-400 mb-2">
      {c.description}
    </p>

  </div>

</div>

          <div className="mb-2">

  <span
    className={`px-2 py-1 rounded-full text-xs font-medium border

      ${
        c.status === "active"
          ? "bg-green-500/10 border-green-500/30 text-green-300"

        : c.status === "blocked"
          ? "bg-yellow-500/10 border-yellow-500/30 text-yellow-300"

        : "bg-red-500/10 border-red-500/30 text-red-300"
      }

    `}
  >
    {c.status}
  </span>

</div>

          <p className="text-sm mb-3">
            Recaudado: ${Number(c.total_raised || 0).toLocaleString()}
          </p>

<div className="space-y-1 mb-4 text-sm">

  <p className="text-slate-300">
    🎯 Meta:
    <span className="text-white font-medium ml-1">
      ${Number(c.goal_amount || 0).toLocaleString()}
    </span>
  </p>

  <p className="text-slate-300 break-all">
    👤 Creador:
    <span className="text-white font-medium ml-1">
      {c.user_email || "No disponible"}
    </span>
  </p>

  <p className="text-slate-300">
    📅 Creada:
    <span className="text-white font-medium ml-1">
      {new Date(c.created_at).toLocaleDateString()}
    </span>
  </p>

</div>

          <div className="flex flex-wrap gap-2">

            {c.status !== "active" && (
              <button
                onClick={() => handleAction(c.id, 'activate')}
                disabled={loadingId === c.id}
                className="bg-primary text-white px-3 py-1 rounded text-sm hover:bg-primaryHover"
              >
                Activar
              </button>
            )}

            {c.status !== "blocked" && (
              <button
                onClick={() => handleAction(c.id, 'block')}
                disabled={loadingId === c.id}
                className="bg-yellow-500/20 border border-yellow-500/30 text-yellow-300 px-3 py-1 rounded text-sm"
              >
                Bloquear
              </button>
            )}

            {c.status !== "deleted" && (
              <button
                onClick={() => handleAction(c.id, 'delete')}
                disabled={loadingId === c.id}
                className="bg-red-500/20 border border-red-500/30 text-red-400 px-3 py-1 rounded text-sm hover:bg-red-500/30"
              >
                Eliminar
              </button>
            )}

            {c.status === "deleted" && (
              <button
                onClick={() => handleAction(c.id, 'restore')}
                disabled={loadingId === c.id}
                className="bg-gray-700 hover:bg-gray-600 px-3 py-1 rounded text-sm"
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