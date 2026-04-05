'use client'

import Link from "next/link"
import { useRouter } from "next/navigation"
import { supabase } from "@/src/lib/supabase"

export default function HomePage() {

  const router = useRouter()

  const handleCreateCampaign = async () => {
    const { data } = await supabase.auth.getSession()

    if (!data.session) {
      router.push("/login")
    } else {
      router.push("/create")
    }
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

      {/* 🔥 CÓMO FUNCIONA (MEJORADO) */}
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

      {/* 🔥 CONFIANZA PRO */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-6xl mx-auto px-6 text-center">

          <h2 className="text-2xl font-bold mb-10">
            Transparencia y seguridad real
          </h2>

          <div className="grid md:grid-cols-3 gap-10">

            <div>
              <div className="text-3xl mb-3">🔒</div>
              <h3 className="font-semibold mb-2">
                Pagos seguros
              </h3>
              <p className="text-sm text-gray-600">
                Procesamos pagos con MercadoPago y sistemas certificados.
              </p>
            </div>

            <div>
              <div className="text-3xl mb-3">📊</div>
              <h3 className="font-semibold mb-2">
                Trazabilidad completa
              </h3>
              <p className="text-sm text-gray-600">
                Cada movimiento queda registrado en nuestro sistema financiero.
              </p>
            </div>

            <div>
              <div className="text-3xl mb-3">🚨</div>
              <h3 className="font-semibold mb-2">
                Sistema antifraude
              </h3>
              <p className="text-sm text-gray-600">
                Detectamos comportamientos sospechosos y protegemos tu dinero.
              </p>
            </div>

          </div>

        </div>
      </section>

      {/* 🔥 CAMPAÑAS (PLACEHOLDER PRO) */}
      <section className="py-16 bg-white">
        <div className="max-w-6xl mx-auto px-6 text-center">

          <h2 className="text-2xl font-bold mb-6">
            Campañas destacadas
          </h2>

          <p className="text-gray-500 mb-10">
            Próximamente podrás explorar campañas reales y apoyar causas importantes.
          </p>

          <Link
            href="/campaigns"
            className="inline-block bg-green-600 text-white px-6 py-3 rounded-lg font-semibold"
          >
            Ver campañas
          </Link>

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