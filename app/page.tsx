import Link from "next/link"

export default function HomePage() {
  return (
    <main className="bg-white">

      {/* HERO */}
      <section className="bg-gradient-to-br from-green-600 to-green-700 text-white py-20 px-6 text-center">

        <h1 className="text-4xl md:text-5xl font-extrabold mb-6 leading-tight">
          Gana premios reales mientras ayudas a otros
        </h1>

        <p className="text-lg md:text-xl mb-8 max-w-2xl mx-auto">
          Participa en sorteos, apoya causas reales y transforma vidas con cada aporte.
        </p>

        <div className="flex justify-center gap-4 flex-wrap">

          <Link
            href="/campaigns"
            className="bg-white text-green-600 px-6 py-3 rounded-xl font-semibold"
          >
            Ver campañas
          </Link>

          <Link
            href="/register"
            className="bg-black bg-opacity-20 px-6 py-3 rounded-xl font-semibold"
          >
            Crear campaña
          </Link>

        </div>

      </section>

      {/* BENEFICIOS */}
      <section className="py-16 px-6 bg-gray-50">

        <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-10 text-center">

          <div>
            <div className="text-4xl mb-3">🎟️</div>
            <h3 className="font-bold mb-2">
              Compra tickets
            </h3>
            <p className="text-gray-600 text-sm">
              Participa en sorteos reales con total transparencia.
            </p>
          </div>

          <div>
            <div className="text-4xl mb-3">💖</div>
            <h3 className="font-bold mb-2">
              Apoya causas
            </h3>
            <p className="text-gray-600 text-sm">
              Cada compra ayuda a personas reales a cumplir sus metas.
            </p>
          </div>

          <div>
            <div className="text-4xl mb-3">🔒</div>
            <h3 className="font-bold mb-2">
              Pagos seguros
            </h3>
            <p className="text-gray-600 text-sm">
              Procesado con MercadoPago y sistemas antifraude.
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
              <p>Elige una campaña o sorteo</p>
            </div>

            <div>
              <div className="text-3xl mb-3">2️⃣</div>
              <p>Compra tus tickets o dona</p>
            </div>

            <div>
              <div className="text-3xl mb-3">3️⃣</div>
              <p>Participa y gana mientras ayudas</p>
            </div>

          </div>

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
            <p>🎟️ Tickets verificables</p>
            <p>📊 Resultados públicos</p>

          </div>

        </div>

      </section>

      {/* CTA FINAL */}
      <section className="py-20 px-6 text-center">

        <h2 className="text-3xl font-bold mb-6">
          Empieza ahora mismo
        </h2>

        <p className="text-gray-600 mb-8">
          Crea tu campaña o participa en sorteos hoy.
        </p>

        <div className="flex justify-center gap-4 flex-wrap">

          <Link
            href="/campaigns"
            className="bg-green-600 text-white px-6 py-3 rounded-xl font-semibold"
          >
            Ver campañas
          </Link>

          <Link
            href="/register"
            className="border border-green-600 text-green-600 px-6 py-3 rounded-xl font-semibold"
          >
            Crear campaña
          </Link>

        </div>

      </section>

    </main>
  )
}
