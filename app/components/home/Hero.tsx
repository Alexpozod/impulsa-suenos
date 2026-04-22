'use client'

import Link from "next/link"

export default function Hero({ onCreate }: { onCreate: () => void }) {

  return (
    <section className="bg-white py-24 px-6">

      <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-12 items-center">

        {/* TEXT */}
        <div>

          {/* BADGE */}
          <div className="inline-flex items-center gap-2 bg-green-100 text-green-700 px-4 py-1 rounded-full text-sm mb-6">
            ● 128 campañas verificadas hoy
          </div>

          {/* TITLE */}
          <h1 className="text-4xl md:text-6xl font-extrabold leading-tight mb-6">
            Donde los sueños{" "}
            <span className="text-green-600">encuentran su impulso</span>
          </h1>

          {/* SUBTEXT */}
          <p className="text-gray-600 text-lg mb-8">
            Crea una campaña en minutos o apoya una causa real.
            Rápido, seguro y transparente.
          </p>

          {/* BUTTONS */}
          <div className="flex gap-4 flex-wrap">

            <button
              onClick={onCreate}
              className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-xl font-semibold transition"
            >
              Crear campaña →
            </button>

            <Link
              href="/campaigns"
              className="border border-gray-300 px-6 py-3 rounded-xl font-semibold hover:border-green-600 hover:text-green-600 transition"
            >
              Donar ahora
            </Link>

          </div>

          {/* TRUST */}
          <div className="flex gap-6 mt-6 text-sm text-gray-500 flex-wrap">
            <span>✔ Pagos seguros</span>
            <span>✔ Transparencia total</span>
            <span>✔ Campañas verificadas</span>
          </div>

        </div>

        {/* IMAGE */}
        <div className="relative">

          <img
            src="https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e"
            className="rounded-2xl w-full h-[420px] object-cover"
          />

          {/* FLOATING CARD */}
          <div className="absolute bottom-4 left-4 bg-white px-4 py-2 rounded-xl shadow">
            <p className="text-sm font-semibold">$2.4M+</p>
            <p className="text-xs text-gray-500">Recaudado este año</p>
          </div>

        </div>

      </div>

    </section>
  )
}