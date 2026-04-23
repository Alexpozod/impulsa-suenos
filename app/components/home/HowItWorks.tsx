'use client'

import { motion } from "framer-motion"

const steps = [
  {
    number: "01",
    title: "Crea tu campaña",
    description:
      "Cuenta tu historia, establece tu meta y personaliza tu página en minutos. Sin costos iniciales.",
    icon: "✍️",
  },
  {
    number: "02",
    title: "Comparte con el mundo",
    description:
      "Difunde tu campaña en redes sociales y WhatsApp. Llega a más personas fácilmente.",
    icon: "📢",
  },
  {
    number: "03",
    title: "Recibe el apoyo",
    description:
      "Los fondos llegan de forma segura. Retira cuando quieras, sin complicaciones.",
    icon: "💚",
  },
]

export default function HowItWorks() {
  return (
    <section className="py-20 px-6 bg-gray-50">

      <div className="max-w-7xl mx-auto">

        {/* HEADER */}
        <div className="text-center mb-20">
          <p className="text-green-600 text-sm font-semibold tracking-wider mb-3">
            SIMPLE Y TRANSPARENTE
          </p>

          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            ¿Cómo funciona?
          </h2>

          <p className="text-gray-500 max-w-xl mx-auto">
            Tres pasos para convertir tu sueño en realidad con el apoyo de una comunidad.
          </p>
        </div>

        {/* STEPS */}
        <div className="grid md:grid-cols-3 gap-10 relative">

          {/* LINEA (desktop) */}
          <div className="hidden md:block absolute top-16 left-[15%] right-[15%] h-[2px] bg-gray-200" />

          {steps.map((step, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.2 }}
              viewport={{ once: true }}
              className="text-center relative"
            >

              {/* ICON + NUMBER */}
              <div className="relative inline-block mb-6">

                <div className="w-16 h-16 rounded-2xl bg-white shadow-md flex items-center justify-center text-2xl">
                  {step.icon}
                </div>

                <div className="absolute -top-2 -right-2 w-7 h-7 bg-green-600 text-white text-xs font-bold rounded-full flex items-center justify-center">
                  {step.number}
                </div>

              </div>

              {/* TEXT */}
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {step.title}
              </h3>

              <p className="text-gray-500 text-sm leading-relaxed max-w-xs mx-auto">
                {step.description}
              </p>

            </motion.div>
          ))}

        </div>

      </div>

    </section>
  )
}