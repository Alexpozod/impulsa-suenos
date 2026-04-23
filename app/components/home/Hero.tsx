'use client'

import Link from "next/link"
import { motion, useScroll, useTransform } from "framer-motion"

type Props = {
  onCreate: () => void
}

export default function Hero({ onCreate }: Props) {

  /* =========================
     🎬 PARALLAX (SAFE TS)
  ========================= */
  const { scrollY } = useScroll()
  const y = useTransform(scrollY, [0, 300], [0, 50])

  return (
    <section className="relative pt-28 pb-20 px-6 overflow-hidden bg-gradient-to-b from-white to-gray-50">

      {/* BACKGROUND GLOW */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-green-100 blur-3xl opacity-40 rounded-full pointer-events-none" />

      <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-12 items-center relative z-10">

        {/* TEXT */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
        >

          {/* BADGE */}
          <div className="inline-flex items-center gap-2 bg-green-100 text-green-700 px-4 py-1 rounded-full text-sm mb-8 font-medium shadow-sm">
            ● 128 campañas verificadas hoy
          </div>

          {/* TITLE */}
          <h1 className="text-4xl md:text-[56px] font-extrabold leading-[1.05] tracking-tight mb-6 text-gray-900">
            Donde los sueños{" "}
            <span className="text-green-600">encuentran su impulso</span>
          </h1>

          {/* TEXT */}
          <p className="text-gray-600 text-lg leading-relaxed mb-10 max-w-xl">
            Personas reales ayudando a otras personas.
            Crea tu campaña en minutos o dona para cambiar una vida hoy.
          </p>

          {/* CTA */}
          <div className="flex flex-col sm:flex-row gap-4">

            <motion.button
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              onClick={onCreate}
              className="bg-green-600 hover:bg-green-700 text-white px-8 py-4 rounded-2xl font-semibold shadow-lg hover:shadow-2xl transition-all text-lg"
            >
              Crear campaña →
            </motion.button>

            <Link
              href="/campaigns"
              className="border border-gray-300 px-8 py-4 rounded-2xl font-semibold text-center hover:border-green-600 hover:text-green-600 transition"
            >
              Donar ahora
            </Link>

          </div>

          {/* TRUST */}
          <div className="flex gap-6 mt-8 text-sm text-gray-500 flex-wrap">
            <span>✔ Pagos seguros</span>
            <span>✔ Transparencia total</span>
            <span>✔ Campañas verificadas</span>
          </div>

        </motion.div>

        {/* IMAGE */}
        <motion.div
          style={{ y }} // ✅ parallax aplicado aquí
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="relative"
        >

          {/* IMAGE WRAPPER */}
          <div className="relative rounded-3xl overflow-hidden shadow-[0_25px_70px_rgba(0,0,0,0.18)]">

            <img
              src="https://images.unsplash.com/photo-1516589091380-5d8e87df6999"
              className="w-full h-[440px] object-cover"
              alt="Personas ayudando en comunidad"
            />

            {/* OVERLAY */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent" />

          </div>

          {/* FLOAT CARD */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="absolute -bottom-6 left-6 bg-white px-6 py-4 rounded-2xl shadow-xl border backdrop-blur"
          >
            <p className="text-lg font-bold text-gray-900">$2.4M+</p>
            <p className="text-sm text-gray-500">Recaudado este año</p>
          </motion.div>

          {/* DONORS BADGE */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5 }}
            className="absolute top-6 right-6 bg-white/90 backdrop-blur px-4 py-2 rounded-full shadow text-sm font-medium flex items-center gap-2"
          >
            <div className="flex -space-x-2">
              <div className="w-6 h-6 rounded-full bg-green-400 border-2 border-white" />
              <div className="w-6 h-6 rounded-full bg-green-300 border-2 border-white" />
              <div className="w-6 h-6 rounded-full bg-green-200 border-2 border-white" />
            </div>
            +12K donantes
          </motion.div>

        </motion.div>

      </div>

    </section>
  )
}