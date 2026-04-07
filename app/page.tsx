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

  const buildImageUrl = (url: string) => {
    if (!url) return "https://via.placeholder.com/400"
    return url.replace(/\s/g, "%20")
  }

  const featured = campaigns.slice(0, 1)
  const trending = campaigns.slice(1, 7)

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

        {/* PRUEBA SOCIAL */}
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

        return (
          <section key={c.id} className="py-20 px-6 bg-green-50">

            <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-10 items-center">

              <img
                src={buildImageUrl(image)}
                className="rounded-2xl w-full h-[380px] object-cover shadow"
              />

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

                {/* PROGRESO */}
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

              return (
                <div
                  key={c.id}
                  onClick={() => router.push(`/campaign/${c.id}`)}
                  className="border rounded-2xl overflow-hidden cursor-pointer hover:shadow-xl transition group"
                >

                  <div className="overflow-hidden">
                    <img
                      src={buildImageUrl(image)}
                      className="h-52 w-full object-cover group-hover:scale-105 transition"
                    />
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