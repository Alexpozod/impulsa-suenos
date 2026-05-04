'use client'

import { motion } from "framer-motion"
import { Rocket, Megaphone, HeartHandshake } from "lucide-react"

const steps = [
  {
    number: "01",
    title: "Crea tu campaña",
    description:
      "Cuenta tu historia, establece tu meta y personaliza tu página en minutos. Sin costos iniciales.",
    icon: Rocket,
  },
  {
    number: "02",
    title: "Comparte con el mundo",
    description:
      "Difunde tu campaña en redes sociales y WhatsApp. Llega a más personas fácilmente.",
    icon: Megaphone,
  },
  {
    number: "03",
    title: "Recibe el apoyo",
    description:
      "Los fondos llegan de forma segura. Retira cuando quieras, sin complicaciones.",
    icon: HeartHandshake,
  },
]

export default function HowItWorks() {
  return (
    <section className="py-12 px-6 bg-gray-50">

      <div className="max-w-7xl mx-auto">

        {/* HEADER */}
        <div className="text-center mb-12">
          <p className="text-green-600 text-sm font-semibold tracking-wider mb-3">
            SIMPLE Y TRANSPARENTE
          </p>

          <h2 className="text-3xl md:text-5xl font-extrabold text-gray-900 mb-4">
            ¿Cómo funciona?
          </h2>

          <p className="text-gray-500 max-w-xl mx-auto">
            Tres pasos para convertir tu sueño en realidad con el apoyo de una comunidad.
          </p>
        </div>

        {/* STEPS */}
        <div className="grid md:grid-cols-3 gap-8 relative">

          {/* LINEA PRO */}
          <div className="hidden md:block absolute top-14 left-[10%] right-[10%] h-[2px] bg-gradient-to-r from-transparent via-green-200 to-transparent" />

          {steps.map((step, i) => {
            const Icon = step.icon

            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.15 }}
                viewport={{ once: true }}
                className="text-center relative group"
              >

                {/* ICON */}
                <motion.div
                  whileHover={{ scale: 1.08 }}
                  className="relative inline-flex items-center justify-center mb-6"
                >

                  <div className="w-16 h-16 rounded-2xl bg-white border border-gray-100 shadow-sm flex items-center justify-center transition group-hover:shadow-md">

                    <Icon className="w-7 h-7 text-green-600" />

                  </div>

                  {/* NUMBER */}
                  <div className="absolute -top-2 -right-2 w-7 h-7 bg-green-600 text-white text-xs font-bold rounded-full flex items-center justify-center shadow-sm">
                    {step.number}
                  </div>

                </motion.div>

                {/* TITLE */}
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {step.title}
                </h3>

                {/* DESCRIPTION */}
                <p className="text-gray-600 text-sm leading-relaxed max-w-xs mx-auto">
                  {step.description}
                </p>

              </motion.div>
            )
          })}

        </div>

      </div>

    </section>
  )
}