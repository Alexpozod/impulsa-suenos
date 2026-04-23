'use client'

import { motion } from "framer-motion"

/* =========================
   🚀 STATS (FASE LANZAMIENTO)
========================= */
export default function Stats() {

  const stats = [
    {
      icon: "🚀",
      title: "Plataforma en crecimiento",
      desc: "Nuevas campañas activándose progresivamente"
    },
    {
      icon: "✔",
      title: "Campañas verificadas",
      desc: "Revisión manual antes de publicación"
    },
    {
      icon: "💚",
      title: "Impacto real",
      desc: "Primeras historias ya están en marcha"
    },
    {
      icon: "🌍",
      title: "Expansión global",
      desc: "Disponible en múltiples países"
    }
  ]

  return (
    <section className="py-20 px-6 bg-gray-50">

      <div className="max-w-7xl mx-auto">

        {/* HEADER */}
        <div className="text-center mb-16">
          <p className="text-green-600 text-sm font-semibold mb-2 tracking-wider">
            IMPACTO REAL
          </p>

          <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
            Primeras historias que comienzan a cambiar vidas
          </h2>

          <p className="text-gray-500 mt-4 max-w-2xl mx-auto">
            Estamos en fase inicial, construyendo una plataforma segura,
            transparente y enfocada en generar impacto real.
          </p>
        </div>

        {/* CARDS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">

          {stats.map((s, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              viewport={{ once: true }}
              className="bg-white border rounded-2xl p-6 shadow-sm hover:shadow-xl transition-all duration-300"
            >

              {/* ICON */}
              <div className="text-3xl mb-3">
                {s.icon}
              </div>

              {/* TITLE */}
              <p className="font-semibold text-gray-800 mb-1">
                {s.title}
              </p>

              {/* DESC */}
              <p className="text-sm text-gray-500">
                {s.desc}
              </p>

            </motion.div>
          ))}

        </div>

      </div>

    </section>
  )
}