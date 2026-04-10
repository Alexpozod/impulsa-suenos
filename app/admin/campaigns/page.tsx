'use client'

import { useEffect, useState } from 'react'

export default function AdminCampaigns() {

  const [data, setData] = useState<any[]>([])
  const [loadingId, setLoadingId] = useState<string | null>(null)

  useEffect(() => {
    load()
  }, [])

  const load = async () => {
    const res = await fetch('/api/admin/campaigns')
    const json = await res.json()
    setData(json || [])
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

      await fetch('/api/admin/campaigns/manage', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ campaign_id, action })
      })

      await load()

    } catch (err) {
      console.error("Error acción campaña", err)
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

          {/* ACCIONES */}
          <div className="flex flex-wrap gap-2 mb-2">

            <button
              onClick={() => handleAction(c.id, 'activate')}
              disabled={loadingId === c.id}
              className="bg-green-600 hover:bg-green-700 px-3 py-1 rounded text-sm"
            >
              Activar
            </button>

            <button
              onClick={() => handleAction(c.id, 'block')}
              disabled={loadingId === c.id}
              className="bg-yellow-600 hover:bg-yellow-700 px-3 py-1 rounded text-sm"
            >
              Bloquear
            </button>

            <button
              onClick={() => handleAction(c.id, 'delete')}
              disabled={loadingId === c.id}
              className="bg-red-600 hover:bg-red-700 px-3 py-1 rounded text-sm"
            >
              Eliminar
            </button>

          </div>

          {/* DETALLE */}
          <a
            href={`/admin/campaign/${c.id}`}
            className="text-blue-400 text-sm inline-block"
          >
            Ver detalle →
          </a>

          {/* LOADING */}
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