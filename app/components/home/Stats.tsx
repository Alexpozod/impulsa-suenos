'use client'

import { motion } from "framer-motion"
import { Rocket, ShieldCheck, HeartHandshake, Globe } from "lucide-react"

/* =========================
   🚀 STATS NIVEL DIOS
========================= */
export default function Stats() {

  const stats = [
    {
      icon: Rocket,
      title: "Plataforma en crecimiento",
      desc: "Nuevas campañas activándose progresivamente"
    },
    {
      icon: ShieldCheck,
      title: "Campañas verificadas",
      desc: "Revisión manual antes de publicación"
    },
    {
      icon: HeartHandshake,
      title: "Impacto real",
      desc: "Primeras historias ya están en marcha"
    },
    {
      icon: Globe,
      title: "Expansión global",
      desc: "Disponible en múltiples países"
    }
  ]

  return (
    <section className="py-14 px-6 bg-gray-50">

      <div className="max-w-7xl mx-auto">

        {/* HEADER */}
        <div className="text-center mb-10">
          <p className="text-green-600 text-sm font-semibold mb-2 tracking-wider">
            IMPACTO REAL
          </p>

          <h2 className="text-3xl md:text-5xl font-extrabold text-gray-900">
            Primeras historias que comienzan a cambiar vidas
          </h2>

          <p className="text-gray-500 mt-3 max-w-2xl mx-auto">
            Estamos construyendo una plataforma segura, transparente y enfocada en generar impacto real.
          </p>
        </div>

        {/* GRID */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-5">

          {stats.map((s, i) => {
            const Icon = s.icon

            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                whileHover={{ y: -6 }}
                transition={{ delay: i * 0.08 }}
                viewport={{ once: true }}
                className="group relative bg-white border border-gray-100 rounded-2xl p-5 shadow-sm hover:shadow-lg transition-all duration-300"
              >

                {/* 🔥 GLOW EFFECT */}
                <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition duration-300 bg-gradient-to-br from-green-50 via-transparent to-transparent" />

                {/* CONTENT */}
                <div className="relative z-10">

                  {/* ICON */}
                  <div className="w-11 h-11 flex items-center justify-center rounded-xl bg-green-50 mb-3 transition group-hover:scale-110">

                    <Icon className="w-5 h-5 text-green-600" />

                  </div>

                  {/* TITLE */}
                  <p className="font-semibold text-gray-900 mb-1 text-sm">
                    {s.title}
                  </p>

                  {/* DESC */}
                  <p className="text-xs text-gray-500 leading-relaxed">
                    {s.desc}
                  </p>

                </div>

              </motion.div>
            )
          })}

        </div>

      </div>

    </section>
  )
}