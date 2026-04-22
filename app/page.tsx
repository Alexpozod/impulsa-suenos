'use client'

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"

import Hero from "./components/home/Hero"
import Stats from "./components/home/Stats"
import HowItWorks from "./components/home/HowItWorks"
import Trust from "./components/home/Trust"
import FinalCTA from "./components/home/FinalCTA"

export default function HomePage() {

  const router = useRouter()

  const [campaigns, setCampaigns] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("/api/campaigns")
      .then(res => res.json())
      .then(data => {
        setCampaigns(Array.isArray(data) ? data : [])
      })
      .catch(() => {
        setCampaigns([])
      })
      .finally(() => {
        setLoading(false)
      })
  }, [])

  const handleCreateCampaign = () => {
    router.push("/create")
  }

  const topCampaigns = campaigns.slice(0, 6)

  return (
    <main className="bg-white">

      {/* HERO */}
      <Hero onCreate={handleCreateCampaign} />

      {/* STATS */}
      <Stats />

      {/* ================= CAMPAÑAS ================= */}
      <section className="py-28 px-6 bg-gray-50">
        <div className="max-w-7xl mx-auto">

          {/* HEADER */}
          <div className="flex items-center justify-between mb-14">

            <div>
              <p className="text-green-600 text-sm font-semibold mb-2">
                HISTORIAS EN MARCHA
              </p>

              <h2 className="text-3xl md:text-4xl font-bold">
                Campañas destacadas
              </h2>
            </div>

            <button
              onClick={() => router.push("/campaigns")}
              className="hidden md:flex items-center gap-2 text-green-600 font-semibold hover:gap-3 transition-all"
            >
              Ver todas →
            </button>

          </div>

          {/* LOADING / DATA */}
          {loading ? (
            <p className="text-center text-gray-400">
              Cargando campañas...
            </p>

          ) : topCampaigns.length === 0 ? (
            <p className="text-center text-gray-400">
              No hay campañas disponibles
            </p>

          ) : (

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-10">

              {topCampaigns.map((c) => {

                const progress = c.goal_amount > 0
                  ? Math.min((c.current_amount / c.goal_amount) * 100, 100)
                  : 0

                const nearGoal = progress >= 75

                return (
                  <div
                    key={c.id}
                    className="bg-white rounded-3xl overflow-hidden shadow-md hover:shadow-2xl transition-all duration-500 group border"
                  >

                    {/* IMAGE */}
                    <div className="relative h-60 overflow-hidden">

                      <img
                        src={
                          c.images?.[0] ||
                          c.image_url ||
                          "https://images.unsplash.com/photo-1593113630400-ea4288922497"
                        }
                        className="w-full h-full object-cover group-hover:scale-110 transition duration-700"
                      />

                      {nearGoal && (
                        <div className="absolute top-4 left-4 bg-orange-400 text-white text-xs px-3 py-1 rounded-full font-semibold shadow">
                          🔥 ¡Casi lo logra!
                        </div>
                      )}

                    </div>

                    {/* CONTENT */}
                    <div className="p-6 flex flex-col gap-4">

                      <div>
                        <h3 className="font-bold text-lg leading-tight">
                          {c.title}
                        </h3>

                        <p className="text-gray-500 text-sm mt-1 line-clamp-2">
                          {c.description}
                        </p>
                      </div>

                      {/* MONEY */}
                      <div className="flex justify-between items-center text-sm">
                        <span className="font-bold text-gray-900 text-base">
                          ${Number(c.current_amount || 0).toLocaleString()}
                        </span>
                        <span className="text-gray-400">
                          de ${Number(c.goal_amount || 0).toLocaleString()}
                        </span>
                      </div>

                      {/* PROGRESS */}
                      <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-green-600 transition-all duration-500"
                          style={{ width: `${progress}%` }}
                        />
                      </div>

                      {/* FOOTER */}
                      <div className="flex items-center justify-between pt-2">

                        <span className="text-xs text-gray-400">
                          {c.donations_count || 0} donaciones
                        </span>

                        <button
                          onClick={() => router.push(`/campaign/${c.id}`)}
                          className="bg-green-600 hover:bg-green-700 text-white text-sm px-5 py-2 rounded-full font-semibold transition flex items-center gap-2"
                        >
                          ❤ Donar
                        </button>

                      </div>

                    </div>

                  </div>
                )
              })}

            </div>

          )}

        </div>
      </section>

      {/* HOW IT WORKS */}
      <HowItWorks />

      {/* TRUST */}
      <Trust />

      {/* CTA FINAL */}
      <FinalCTA onCreate={handleCreateCampaign} />

    </main>
  )
}