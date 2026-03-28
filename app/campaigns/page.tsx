'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

export default function CampaignsPage() {

  const [campaigns, setCampaigns] = useState<any[]>([])
  const [filter, setFilter] = useState<'all' | 'tickets' | 'goal'>('all')

  const router = useRouter()

  useEffect(() => {
    load()
  }, [])

  const load = async () => {
    const res = await fetch('/api/campaigns')
    const data = await res.json()
    setCampaigns(data || [])
  }

  // 🎯 FILTRO
  const filtered = campaigns.filter((c) => {
    if (filter === 'all') return true
    return c.mode === filter
  })

  return (
    <main className="min-h-screen bg-gray-50 px-6 py-10">

      <div className="max-w-7xl mx-auto">

        {/* HEADER */}
        <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-10 gap-4">

          <div>
            <h1 className="text-3xl font-bold">
              🚀 Explorar campañas
            </h1>
            <p className="text-gray-500 text-sm">
              Encuentra causas para apoyar o participa en sorteos
            </p>
          </div>

          {/* FILTROS */}
          <div className="flex gap-2 bg-white border rounded-xl p-1 shadow-sm">

            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-lg text-sm ${
                filter === 'all'
                  ? 'bg-green-600 text-white'
                  : 'text-gray-600'
              }`}
            >
              Todas
            </button>

            <button
              onClick={() => setFilter('goal')}
              className={`px-4 py-2 rounded-lg text-sm ${
                filter === 'goal'
                  ? 'bg-green-600 text-white'
                  : 'text-gray-600'
              }`}
            >
              Donaciones
            </button>

            <button
              onClick={() => setFilter('tickets')}
              className={`px-4 py-2 rounded-lg text-sm ${
                filter === 'tickets'
                  ? 'bg-green-600 text-white'
                  : 'text-gray-600'
              }`}
            >
              Sorteos
            </button>

          </div>

        </div>

        {/* GRID */}
        <div className="grid md:grid-cols-3 gap-8">

          {filtered.map((c) => {

            const progress = c.goal_amount
              ? Math.min(((c.current_amount || 0) / c.goal_amount) * 100, 100)
              : 0

            const isEndingSoon =
              c.end_date &&
              new Date(c.end_date).getTime() - Date.now() < 1000 * 60 * 60 * 24

            return (
              <div
                key={c.id}
                onClick={() => router.push(`/campaigns/${c.id}`)}
                className="group bg-white rounded-2xl border overflow-hidden cursor-pointer hover:shadow-xl transition-all hover:-translate-y-1"
              >

                {/* IMAGE */}
                <div className="relative">

                  <img
                    src={c.image_url || "https://via.placeholder.com/400"}
                    className="w-full h-48 object-cover group-hover:scale-105 transition"
                  />

                  {/* BADGES */}
                  <div className="absolute top-3 left-3 flex flex-col gap-2">

                    {c.mode === 'tickets' && (
                      <span className="bg-purple-600 text-white text-xs px-2 py-1 rounded">
                        🎟️ Sorteo
                      </span>
                    )}

                    {c.mode === 'goal' && (
                      <span className="bg-blue-600 text-white text-xs px-2 py-1 rounded">
                        ❤️ Donación
                      </span>
                    )}

                    {progress > 70 && (
                      <span className="bg-red-500 text-white text-xs px-2 py-1 rounded">
                        🔥 Trending
                      </span>
                    )}

                    {isEndingSoon && (
                      <span className="bg-yellow-500 text-white text-xs px-2 py-1 rounded">
                        ⏳ Termina pronto
                      </span>
                    )}

                  </div>

                </div>

                {/* CONTENT */}
                <div className="p-5">

                  <h2 className="text-lg font-bold mb-1 line-clamp-1">
                    {c.title}
                  </h2>

                  <p className="text-sm text-gray-500 mb-4 line-clamp-2">
                    {c.description}
                  </p>

                  {/* PROGRESS */}
                  <div className="mb-2">

                    <div className="w-full h-2 bg-gray-200 rounded-full">
                      <div
                        className="h-2 bg-green-600 rounded-full transition-all"
                        style={{ width: `${progress}%` }}
                      />
                    </div>

                  </div>

                  <div className="flex justify-between text-sm font-medium mb-3">

                    <span className="text-green-600 font-bold">
                      ${Number(c.current_amount || 0).toLocaleString()}
                    </span>

                    <span className="text-gray-400">
                      de ${Number(c.goal_amount).toLocaleString()}
                    </span>

                  </div>

                  {/* EXTRA INFO */}
                  {c.mode === 'tickets' && (
                    <div className="text-xs text-gray-500 mb-3">
                      🎟️ {c.max_tickets || '∞'} tickets
                    </div>
                  )}

                  {/* CTA */}
                  <button className="w-full py-3 rounded-lg font-semibold bg-green-600 text-white hover:bg-green-700 transition">
                    Ver campaña
                  </button>

                </div>

              </div>
            )
          })}

        </div>

        {/* EMPTY */}
        {filtered.length === 0 && (
          <div className="text-center text-gray-400 mt-20">
            No hay campañas disponibles
          </div>
        )}

      </div>

    </main>
  )
}
