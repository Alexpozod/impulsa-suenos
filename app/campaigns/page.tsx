'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

export default function CampaignsPage() {

  const [campaigns, setCampaigns] = useState<any[]>([])
  const [filter, setFilter] = useState<'all' | 'tickets' | 'goal'>('all')
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)

  const router = useRouter()

  useEffect(() => {
    load()
  }, [])

  const load = async () => {
    try {
      const res = await fetch('/api/campaigns')
      const data = await res.json()
      setCampaigns(data || [])
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  const filtered = campaigns.filter((c) => {

    const matchesFilter =
      filter === 'all' ? true : c.mode === filter

    const matchesSearch =
      c.title?.toLowerCase().includes(search.toLowerCase()) ||
      c.description?.toLowerCase().includes(search.toLowerCase())

    return matchesFilter && matchesSearch
  })

  return (
    <main className="min-h-screen bg-gray-50 px-6 py-8">

      <div className="max-w-7xl mx-auto">

        {/* HEADER */}
        <div className="flex flex-col gap-6 mb-8">

          <div>
            <h1 className="text-3xl md:text-4xl font-extrabold">
              🚀 Explorar campañas
            </h1>
            <p className="text-gray-500 text-sm mt-1">
              Apoya causas reales o participa en sorteos
            </p>
          </div>

          {/* 🔍 BUSCADOR + FILTROS */}
          <div className="flex flex-col md:flex-row gap-4 md:items-center md:justify-between">

            {/* BUSCADOR */}
            <input
              type="text"
              placeholder="Buscar campañas..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full md:w-[300px] px-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
            />

            {/* FILTROS */}
            <div className="flex gap-2 bg-white border border-gray-100 rounded-xl p-1 shadow-sm">

              {[
                { key: 'all', label: 'Todas' },
                { key: 'goal', label: 'Donaciones' },
                { key: 'tickets', label: 'Sorteos' }
              ].map((f) => (
                <button
                  key={f.key}
                  onClick={() => setFilter(f.key as any)}
                  className={`px-4 py-2 rounded-lg text-sm transition-all ${
                    filter === f.key
                      ? 'bg-green-600 text-white shadow-sm'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  {f.label}
                </button>
              ))}

            </div>

          </div>

        </div>

        {/* LOADING */}
        {loading && (
          <div className="text-center py-20 text-gray-500">
            Cargando campañas...
          </div>
        )}

        {/* EMPTY */}
        {!loading && filtered.length === 0 && (
          <div className="text-center py-20">

            <p className="text-gray-500 mb-4">
              No encontramos campañas con esos filtros
            </p>

            <button
              onClick={() => router.push('/create')}
              className="bg-green-600 text-white px-6 py-3 rounded-xl text-sm font-semibold hover:bg-green-700 transition"
            >
              Crear campaña
            </button>

          </div>
        )}

        {/* GRID */}
        <div className="grid md:grid-cols-3 gap-6">

          {filtered.map((c) => {

            const progress = c.goal_amount
              ? Math.min(((c.current_amount || 0) / c.goal_amount) * 100, 100)
              : 0

            return (
              <div
                key={c.id}
                onClick={() => router.push(`/campaign/${c.id}`)}
                className="group bg-white rounded-2xl border border-gray-100 overflow-hidden cursor-pointer hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
              >

                {/* IMAGE */}
                <div className="relative overflow-hidden">

                  <img
                    src={c.image_url || "https://via.placeholder.com/400"}
                    className="w-full h-44 object-cover group-hover:scale-105 transition duration-500"
                  />

                  {/* OVERLAY */}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition" />

                  {/* BADGE */}
                  {c.mode === 'tickets' && (
                    <div className="absolute top-3 left-3 bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full font-medium">
                      🎁 Sorteo
                    </div>
                  )}

                </div>

                {/* CONTENT */}
                <div className="p-4">

                  <h2 className="font-semibold text-sm mb-1 line-clamp-1 text-gray-900">
                    {c.title || "Campaña"}
                  </h2>

                  <p className="text-xs text-gray-500 mb-3 line-clamp-2">
                    {c.description || "Sin descripción"}
                  </p>

                  {/* PROGRESS */}
                  <div className="mb-2">
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-green-500 to-green-600 transition-all"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>

                  <div className="flex justify-between text-xs mb-3">
                    <span className="text-green-600 font-bold">
                      ${Number(c.current_amount || 0).toLocaleString()}
                    </span>
                    <span className="text-gray-400">
                      ${Number(c.goal_amount || 0).toLocaleString()}
                    </span>
                  </div>

                  {/* CTA */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      router.push(`/campaign/${c.id}`)
                    }}
                    className="w-full py-2 rounded-lg bg-green-600 text-white text-xs font-semibold hover:bg-green-700 transition-all duration-200 hover:scale-[1.02]"
                  >
                    Ver campaña
                  </button>

                </div>

              </div>
            )
          })}

        </div>

      </div>

    </main>
  )
}