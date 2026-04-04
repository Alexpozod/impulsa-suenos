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
              Apoya causas reales o participa en sorteos
            </p>
          </div>

          {/* FILTROS */}
          <div className="flex gap-2 bg-white border rounded-xl p-1 shadow-sm">

            <button onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-lg text-sm ${filter === 'all' ? 'bg-green-600 text-white' : 'text-gray-600'}`}>
              Todas
            </button>

            <button onClick={() => setFilter('goal')}
              className={`px-4 py-2 rounded-lg text-sm ${filter === 'goal' ? 'bg-green-600 text-white' : 'text-gray-600'}`}>
              Donaciones
            </button>

            <button onClick={() => setFilter('tickets')}
              className={`px-4 py-2 rounded-lg text-sm ${filter === 'tickets' ? 'bg-green-600 text-white' : 'text-gray-600'}`}>
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

            return (
              <div
                key={c.id}
                onClick={() => router.push(`/campaign/${c.id}`)}
                className="group bg-white rounded-2xl border overflow-hidden cursor-pointer hover:shadow-xl transition hover:-translate-y-1"
              >

                <img
                  src={c.image_url || "https://via.placeholder.com/400"}
                  className="w-full h-48 object-cover"
                />

                <div className="p-5">

                  <h2 className="font-bold mb-1 line-clamp-1">
                    {c.title}
                  </h2>

                  <p className="text-sm text-gray-500 mb-3 line-clamp-2">
                    {c.description}
                  </p>

                  {/* PROGRESS */}
                  <div className="mb-2">
                    <div className="h-2 bg-gray-200 rounded-full">
                      <div
                        className="h-2 bg-green-600 rounded-full"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>

                  <div className="flex justify-between text-sm mb-3">
                    <span className="text-green-600 font-bold">
                      ${Number(c.current_amount || 0).toLocaleString()}
                    </span>
                    <span className="text-gray-400">
                      ${Number(c.goal_amount).toLocaleString()}
                    </span>
                  </div>

                  {/* CTA */}
                  <button className="w-full py-2 rounded-lg bg-green-600 text-white text-sm font-semibold hover:bg-green-700">
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