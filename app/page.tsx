'use client'

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"

// ✅ SOLO ESTO (SEGURO)
import LiveFeed from "./components/LiveFeed"

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

  const buildImageUrl = (url: string) => {
    if (!url) return "https://via.placeholder.com/400"
    return url.replace(/\s/g, "%20")
  }

  const getScore = (c: any) => {
    const current = Number(c.current_amount || 0)
    const goal = Number(c.goal_amount || 1)

    const progress = current / goal

    let score = 0

    score += progress * 50
    score += Math.log10(current + 1) * 20

    if (c.end_date) {
      const daysLeft = (new Date(c.end_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
      if (daysLeft > 0) {
        score += (1 / daysLeft) * 30
      }
    }

    if (c.last_donation_at) {
      const hours = (Date.now() - new Date(c.last_donation_at).getTime()) / (1000 * 60 * 60)
      if (hours < 24) {
        score += 40
      }
    }

    return score
  }

  const sorted = [...(campaigns || [])].sort((a, b) => getScore(b) - getScore(a))

  const featured = sorted.slice(0, 1)
  const trending = sorted.slice(1, 7)

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

      {/* ✅ LIVE FEED (SEGURO) */}
      <section className="max-w-7xl mx-auto px-6 py-6">
        <LiveFeed />
      </section>

      {/* FEATURED */}
      {featured.map(c => {

        const image = c.images?.[0] || c.image_url
        const badges = getBadges(c)

        return (
          <section key={c.id} className="py-20 px-6 bg-green-50">

            <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-10 items-center">

              <div className="relative">
                <img
                  src={buildImageUrl(image)}
                  className="rounded-2xl w-full h-[380px] object-cover shadow"
                />

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

                <button
                  onClick={() => router.push(`/campaign/${c.id}`)}
                  className="bg-green-600 text-white px-6 py-3 rounded-xl font-semibold"
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
        <div className="max-w-7xl mx-auto grid md:grid-cols-3 gap-8">
          {trending.map(c => (
            <div
              key={c.id}
              onClick={() => router.push(`/campaign/${c.id}`)}
              className="border rounded-2xl overflow-hidden cursor-pointer hover:shadow-lg"
            >
              <img
                src={buildImageUrl(c.images?.[0] || c.image_url)}
                className="h-52 w-full object-cover"
              />
              <div className="p-4">
                <h3 className="font-semibold">{c.title}</h3>
              </div>
            </div>
          ))}
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
          className="bg-green-600 text-white px-8 py-4 rounded-xl text-lg font-semibold"
        >
          Crear campaña
        </button>

      </section>

    </main>
  )
}