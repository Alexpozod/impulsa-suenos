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
    <section className="py-16 px-6 bg-gray-50">

      <div className="max-w-7xl mx-auto">

        {/* HEADER */}
        <div className="text-center mb-12">
          <p className="text-green-600 text-sm font-semibold mb-2 tracking-wider">
            IMPACTO REAL
          </p>

          <h2 className="text-3xl md:text-5xl font-extrabold text-gray-900">
            Primeras historias que comienzan a cambiar vidas
          </h2>

          <p className="text-gray-500 mt-3 max-w-2xl mx-auto">
            Estamos en fase inicial, construyendo una plataforma segura,
            transparente y enfocada en generar impacto real.
          </p>
        </div>

        {/* CARDS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-5">

          {stats.map((s, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 25 }}
              whileInView={{ opacity: 1, y: 0 }}
              whileHover={{ y: -4 }}
              transition={{ delay: i * 0.08 }}
              viewport={{ once: true }}
              className="group bg-white border border-gray-100 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all duration-300 cursor-default"
            >

              {/* ICON */}
              <div className="w-10 h-10 flex items-center justify-center rounded-xl bg-green-50 text-lg mb-3 transition group-hover:scale-110">
                {s.icon}
              </div>

              {/* TITLE */}
              <p className="font-semibold text-gray-900 mb-1 text-sm">
                {s.title}
              </p>

              {/* DESC */}
              <p className="text-xs text-gray-500 leading-relaxed">
                {s.desc}
              </p>

            </motion.div>
          ))}

        </div>

      </div>

    </section>
  )
}