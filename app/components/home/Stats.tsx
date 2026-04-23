'use client'

import { motion } from "framer-motion"
import { useEffect, useState } from "react"

/* =========================
   🔢 COUNTER PRO (TIPO STRIPE)
========================= */
function Counter({ value }: { value: number }) {
  const [count, setCount] = useState(0)

  useEffect(() => {
    let start = 0
    const duration = 1200
    const increment = value / (duration / 16)

    const timer = setInterval(() => {
      start += increment

      if (start >= value) {
        setCount(value)
        clearInterval(timer)
      } else {
        setCount(Math.floor(start))
      }
    }, 16)

    return () => clearInterval(timer)
  }, [value])

  return <>{count.toLocaleString()}</>
}

export default function Stats() {

  const stats = [
    {
      value: 2400000,
      prefix: "$",
      suffix: "+",
      label: "Total recaudado",
      desc: "En donaciones verificadas"
    },
    {
      value: 1850,
      suffix: "+",
      label: "Campañas activas",
      desc: "Historias que necesitan apoyo"
    },
    {
      value: 12000,
      suffix: "+",
      label: "Personas ayudadas",
      desc: "Vidas transformadas"
    },
    {
      value: 15,
      label: "Países",
      desc: "Impacto en Latinoamérica"
    }
  ]

  return (
    <section className="py-18 px-6">

      <div className="max-w-7xl mx-auto">

        {/* HEADER */}
        <div className="text-center mb-16">
          <p className="text-green-600 text-sm font-semibold mb-2 tracking-wider">
            IMPACTO REAL
          </p>

          <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
            Números que cuentan historias
          </h2>
        </div>

        {/* CARDS */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">

          {stats.map((s, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              viewport={{ once: true }}
              className="bg-white border rounded-2xl p-6 shadow-sm hover:shadow-xl transition-all duration-300"
            >

              <p className="text-3xl font-extrabold text-green-600 mb-2">
                {s.prefix || ""}
                <Counter value={s.value} />
                {s.suffix || ""}
              </p>

              <p className="font-semibold text-gray-800">
                {s.label}
              </p>

              <p className="text-sm text-gray-500 mt-1">
                {s.desc}
              </p>

            </motion.div>
          ))}

        </div>

      </div>

    </section>
  )
}