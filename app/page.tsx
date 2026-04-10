'use client'

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"

import LiveFeed from "./components/LiveFeed"
import Notifications from "./components/Notifications"

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
    if (!url) return "https://images.unsplash.com/photo-1593113630400-ea4288922497"
    return url.replace(/\s/g, "%20")
  }

  /* =========================
     🧠 ALGORITMO RANKING
  ========================= */
  const getScore = (c: any) => {
    const current = Number(c.current_amount || 0)
    const goal = Number(c.goal_amount || 1)

    const progress = current / goal

    let score = 0

    score += progress * 50
    score += Math.log10(current + 1) * 20

    if (c.end_date) {
      const daysLeft = (new Date(c.end_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
      if (daysLeft > 0) score += (1 / daysLeft) * 30
    }

    if (c.last_donation_at) {
      const hours = (Date.now() - new Date(c.last_donation_at).getTime()) / (1000 * 60 * 60)
      if (hours < 24) score += 40
    }

    return score
  }

  const sorted = [...campaigns].sort((a, b) => getScore(b) - getScore(a))

  const featured = sorted.slice(0, 1)
  const trending = sorted.slice(1, 7)

  const getBadges = (c: any) => {
    const badges: string[] = []

    const current = Number(c.current_amount || 0)
    const goal = Number(c.goal_amount || 1)
    const progress = current / goal

    if (progress >= 1) badges.push("🎉 Completada")
    else if (progress >= 0.8) badges.push("💰 Casi completada")

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

      {/* ================= HERO ================= */}
      <section className="bg-gradient-to-br from-green-600 to-green-700 text-white py-28 px-6 text-center">

        <h1 className="text-4xl md:text-6xl font-extrabold mb-6">
          Cambia una vida hoy
        </h1>

        <p className="text-lg opacity-90 mb-10">
          Apoya causas reales, ayuda a personas y sé parte del cambio.
        </p>

        <div className="flex justify-center gap-4 flex-wrap">

          <Link
            href="/campaigns"
            className="bg-white text-green-600 px-6 py-3 rounded-xl font-semibold hover:scale-105 transition"
          >
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

      {/* ================= LIVE ================= */}
      <section className="max-w-7xl mx-auto px-6 py-8">
        <LiveFeed />
      </section>

      {/* ================= FEATURED ================= */}
      {featured.map(c => {

        const image = c.images?.[0] || c.image_url
        const badges = getBadges(c)

        return (
          <section key={c.id} className="py-24 px-6 bg-green-50">

            <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-12 items-center">

              <div className="relative">

                <img
                  src={buildImageUrl(image)}
                  className="rounded-2xl w-full h-[400px] object-cover shadow-lg"
                />

                <div className="absolute top-4 left-4 flex flex-wrap gap-2">
                  {badges.map((b, i) => (
                    <span key={i} className="bg-white text-xs px-3 py-1 rounded-full shadow">
                      {b}
                    </span>
                  ))}
                </div>

              </div>

              <div>

                <p className="text-green-600 font-semibold mb-3">
                  🔥 Campaña destacada
                </p>

                <h2 className="text-3xl font-bold mb-4">
                  {c.title}
                </h2>

                <p className="text-gray-600 mb-6 line-clamp-4">
                  {c.description}
                </p>

                {/* 💣 PROGRESS */}
                <ProgressBar
                  current={c.current_amount}
                  goal={c.goal_amount}
                />

                <button
                  onClick={() => router.push(`/campaign/${c.id}`)}
                  className="mt-6 bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-xl font-semibold"
                >
                  Ver campaña
                </button>

              </div>

            </div>

          </section>
        )
      })}

      {/* ================= TRENDING ================= */}
      <section className="py-24 px-6">

        <h2 className="text-2xl font-bold mb-10 text-center">
          🔥 Tendencias
        </h2>

        <div className="max-w-7xl mx-auto grid md:grid-cols-3 gap-8">

          {trending.map(c => (
            <div
              key={c.id}
              onClick={() => router.push(`/campaign/${c.id}`)}
              className="border rounded-2xl overflow-hidden cursor-pointer hover:shadow-xl transition"
            >

              <img
                src={buildImageUrl(c.images?.[0] || c.image_url)}
                className="h-52 w-full object-cover"
              />

              <div className="p-4">

                <h3 className="font-semibold mb-2 line-clamp-2">
                  {c.title}
                </h3>

                {/* 💣 PROGRESS */}
                <ProgressBar
                  current={c.current_amount}
                  goal={c.goal_amount}
                />

              </div>

            </div>
          ))}

        </div>

      </section>

      {/* ================= CTA ================= */}
      <section className="py-28 text-center bg-gray-50">

        <h2 className="text-3xl font-bold mb-6">
          Empieza tu campaña hoy
        </h2>

        <p className="text-gray-600 mb-10">
          Miles de personas están listas para ayudarte
        </p>

        <button
          onClick={handleCreateCampaign}
          className="bg-green-600 hover:bg-green-700 text-white px-8 py-4 rounded-xl text-lg font-semibold"
        >
          Crear campaña
        </button>

      </section>

      <Notifications />

    </main>
  )
}

/* ================= COMPONENT ================= */

function ProgressBar({ current, goal }: any) {

  const safeGoal = goal || 1
  const percent = Math.min((current / safeGoal) * 100, 100)

  return (
    <div className="w-full mt-4">

      <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
        <div
          className="h-2 bg-green-500 transition-all"
          style={{ width: `${percent}%` }}
        />
      </div>

      <div className="flex justify-between text-xs mt-2 text-gray-600">
        <span>${Number(current || 0).toLocaleString()}</span>
        <span>{percent.toFixed(0)}%</span>
      </div>

      <div className="text-xs text-gray-400">
        Meta: ${Number(goal || 0).toLocaleString()}
      </div>

    </div>
  )
}