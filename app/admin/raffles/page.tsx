"use client"

import Link from "next/link"

const sections = [

  {
    title: "Crear Sorteo",
    icon: "➕",
    href: "/admin/raffles/create",
    description: "Crear un nuevo sorteo"
  },

  {
    title: "Gestionar",
    icon: "🎟️",
    href: "/admin/raffles/manage",
    description: "Administrar sorteos"
  },

  {
    title: "Órdenes",
    icon: "🛒",
    href: "/admin/raffles/orders",
    description: "Ver compras y órdenes"
  },

  {
    title: "Pagos",
    icon: "💳",
    href: "/admin/raffles/payments",
    description: "Pagos Flow y estados"
  },

  {
    title: "Tickets",
    icon: "🎫",
    href: "/admin/raffles/tickets",
    description: "Inventario y asignaciones"
  },

  {
    title: "Resultados",
    icon: "🏆",
    href: "/admin/raffles/results",
    description: "Ganadores y sorteos"
  },

  {
    title: "Analytics",
    icon: "📈",
    href: "/admin/raffles/analytics",
    description: "Ventas y conversión",
    featured: true
  },

  {
    title: "Fraud",
    icon: "🚨",
    href: "/admin/raffles/fraud",
    description: "Detección de fraude"
  },

  {
    title: "Exports",
    icon: "📤",
    href: "/admin/raffles/exports",
    description: "Exportar información"
  },

  {
    title: "Influencers",
    icon: "⭐",
    href: "/admin/raffles/affiliates",
    description: "Programa de afiliados"
  },

  {
    title: "Retiros",
    icon: "💰",
    href: "/admin/raffles/affiliate-payouts",
    description: "Pagos influencers"
  },

  {
    title: "Referidos",
    icon: "🎁",
    href: "/admin/raffles/referrals",
    description: "Sistema de referidos"
  }

]

export default function AdminRafflesPage() {

  return (

    <div className="p-8 space-y-8">

      <div>

        <h1 className="text-4xl font-bold">
          🎟️ Sorteos ImpulsaSueños
        </h1>

        <p className="text-slate-400 mt-2">
          Centro de control del módulo de sorteos
        </p>

      </div>

      <div
        className="
          grid
          grid-cols-1
          md:grid-cols-2
          xl:grid-cols-4
          gap-5
        "
      >

        {sections.map(section => (

          <Link
            key={section.href}
            href={section.href}
            className={`
              rounded-3xl
              border
              p-6
              transition-all
              hover:scale-[1.02]

              ${
                section.featured
                  ? `
                    border-blue-700
                    bg-gradient-to-br
                    from-blue-950/40
                    to-slate-950
                  `
                  : `
                    border-slate-800
                    bg-gradient-to-br
                    from-slate-900
                    to-slate-950
                    hover:border-blue-500
                  `
              }
            `}
          >

            <div className="text-4xl">
              {section.icon}
            </div>

            <h3
              className="
                mt-5
                text-xl
                font-bold
                text-white
              "
            >
              {section.title}
            </h3>

            <p
              className="
                mt-2
                text-sm
                text-slate-400
              "
            >
              {section.description}
            </p>

          </Link>

        ))}

      </div>

      <div
        className="
          rounded-3xl
          border
          border-slate-800
          bg-gradient-to-br
          from-slate-900
          to-slate-950
          p-8
        "
      >

        <div
          className="
            flex
            items-center
            justify-between
          "
        >

          <div>

            <p
              className="
                text-xs
                uppercase
                tracking-widest
                text-slate-500
              "
            >
              System
            </p>

            <h2
              className="
                text-2xl
                font-bold
                mt-2
              "
            >
              🛡️ Monitor del Sistema
            </h2>

            <p
              className="
                text-slate-400
                mt-2
              "
            >
              Estado general de pagos, tickets,
              webhooks y procesos automáticos.
            </p>

          </div>

          <Link
            href="/admin/raffles/system"
            className="
              px-5
              py-3
              rounded-xl
              bg-blue-600
              hover:bg-blue-500
              transition
            "
          >
            Abrir Monitor
          </Link>

        </div>

      </div>

    </div>

  )
}