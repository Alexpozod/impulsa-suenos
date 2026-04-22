'use client'

import Link from "next/link"
import { motion } from "framer-motion"

export default function Hero({ onCreate }: { onCreate: () => void }) {

  return (
    <section className="relative py-28 px-6 overflow-hidden bg-gradient-to-br from-white via-white to-green-50">

      <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-16 items-center">

        {/* ================= TEXT ================= */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >

          {/* BADGE */}
          <div className="inline-flex items-center gap-2 bg-green-100 text-green-700 px-4 py-1 rounded-full text-sm mb-6 shadow-sm">
            ● 128 campañas verificadas hoy
          </div>

          {/* TITLE */}
          <h1 className="text-4xl md:text-6xl font-extrabold leading-tight mb-6">
            Donde los sueños{" "}
            <span className="text-green-600">encuentran su impulso</span>
          </h1>

          {/* SUBTEXT */}
          <p className="text-gray-600 text-lg mb-8 max-w-lg">
            Crea una campaña en minutos o apoya una causa real.
          </p>

          {/* ================= CTA ================= */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">

            {/* BOTÓN PRINCIPAL + TEXTO */}
            <div className="flex flex-col">

              <button
                onClick={onCreate}
                className="bg-green-600 hover:bg-green-700 text-white px-8 py-4 rounded-2xl font-bold shadow-lg hover:shadow-xl transition-all text-lg hover:scale-[1.03] active:scale-[0.98]"
              >
                Crear campaña →
              </button>

              <p className="text-xs text-gray-400 mt-2">
                🔒 Seguro · Sin comisiones ocultas
              </p>

            </div>

            {/* BOTÓN SECUNDARIO */}
            <Link
              href="/campaigns"
              className="border border-gray-300 px-6 py-3 rounded-xl font-semibold text-center hover:border-green-600 hover:text-green-600 transition"
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

        </motion.div>

        {/* ================= IMAGE ================= */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="relative"
        >

          <img
            src="https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e"
            className="rounded-3xl w-full h-[450px] object-cover shadow-2xl"
          />

          {/* FLOATING CARD */}
          <div className="absolute -bottom-6 left-6 bg-white px-5 py-3 rounded-2xl shadow-xl border">
            <p className="text-sm font-semibold">$2.4M+</p>
            <p className="text-xs text-gray-500">Recaudado este año</p>
          </div>

        </motion.div>

      </div>

    </section>
  )
}