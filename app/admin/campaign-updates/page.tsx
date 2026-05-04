'use client'

import { useEffect, useState } from 'react'

export default function AdminCampaignUpdatesPage() {

  const [updates, setUpdates] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const load = async () => {
    try {
      const res = await fetch('/api/admin/campaign-updates')
      const data = await res.json()
      setUpdates(data || [])
    } catch (err) {
      console.error(err)
      setUpdates([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  const approve = async (id: string) => {
    await fetch('/api/admin/campaign-updates', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, action: 'approve' })
    })
    load()
  }

  const reject = async (id: string) => {
    await fetch('/api/admin/campaign-updates', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, action: 'reject' })
    })
    load()
  }

  if (loading) {
    return <div className="p-6 text-white">Cargando...</div>
  }

  return (
    <main className="p-6 bg-slate-950 text-white min-h-screen">

      <h1 className="text-2xl font-bold mb-6">
        🛡️ Cambios pendientes de campañas
      </h1>

      {updates.length === 0 && (
        <p className="text-gray-400">
          No hay cambios pendientes
        </p>
      )}

      {updates.map((u) => (
        <div key={u.id} className="bg-slate-900 p-4 rounded-xl mb-4">

          <p className="text-xs text-gray-400">
            Campaign ID: {u.campaign_id}
          </p>

          <h2 className="font-bold text-lg mt-1">
            {u.title || 'Sin título'}
          </h2>

          <p className="text-sm text-gray-400 mt-2 line-clamp-3">
            {u.description}
          </p>

          {/* IMÁGENES */}
          {u.images?.length > 0 && (
            <div className="flex gap-2 mt-3 overflow-x-auto">
              {u.images.map((img: string, i: number) => (
                <img
                  key={i}
                  src={img}
                  className="h-16 w-16 object-cover rounded"
                />
              ))}
            </div>
          )}

          <div className="flex gap-2 mt-4">

            <button
              onClick={() => approve(u.id)}
              className="bg-primary px-4 py-1 rounded"
            >
              Aprobar
            </button>

            <button
              onClick={() => reject(u.id)}
              className="bg-red-600 px-4 py-1 rounded"
            >
              Rechazar
            </button>

          </div>

        </div>
      ))}

    </main>
  )
}