'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

export default function HomePage() {

  const [campaigns, setCampaigns] = useState<any[]>([])
  const router = useRouter()

  useEffect(() => {
    load()
  }, [])

  const load = async () => {
    const res = await fetch('/api/campaigns')
    const data = await res.json()
    setCampaigns(data || [])
  }

  return (
    <main className="bg-white text-gray-900">

      {/* ================= HERO ================= */}
      <section className="px-6 py-20 text-center bg-gradient-to-b from-green-50 to-white">

        <h1 className="text-4xl md:text-5xl font-extrabold mb-6 leading-tight">
          Gana premios reales <br />
          <span className="text-green-600">
            mientras ayudas a otros
          </span>
        </h1>

        <p className="text-lg text-gray-600 max-w-xl mx-auto mb-8">
          Compra tickets, participa en sorteos y apoya causas reales.
          Una nueva forma de ayudar y ganar.
        </p>

        <div className="flex gap-4 justify-center">

          <button
            onClick={() => router.push('/campaigns')}
            className="bg-green-600 text-white px-6 py-3 rounded-xl font-semibold hover:scale-105 transition"
          >
            Ver campañas
          </button>

          <button
            onClick={() => router.push('/login')}
            className="border px-6 py-3 rounded-xl font-semibold hover:bg-gray-100"
          >
            Crear cuenta
          </button>

        </div>

      </section>

      {/* ================= CAMPAÑAS ================= */}
      <section className="px-6 py-16 max-w-6xl mx-auto">

        <h2 className="text-2xl font-bold mb-8 text-center">
          🔥 Campañas destacadas
        </h2>

        <div className="grid md:grid-cols-3 gap-6">

          {campaigns.slice(0, 6).map((c) => {

            const percent = c.goal_amount
              ? Math.min((c.raised / c.goal_amount) * 100, 100)
              : 0

            return (
              <div
                key={c.id}
                onClick={() => router.push(`/campaigns/${c.id}`)}
                className="bg-white p-5 rounded-2xl shadow-md cursor-pointer hover:scale-105 transition"
              >

                <img
                  src={c.image_url || "https://via.placeholder.com/400"}
                  className="w-full h-40 object-cover rounded-xl mb-4"
                />

                <h3 className="font-bold mb-2">
                  {c.title}
                </h3>

                <div className="h-2 bg-gray-200 rounded-full mb-2">
                  <div
                    className="h-2 bg-green-600 rounded-full"
                    style={{ width: `${percent}%` }}
                  />
                </div>

                <div className="text-sm flex justify-between">
                  <span>${Number(c.raised).toLocaleString()}</span>
                  <span>${Number(c.goal_amount).toLocaleString()}</span>
                </div>

              </div>
            )
          })}

        </div>

      </section>

      {/* ================= COMO FUNCIONA ================= */}
      <section className="bg-gray-50 py-16 px-6 text-center">

        <h2 className="text-2xl font-bold mb-10">
          ¿Cómo funciona?
        </h2>

        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">

          <div>
            <div className="text-4xl mb-3">🎟️</div>
            <h3 className="font-bold mb-2">Compra tickets</h3>
            <p className="text-sm text-gray-600">
              Elige una campaña y compra tickets fácilmente.
            </p>
          </div>

          <div>
            <div className="text-4xl mb-3">🎯</div>
            <h3 className="font-bold mb-2">Participa</h3>
            <p className="text-sm text-gray-600">
              Entras automáticamente al sorteo.
            </p>
          </div>

          <div>
            <div className="text-4xl mb-3">🏆</div>
            <h3 className="font-bold mb-2">Gana</h3>
            <p className="text-sm text-gray-600">
              Si tu ticket sale, ganas premios reales.
            </p>
          </div>

        </div>

      </section>

      {/* ================= BENEFICIOS ================= */}
      <section className="py-16 px-6 text-center">

        <h2 className="text-2xl font-bold mb-10">
          ¿Por qué ImpulsaSueños?
        </h2>

        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">

          <div>
            <h3 className="font-bold mb-2">💸 Ganas dinero</h3>
            <p className="text-sm text-gray-600">
              Participa en sorteos con premios reales.
            </p>
          </div>

          <div>
            <h3 className="font-bold mb-2">❤️ Ayudas</h3>
            <p className="text-sm text-gray-600">
              Apoyas causas reales y personas.
            </p>
          </div>

          <div>
            <h3 className="font-bold mb-2">🔒 Seguro</h3>
            <p className="text-sm text-gray-600">
              Pagos protegidos y sistema antifraude.
            </p>
          </div>

        </div>

      </section>

      {/* ================= CTA FINAL ================= */}
      <section className="bg-green-600 text-white text-center py-16 px-6">

        <h2 className="text-3xl font-bold mb-4">
          Empieza ahora
        </h2>

        <p className="mb-6">
          Únete y participa en las campañas activas
        </p>

        <button
          onClick={() => router.push('/campaigns')}
          className="bg-white text-green-600 px-6 py-3 rounded-xl font-bold hover:scale-105 transition"
        >
          Ver campañas
        </button>

      </section>

    </main>
  )
}
