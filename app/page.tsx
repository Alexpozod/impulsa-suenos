'use client'

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"

import Navbar from "./components/Navbar"
import Footer from "./components/Footer"

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

      {/* NAVBAR */}
      <Navbar />

      {/* HERO (YA EXISTENTE) */}
      <Hero onCreate={handleCreateCampaign} />

      {/* CAMPAÑAS */}
      <section className="py-24 px-6">
        <div className="max-w-7xl mx-auto">

          <div className="flex justify-between items-end mb-12">
            <div>
              <p className="text-sm font-semibold text-green-600 mb-2">
                Historias reales
              </p>
              <h2 className="text-3xl font-bold">
                Campañas destacadas
              </h2>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {topCampaigns.map(c => (
              <CampaignCardPro key={c.id} c={c} />
            ))}
          </div>

        </div>
      </section>

      {/* FOOTER */}
      <Footer />

    </main>
  )
}