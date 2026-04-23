'use client'

import { motion } from "framer-motion"

const features = [
  {
    title: "Pagos 100% seguros",
    desc: "Procesamos todas las transacciones con cifrado avanzado y protección antifraude.",
    icon: "🔒",
  },
  {
    title: "Transparencia total",
    desc: "Cada donación es rastreable. Puedes ver en tiempo real a dónde va tu dinero.",
    icon: "👁️",
  },
  {
    title: "Campañas verificadas",
    desc: "Revisamos cada campaña para evitar fraudes y proteger a la comunidad.",
    icon: "✅",
  },
  {
    title: "Retiros seguros",
    desc: "Los fondos se transfieren directamente a cuentas verificadas.",
    icon: "🏦",
  },
]

export default function Trust() {
  return (
    <section className="py-18 px-6 bg-white">

      <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-center">

        {/* LEFT CONTENT */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >

          <p className="text-green-600 text-sm font-semibold tracking-wider mb-3">
            SEGURIDAD Y CONFIANZA
          </p>

          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
            Tu dinero está protegido en cada paso
          </h2>

          <p className="text-gray-500 mb-10 max-w-lg">
            Sabemos que donar requiere confianza. Por eso diseñamos cada parte de la plataforma
            pensando en seguridad, transparencia y control total.
          </p>

          {/* FEATURES */}
          <div className="space-y-6">
            {features.map((f, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
                viewport={{ once: true }}
                className="flex gap-4 items-start"
              >

                <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center text-xl">
                  {f.icon}
                </div>

                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">
                    {f.title}
                  </h3>
                  <p className="text-sm text-gray-500 leading-relaxed">
                    {f.desc}
                  </p>
                </div>

              </motion.div>
            ))}
          </div>

        </motion.div>

        {/* RIGHT IMAGE + CARD */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="relative"
        >

          <img
            src="https://images.unsplash.com/photo-1450101499163-c8848c66ca85"
            className="rounded-3xl w-full h-[420px] object-cover shadow-xl"
          />

          {/* FLOATING TRUST CARD */}
          <div className="absolute -bottom-6 -left-6 bg-white px-6 py-4 rounded-2xl shadow-xl border w-[240px]">

            <p className="text-sm font-semibold text-gray-900 mb-1">
              🔐 Plataforma segura
            </p>

            <p className="text-xs text-gray-500">
              Protección antifraude + verificación de usuarios
            </p>

          </div>

        </motion.div>

      </div>

    </section>
  )
}