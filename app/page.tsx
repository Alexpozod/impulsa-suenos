'use client'

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"

import Hero from "./components/home/Hero"
import Stats from "./components/home/Stats"
import HowItWorks from "./components/home/HowItWorks"
import Trust from "./components/home/Trust"
import FinalCTA from "./components/home/FinalCTA"

/* =========================
   🎬 ANIMACIONES (FIX TYPESCRIPT)
========================= */
const container = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.08
    }
  }
}

const item = {
  hidden: { opacity: 0, y: 30 },
  show: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
      ease: [0.25, 0.8, 0.25, 1] as const // ✅ FIX
    }
  }
}

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
      <section className="py-32 px-6 bg-gray-50">
        <div className="max-w-7xl mx-auto">

          {/* HEADER */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="flex items-end justify-between mb-16"
          >

            <div>
              <p className="text-green-600 text-sm font-semibold tracking-wide mb-3">
                HISTORIAS EN MARCHA
              </p>

              <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight">
                Campañas destacadas
              </h2>
            </div>

            <button
              onClick={() => router.push("/campaigns")}
              className="hidden md:flex items-center gap-2 text-green-600 font-semibold hover:gap-3 transition-all"
            >
              Ver todas las campañas →
            </button>

          </motion.div>

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

            <motion.div
              variants={container}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true }}
              className="grid md:grid-cols-2 lg:grid-cols-3 gap-12 justify-items-center"
            >

              {topCampaigns.map((c) => {

                const progress = c.goal_amount > 0
                  ? Math.min((c.current_amount / c.goal_amount) * 100, 100)
                  : 0

                const nearGoal = progress >= 75

                return (
                  <motion.div
                    key={c.id}
                    variants={item}
                    className="w-full max-w-sm bg-white rounded-3xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-500 group"
                  >

                    {/* IMAGE */}
                    <div className="relative h-60 overflow-hidden">
                      <img
                        src={
                          c.images?.[0] ||
                          c.image_url ||
                          "https://images.unsplash.com/photo-1593113630400-ea4288922497"
                        }
                        className="w-full h-full object-cover group-hover:scale-105 transition duration-700"
                      />

                      {nearGoal && (
                        <div className="absolute top-4 left-4 bg-orange-400 text-white text-xs px-3 py-1 rounded-full font-semibold shadow">
                          🔥 ¡Casi lo logra!
                        </div>
                      )}
                    </div>

                    {/* CONTENT */}
                    <div className="p-6 flex flex-col gap-5">

                      <div>
                        <h3 className="font-semibold text-lg leading-snug tracking-tight">
                          {c.title}
                        </h3>

                        <p className="text-gray-500 text-sm mt-1 line-clamp-2 leading-relaxed">
                          {c.description}
                        </p>
                      </div>

                      {/* MONEY */}
                      <div className="flex justify-between items-center text-sm mt-2">
                        <span className="font-bold text-gray-900 text-base">
                          ${Number(c.current_amount || 0).toLocaleString()}
                        </span>
                        <span className="text-gray-400">
                          de ${Number(c.goal_amount || 0).toLocaleString()}
                        </span>
                      </div>

                      {/* PROGRESS */}
                      <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
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

                        <motion.button
                          whileTap={{ scale: 0.95 }}
                          onClick={() => router.push(`/campaign/${c.id}`)}
                          className="bg-green-600 hover:bg-green-700 text-white text-sm px-5 py-2 rounded-full font-medium transition flex items-center gap-2"
                        >
                          ❤ Donar
                        </motion.button>

                      </div>

                    </div>

                  </motion.div>
                )
              })}

            </motion.div>

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