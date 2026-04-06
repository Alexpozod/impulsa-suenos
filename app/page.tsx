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

  return (
    <main className="bg-white">

      {/* HERO */}
      <section className="bg-gradient-to-br from-green-600 to-green-700 text-white py-20 px-6 text-center">

        <h1 className="text-4xl md:text-5xl font-extrabold mb-6 leading-tight">
          Apoya causas reales o participa en sorteos con premios verificables 🚀
        </h1>

        <p className="text-lg md:text-xl mb-8 max-w-2xl mx-auto">
          Cada aporte queda registrado y es 100% transparente.
        </p>

        <div className="flex justify-center gap-4 flex-wrap">

          <Link
            href="/campaigns"
            className="bg-white text-green-600 px-6 py-3 rounded-xl font-semibold"
          >
            Ver campañas
          </Link>

          <button
            onClick={handleCreateCampaign}
            className="bg-black bg-opacity-20 px-6 py-3 rounded-xl font-semibold"
          >
            Crear campaña
          </button>

        </div>

      </section>

      {/* DIFERENCIAL */}
      <section className="py-12 px-6 bg-green-50 text-center">

        <p className="max-w-3xl mx-auto text-sm text-green-800">
          💡 ImpulsaSueños registra cada movimiento financiero, aplica controles antifraude
          y garantiza trazabilidad completa de los fondos.
        </p>

      </section>

      {/* CÓMO FUNCIONA */}
      <section className="py-16 bg-white">
        <div className="max-w-6xl mx-auto px-6 text-center">

          <h2 className="text-2xl font-bold mb-10">
            ¿Cómo funciona?
          </h2>

          <div className="grid md:grid-cols-3 gap-10 text-left">

            <div>
              <div className="text-3xl mb-3">📝</div>
              <h3 className="font-semibold text-lg mb-2">
                Crea tu campaña
              </h3>
              <p className="text-gray-600 text-sm">
                Explica tu causa, define tu meta y publícala en minutos.
              </p>
            </div>

            <div>
              <div className="text-3xl mb-3">📢</div>
              <h3 className="font-semibold text-lg mb-2">
                Comparte y recibe apoyo
              </h3>
              <p className="text-gray-600 text-sm">
                Recibe donaciones reales y visibilidad para tu causa.
              </p>
            </div>

            <div>
              <div className="text-3xl mb-3">🎁</div>
              <h3 className="font-semibold text-lg mb-2">
                Participa en sorteos
              </h3>
              <p className="text-gray-600 text-sm">
                Algunas campañas incluyen premios como incentivo transparente.
              </p>
            </div>

          </div>

        </div>
      </section>

      {/* CAMPAÑAS REALES */}
      <section className="py-16 bg-white">
        <div className="max-w-6xl mx-auto px-6">

          <h2 className="text-2xl font-bold mb-10 text-center">
            Campañas destacadas
          </h2>

          <div className="grid md:grid-cols-3 gap-6">

            {campaigns.slice(0, 6).map((c) => (
              <div
                key={c.id}
                onClick={() => router.push(`/campaign/${c.id}`)}
                className="bg-white border rounded-xl overflow-hidden cursor-pointer hover:shadow-lg transition"
              >
                <img
                  src={c.image_url || "https://via.placeholder.com/400"}
                  className="h-40 w-full object-cover"
                />

                <div className="p-4">
                  <h3 className="font-bold mb-1">{c.title}</h3>

                  <p className="text-sm text-gray-500">
                    ${Number(c.current_amount || 0).toLocaleString()}
                  </p>
                </div>
              </div>
            ))}

          </div>

        </div>
      </section>

      {/* CTA FINAL */}
      <section className="py-20 px-6 text-center">

        <h2 className="text-3xl font-bold mb-6">
          Empieza ahora mismo
        </h2>

        <p className="text-gray-600 mb-8">
          Crea tu campaña o apoya una causa hoy.
        </p>

        <div className="flex justify-center gap-4 flex-wrap">

          <Link
            href="/campaigns"
            className="bg-green-600 text-white px-6 py-3 rounded-xl font-semibold"
          >
            Ver campañas
          </Link>

          <button
            onClick={handleCreateCampaign}
            className="border border-green-600 text-green-600 px-6 py-3 rounded-xl font-semibold"
          >
            Crear campaña
          </button>

        </div>

      </section>

      {/* FOOTER */}
      <footer className="text-center text-sm text-gray-500 py-10 border-t">

        <div className="flex justify-center gap-4 flex-wrap mb-3">
          <Link href="/terminos">Términos</Link>
          <Link href="/privacidad">Privacidad</Link>
          <Link href="/cookies">Cookies</Link>
          <Link href="/reembolsos">Reembolsos</Link>
          <Link href="/faq">FAQ</Link>
        </div>

        <p>© {new Date().getFullYear()} ImpulsaSueños</p>

      </footer>

    </main>
  )
}