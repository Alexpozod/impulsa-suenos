'use client'

import Link from "next/link"
import { motion } from "framer-motion"

export default function Hero({ onCreate }: { onCreate: () => void }) {

  return (
    <section className="relative py-28 px-6 overflow-hidden bg-gradient-to-br from-white via-white to-green-50">

      <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-16 items-center">

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >

          <div className="inline-flex items-center gap-2 bg-green-100 text-green-700 px-4 py-1 rounded-full text-sm mb-6 shadow-sm">
            ● 128 campañas verificadas hoy
          </div>

          <h1 className="text-4xl md:text-6xl font-extrabold leading-tight mb-6">
            Donde los sueños{" "}
            <span className="text-green-600">encuentran su impulso</span>
          </h1>

          <p className="text-gray-600 text-lg mb-8 max-w-lg">
            Crea una campaña en minutos o apoya una causa real.
          </p>

          <div className="flex gap-4 flex-wrap">

            <button
              onClick={onCreate}
              className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-xl font-semibold shadow-md"
            >
              Crear campaña →
            </button>

            <Link
              href="/campaigns"
              className="border px-6 py-3 rounded-xl font-semibold"
            >
              Donar ahora
            </Link>

          </div>

        </motion.div>

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
        </motion.div>

      </div>
    </section>
  )
}