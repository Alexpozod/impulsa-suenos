"use client"

import Link from "next/link"

const sections = [
  {
    title: "Crear Sorteo",
    description: "Nuevo sorteo",
    icon: "➕",
    href: "/admin/raffles/create"
  },
  {
    title: "Gestionar",
    description: "Administrar",
    icon: "🎟️",
    href: "/admin/raffles/manage"
  },
  {
    title: "Órdenes",
    description: "Compras",
    icon: "🛒",
    href: "/admin/raffles/orders"
  },
  {
    title: "Pagos",
    description: "Flow",
    icon: "💳",
    href: "/admin/raffles/payments"
  },
  {
    title: "Tickets",
    description: "Inventario",
    icon: "🎫",
    href: "/admin/raffles/tickets"
  },
  {
    title: "Resultados",
    description: "Ganadores",
    icon: "🏆",
    href: "/admin/raffles/results"
  },
  {
    title: "Analytics",
    description: "Ventas",
    icon: "📈",
    href: "/admin/raffles/analytics",
    featured: true
  },
  {
    title: "Fraud",
    description: "Seguridad",
    icon: "🚨",
    href: "/admin/raffles/fraud"
  },
  {
    title: "Exports",
    description: "Reportes",
    icon: "📤",
    href: "/admin/raffles/exports"
  },
  {
    title: "Influencers",
    description: "Afiliados",
    icon: "⭐",
    href: "/admin/raffles/affiliates"
  },
  {
    title: "Retiros",
    description: "Pagos",
    icon: "💰",
    href: "/admin/raffles/affiliate-payouts"
  },
  {
    title: "Referidos",
    description: "Programa",
    icon: "🎁",
    href: "/admin/raffles/referrals"
  }
]

export default function AdminRafflesPage() {

  return (

    <div className="p-8 space-y-8">

      {/* HEADER */}

      <div>

        <h1 className="text-4xl font-bold text-white">
          🎟️ Sorteos ImpulsaSueños
        </h1>

        <p className="text-slate-400 mt-2">
          Centro de administración del sistema de sorteos
        </p>

      </div>

      {/* QUICK ACCESS */}

      <div
        className="
          grid
          grid-cols-2
          md:grid-cols-3
          xl:grid-cols-4
          2xl:grid-cols-6
          gap-4
        "
      >

        {sections.map(section => (

          <Link
            key={section.href}
            href={section.href}
            className={`
              rounded-2xl
              border
              p-4
              transition-all
              hover:border-blue-500

              ${
                section.featured
                  ? "border-blue-700 bg-blue-950/20"
                  : "border-slate-800 bg-slate-900"
              }
            `}
          >

            <div className="text-3xl">
              {section.icon}
            </div>

            <h3
              className="
                mt-3
                text-lg
                font-semibold
                text-white
              "
            >
              {section.title}
            </h3>

            <p
              className="
                mt-1
                text-xs
                text-slate-400
              "
            >
              {section.description}
            </p>

          </Link>

        ))}

      </div>

      {/* SYSTEM CARD */}

      <div
        className="
          rounded-3xl
          border
          border-slate-800
          bg-gradient-to-br
          from-slate-900
          to-slate-950
          p-6
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
                tracking-wider
                text-slate-500
              "
            >
              System
            </p>

            <h2
              className="
                text-2xl
                font-bold
                text-white
                mt-2
              "
            >
              🛡️ Monitor del Sistema
            </h2>

            <p
              className="
                mt-2
                text-slate-400
              "
            >
              Estado general de pagos, tickets, webhooks y procesos automáticos.
            </p>

          </div>

          <Link
            href="/admin/raffles/system"
            className="
              px-6
              py-3
              rounded-xl
              bg-white
              text-slate-900
              font-semibold
              hover:bg-slate-200
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