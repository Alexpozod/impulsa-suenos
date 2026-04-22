'use client'

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"

import Hero from "./components/home/Hero"
import CampaignCardPro from "./components/home/CampaignCardPro"

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

  const topCampaigns = campaigns.slice(0, 6)

  return (
    <main className="bg-white">

      <Hero onCreate={handleCreateCampaign} />

      <section className="py-24 px-6">
        <div className="max-w-7xl mx-auto">

          <div className="mb-12">
            <p className="text-sm font-semibold text-green-600 mb-2">
              Historias reales
            </p>
            <h2 className="text-3xl font-bold">
              Campañas destacadas
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {topCampaigns.map(c => (
              <CampaignCardPro key={c.id} c={c} />
            ))}
          </div>

        </div>
      </section>

    </main>
  )
}