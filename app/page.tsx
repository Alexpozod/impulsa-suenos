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
  }, [])

  const handleCreateCampaign = () => {
    router.push("/create")
  }

  const featured = campaigns.slice(0, 1)
  const trending = campaigns.slice(1, 7)

  return (
    <main className="bg-white">

      {/* HERO */}
      <section className="bg-gradient-to-br from-green-600 to-green-700 text-white py-20 px-6 text-center">
        <h1 className="text-4xl md:text-5xl font-extrabold mb-6">
          Apoya causas reales o participa en sorteos 🚀
        </h1>

        <div className="flex justify-center gap-4">
          <Link href="/campaigns" className="bg-white text-green-600 px-6 py-3 rounded-xl">
            Ver campañas
          </Link>

          <button onClick={handleCreateCampaign} className="bg-black/20 px-6 py-3 rounded-xl">
            Crear campaña
          </button>
        </div>
      </section>

      {/* 🔥 FEATURED */}
      {featured.map(c => (
        <section key={c.id} className="py-16 px-6 bg-green-50">
          <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-10 items-center">

            <img src={c.image_url} className="rounded-xl w-full h-80 object-cover" />

            <div>
              <h2 className="text-3xl font-bold mb-4">🔥 Destacada</h2>
              <h3 className="text-xl font-semibold">{c.title}</h3>

              <p className="text-gray-600 mt-2 mb-4">
                {c.description}
              </p>

              <button
                onClick={() => router.push(`/campaign/${c.id}`)}
                className="bg-green-600 text-white px-6 py-3 rounded-lg"
              >
                Ver campaña
              </button>
            </div>

          </div>
        </section>
      ))}

      {/* 🔥 TRENDING */}
      <section className="py-16 px-6">
        <div className="max-w-6xl mx-auto">

          <h2 className="text-2xl font-bold mb-10 text-center">
            🔥 Tendencias
          </h2>

          <div className="grid md:grid-cols-3 gap-6">

            {trending.map(c => (
              <div
                key={c.id}
                onClick={() => router.push(`/campaign/${c.id}`)}
                className="border rounded-xl overflow-hidden cursor-pointer hover:shadow-lg"
              >
                <img src={c.image_url} className="h-40 w-full object-cover" />

                <div className="p-4">
                  <h3 className="font-bold">{c.title}</h3>

                  <p className="text-sm text-gray-500">
                    ${Number(c.current_amount || 0).toLocaleString()}
                  </p>
                </div>
              </div>
            ))}

          </div>

        </div>
      </section>

    </main>
  )
}