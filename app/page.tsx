'use client'

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"

import Hero from "./components/home/Hero"
import CampaignCardPro from "./components/home/CampaignCardPro"
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

      {/* CAMPAÑAS */}
      <section className="py-24 px-6">
        <div className="max-w-7xl mx-auto">

          <h2 className="text-3xl font-bold mb-12 text-center">
            Campañas destacadas
          </h2>

          {/* LOADING */}
          {loading ? (
            <p className="text-center text-gray-400">
              Cargando campañas...
            </p>
          ) : topCampaigns.length === 0 ? (
            <p className="text-center text-gray-400">
              No hay campañas disponibles
            </p>
          ) : (
            <div className="grid md:grid-cols-3 gap-8">
              {topCampaigns.map(c => (
                <CampaignCardPro key={c.id} c={c} />
              ))}
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