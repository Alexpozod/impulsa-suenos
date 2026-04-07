'use client'

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"

export default function HomePage() {

  const router = useRouter()
  const [campaigns, setCampaigns] = useState<any[]>([])

  useEffect(() => {
    fetch("/api/campaigns")
      .then(res => res.json())
      .then(setCampaigns)
      .catch(console.error)
  }, [])

  const handleCreateCampaign = () => {
    router.push("/create")
  }

  // 🔥 NORMALIZAR IMAGEN
  const buildImageUrl = (url: string) => {
    if (!url) return "https://via.placeholder.com/400"
    return url.replace(/\s/g, "%20")
  }

  // 🔥 SCORE INTELIGENTE (CORE DEL NEGOCIO)
  const getScore = (c: any) => {
    const current = Number(c.current_amount || 0)
    const goal = Number(c.goal_amount || 1)

    const progress = current / goal

    let score = 0

    // 💰 dinero (peso fuerte)
    score += progress * 50

    // 📈 volumen
    score += Math.log10(current + 1) * 20

    // ⏳ urgencia
    if (c.end_date) {
      const daysLeft = (new Date(c.end_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
      if (daysLeft > 0) {
        score += (1 / daysLeft) * 30
      }
    }

    // 🔥 actividad reciente
    if (c.last_donation_at) {
      const hours = (Date.now() - new Date(c.last_donation_at).getTime()) / (1000 * 60 * 60)
      if (hours < 24) {
        score += 40
      }
    }

    return score
  }

  // 🔥 ORDENAMIENTO INTELIGENTE
  const sorted = [...campaigns].sort((a, b) => getScore(b) - getScore(a))

  const featured = sorted.slice(0, 1)
  const trending = sorted.slice(1, 7)

  // 🔥 BADGES DINÁMICOS
  const getBadges = (c: any) => {
    const badges: string[] = []

    const current = Number(c.current_amount || 0)
    const goal = Number(c.goal_amount || 1)
    const progress = current / goal

    if (progress >= 0.8) badges.push("💰 Casi completada")
    if (progress >= 1) badges.push("🎉 Completada")

    if (c.end_date) {
      const daysLeft = (new Date(c.end_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
      if (daysLeft < 3) badges.push("⏳ Últimos días")
    }

    if (c.last_donation_at) {
      const hours = (Date.now() - new Date(c.last_donation_at).getTime()) / (1000 * 60 * 60)
      if (hours < 6) badges.push("🔥 Activa")
    }

    if (current > 100000) badges.push("🚀 Popular")

    return badges
  }

  return (
    <main className="bg-white">

      {/* HERO */}
      <section className="bg-gradient-to-br from-green-600 to-green-700 text-white py-24 px-6 text-center">

        <h1 className="text-4xl md:text-6xl font-extrabold mb-6 leading-tight">
          Cambia una vida hoy
        </h1>

        <p className="max-w-2xl mx-auto text-lg opacity-90 mb-8">
          Apoya causas reales, ayuda a personas y sé parte del cambio.
        </p>

        <div className="flex justify-center gap-4">
          <Link href="/campaigns" className="bg-white text-green-600 px-6 py-3 rounded-xl font-semibold">
            Explorar campañas
          </Link>

          <button
            onClick={handleCreateCampaign}
            className="border border-white px-6 py-3 rounded-xl font-semibold hover:bg-white hover:text-green-600 transition"
          >
            Crear campaña
          </button>
        </div>

        <p className="mt-6 text-sm opacity-80">
          🔥 Personas están donando en este momento
        </p>

      </section>

      {/* FEATURED */}
      {featured.map(c => {

        const image = c.images?.[0] || c.image_url
        const current = Number(c.current_amount || 0)
        const goal = Number(c.goal_amount || 0)

        const progress = goal > 0
          ? Math.min((current / goal) * 100, 100)
          : 0

        const badges = getBadges(c)

        return (
          <section key={c.id} className="py-20 px-6 bg-green-50">

            <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-10 items-center">

              <div className="relative">
                <img
                  src={buildImageUrl(image)}
                  className="rounded-2xl w-full h-[380px] object-cover shadow"
                />

                {/* BADGES */}
                <div className="absolute top-4 left-4 flex flex-wrap gap-2">
                  {badges.map((b, i) => (
                    <span key={i} className="bg-white/90 text-xs px-3 py-1 rounded-full shadow">
                      {b}
                    </span>
                  ))}
                </div>
              </div>

              <div>

                <p className="text-green-600 font-semibold mb-2">
                  🔥 Campaña destacada
                </p>

                <h2 className="text-3xl font-bold mb-4 leading-tight">
                  {c.title}
                </h2>

                <p className="text-gray-600 mb-6 line-clamp-4">
                  {c.description}
                </p>

                <div className="mb-6">
                  <div className="h-2 bg-gray-200 rounded-full">
                    <div
                      className="h-2 bg-green-600 rounded-full"
                      style={{ width: `${progress}%` }}
                    />
                  </div>

                  <div className="flex justify-between text-sm mt-2">
                    <span className="text-green-600 font-bold">
                      ${current.toLocaleString()}
                    </span>
                    <span className="text-gray-500">
                      de ${goal.toLocaleString()}
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => router.push(`/campaign/${c.id}`)}
                  className="bg-green-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-green-700 transition"
                >
                  Ver campaña
                </button>

              </div>

            </div>

          </section>
        )
      })}

      {/* TRENDING */}
      <section className="py-20 px-6">

        <div className="max-w-7xl mx-auto">

          <h2 className="text-3xl font-bold mb-10 text-center">
            🔥 Campañas en tendencia
          </h2>

          <div className="grid md:grid-cols-3 gap-8">

            {trending.map(c => {

              const image = c.images?.[0] || c.image_url
              const current = Number(c.current_amount || 0)
              const goal = Number(c.goal_amount || 0)

              const progress = goal > 0
                ? Math.min((current / goal) * 100, 100)
                : 0

              const badges = getBadges(c)

              return (
                <div
                  key={c.id}
                  onClick={() => router.push(`/campaign/${c.id}`)}
                  className="border rounded-2xl overflow-hidden cursor-pointer hover:shadow-xl transition group"
                >

                  <div className="relative">

                    <img
                      src={buildImageUrl(image)}
                      className="h-52 w-full object-cover group-hover:scale-105 transition"
                    />

                    {/* BADGES */}
                    <div className="absolute top-3 left-3 flex flex-wrap gap-1">
                      {badges.slice(0, 2).map((b, i) => (
                        <span key={i} className="bg-white/90 text-[10px] px-2 py-1 rounded-full">
                          {b}
                        </span>
                      ))}
                    </div>

                  </div>

                  <div className="p-5">

                    <h3 className="font-semibold mb-2 line-clamp-2">
                      {c.title}
                    </h3>

                    <div className="h-2 bg-gray-200 rounded-full mb-2">
                      <div
                        className="h-2 bg-green-600 rounded-full"
                        style={{ width: `${progress}%` }}
                      />
                    </div>

                    <div className="flex justify-between text-sm">
                      <span className="text-green-600 font-bold">
                        ${current.toLocaleString()}
                      </span>
                      <span className="text-gray-500">
                        de ${goal.toLocaleString()}
                      </span>
                    </div>

                  </div>

                </div>
              )
            })}

          </div>

        </div>

      </section>

      {/* CTA FINAL */}
      <section className="py-24 text-center bg-gray-50">

        <h2 className="text-3xl font-bold mb-6">
          Empieza tu campaña hoy
        </h2>

        <p className="text-gray-600 mb-8">
          Miles de personas están listas para ayudarte
        </p>

        <button
          onClick={handleCreateCampaign}
          className="bg-green-600 text-white px-8 py-4 rounded-xl text-lg font-semibold hover:bg-green-700 transition"
        >
          Crear campaña
        </button>

      </section>

    </main>
  )
}