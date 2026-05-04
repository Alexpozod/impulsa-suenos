'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

export default function CampaignsPage() {

  const [campaigns, setCampaigns] = useState<any[]>([])
  const [filter, setFilter] = useState<'all' | 'goal'>('all')
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [sort, setSort] = useState<'recent' | 'top' | 'progress'>('recent')
  const [category, setCategory] = useState<string>('all')

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

    const filtered = campaigns
    .filter((c) => {

      const matchesFilter =
        filter === 'all' ? true : c.mode === filter

      const matchesSearch =
        c.title?.toLowerCase().includes(search.toLowerCase()) ||
        c.description?.toLowerCase().includes(search.toLowerCase())

      const matchesCategory =
  category === 'all' ? true : c.category === category

      return matchesFilter && matchesSearch && matchesCategory
    })
    .sort((a, b) => {

      if (sort === 'top') {
        return (b.current_amount || 0) - (a.current_amount || 0)
      }

      if (sort === 'progress') {
        const progA = a.goal_amount ? (a.current_amount / a.goal_amount) : 0
        const progB = b.goal_amount ? (b.current_amount / b.goal_amount) : 0
        return progB - progA
      }

      return new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime()
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
              Apoya causas reales y cambia vidas hoy
            </p>
          </div>

          {/* BUSCADOR */}
          <input
            type="text"
            placeholder="Buscar campañas..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full md:w-[320px] px-4 py-2 rounded-xl border border-gray-200 bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
          />

          {/* FILTROS */}
          <div className="flex flex-wrap gap-3">

            {/* TIPO */}
            {[
              { key: 'all', label: 'Todas' },
              { key: 'goal', label: 'Donaciones' }
            ].map((f) => (
              <button
                key={f.key}
                onClick={() => setFilter(f.key as any)}
                className={`px-5 py-2 rounded-full text-sm font-semibold transition ${
                  filter === f.key
                    ? 'bg-green-600 text-white'
                    : 'bg-white border text-gray-600'
                }`}
              >
                {f.label}
              </button>
            ))}

            {/* CATEGORÍAS */}
            {[
  { key: 'general', label: 'General' },
  { key: 'salud', label: 'Salud' },
  { key: 'educacion', label: 'Educación' },
  { key: 'emergencia', label: 'Urgente' },
  { key: 'deportes', label: 'Deportes' },
  { key: 'negocios', label: 'Negocios' },
  { key: 'medio-ambiente', label: 'Medio Ambiente' }
].map((cat) => (
              <button
                key={cat.key}
                onClick={() => setCategory(cat.key as any)}
                className={`px-4 py-2 rounded-full text-xs font-medium transition ${
  category === cat.key
    ? 'bg-green-600 text-white'
    : 'bg-white border text-gray-600 hover:bg-gray-100'
}`}
              >
                {cat.label}
              </button>
            ))}

            {/* ORDEN */}
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as any)}
              className="px-4 py-2 rounded-xl border text-sm bg-white"
            >
              <option value="recent">Más recientes</option>
              <option value="top">Más donadas</option>
              <option value="progress">Casi completadas</option>
            </select>

          </div>

        </div>

        {/* LOADING */}
        {loading && (
          <div className="text-center py-20 text-gray-500">
            Cargando campañas...
          </div>
        )}

        {/* GRID */}
        <div className="grid md:grid-cols-3 gap-6">

          {filtered.map((c) => {

            const progress = c.goal_amount
              ? Math.min(((c.current_amount || 0) / c.goal_amount) * 100, 100)
              : 0

            const isTrending = (c.current_amount || 0) > 50000
            const isUrgent = progress > 80

            return (
              <div
                key={c.id}
                onClick={() => router.push(`/campaign/${c.id}`)}
                className="group bg-white rounded-2xl border overflow-hidden cursor-pointer hover:shadow-lg transition hover:-translate-y-1"
              >

                <div className="relative">

                  <img
                    src={c.image_url || "https://via.placeholder.com/400"}
                    className="w-full h-44 object-cover"
                  />

                  {isTrending && (
                    <div className="absolute top-3 left-3 bg-black text-white text-xs px-2 py-1 rounded-full">
                      🔥 Trending
                    </div>
                  )}

                  {isUrgent && (
                    <div className="absolute top-3 right-3 bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                      Urgente
                    </div>
                  )}

                </div>

                <div className="p-4">

                  <h2 className="font-semibold text-sm mb-1 line-clamp-1">
                    {c.title}
                  </h2>

                  <p className="text-xs text-gray-500 mb-3 line-clamp-2">
                    {c.description}
                  </p>

                  <div className="mb-2">
                    <div className="h-2 bg-gray-100 rounded-full">
                      <div
                        className="h-2 bg-green-600"
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

                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      router.push(`/campaign/${c.id}`)
                    }}
                    className="w-full py-2 rounded-lg bg-green-600 text-white text-xs font-semibold"
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