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
          Apoya causas reales o gana premios mientras ayudas 🚀
        </h1>

        <p className="text-lg md:text-xl mb-8 max-w-2xl mx-auto">
          Dona libremente o participa en sorteos transparentes.
          Todo con trazabilidad financiera real.
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
          💡 ImpulsaSueños no solo conecta personas:
          registra cada movimiento financiero, aplica controles antifraude
          y permite trazabilidad completa de los fondos.
        </p>

      </section>

      {/* BENEFICIOS */}
      <section className="py-16 px-6 bg-gray-50">

        <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-10 text-center">

          <div>
            <div className="text-4xl mb-3">💖</div>
            <h3 className="font-bold mb-2">
              Dona libremente
            </h3>
            <p className="text-gray-600 text-sm">
              Aporta cualquier monto y apoya causas reales.
            </p>
          </div>

          <div>
            <div className="text-4xl mb-3">🎟️</div>
            <h3 className="font-bold mb-2">
              Participa en sorteos
            </h3>
            <p className="text-gray-600 text-sm">
              Algunas campañas incluyen premios como incentivo.
            </p>
          </div>

          <div>
            <div className="text-4xl mb-3">🔒</div>
            <h3 className="font-bold mb-2">
              Seguridad real
            </h3>
            <p className="text-gray-600 text-sm">
              Pagos con MercadoPago + sistema antifraude + auditoría.
            </p>
          </div>

        </div>

      </section>

      {/* CÓMO FUNCIONA */}
      <section className="py-16 px-6">

        <div className="max-w-5xl mx-auto text-center">

          <h2 className="text-3xl font-bold mb-10">
            ¿Cómo funciona?
          </h2>

          <div className="grid md:grid-cols-3 gap-8 text-sm">

            <div>
              <div className="text-3xl mb-3">1️⃣</div>
              <p>Explora campañas o crea la tuya</p>
            </div>

            <div>
              <div className="text-3xl mb-3">2️⃣</div>
              <p>Dona o participa en sorteos</p>
            </div>

            <div>
              <div className="text-3xl mb-3">3️⃣</div>
              <p>Sigue resultados y transparencia</p>
            </div>

          </div>

          <Link
            href="/como-funciona"
            className="inline-block mt-6 text-green-600 underline text-sm"
          >
            Ver detalle completo
          </Link>

        </div>

      </section>

      {/* CONFIANZA */}
      <section className="bg-gray-100 py-16 px-6">

        <div className="max-w-5xl mx-auto text-center">

          <h2 className="text-2xl font-bold mb-6">
            Plataforma confiable y transparente
          </h2>

          <div className="grid md:grid-cols-3 gap-6 text-sm text-gray-600">

            <p>🔒 Pagos protegidos</p>
            <p>📊 Ledger financiero auditable</p>
            <p>🚨 Sistema antifraude activo</p>

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

      {/* FOOTER LEGAL */}
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