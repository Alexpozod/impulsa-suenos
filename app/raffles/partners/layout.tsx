"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

export default function PartnersLayout({
  children
}: {
  children: React.ReactNode
}) {

  const pathname =
    usePathname()

  const menu = [

    {
      href:
        "/raffles/partners/dashboard",

      label:
        "Dashboard",

      icon:
        "📊"
    },

    {
      href:
        "/raffles/partners/links",

      label:
        "Links",

      icon:
        "🔗"
    },

    {
      href:
        "/raffles/partners/profile",

      label:
        "Perfil",

      icon:
        "👤"
    },

    {
      href:
        "/raffles/partners/payouts",

      label:
        "Pagos",

      icon:
        "💰"
    }

  ]

  return (

    <div
      className="
        min-h-screen
        bg-slate-50
      "
    >

      <div
        className="
          max-w-7xl
          mx-auto
          flex
          gap-6
          px-4
          py-8
        "
      >

        <aside
          className="
            w-64
            shrink-0
          "
        >

          <div
            className="
              bg-white
              rounded-3xl
              shadow-sm
              border
              p-5
            "
          >

            <div
              className="
                text-2xl
                font-black
                mb-6
              "
            >
              🚀 Partners
            </div>

            <div
              className="
                flex
                flex-col
                gap-2
              "
            >

              {menu.map(item => (

                <Link
                  key={item.href}
                  href={item.href}
                  className={`
                    px-4
                    py-3
                    rounded-xl
                    transition

                    ${
                      pathname === item.href

                        ? "bg-gradient-to-r from-blue-600 via-purple-600 to-cyan-500 text-white"

                        : "hover:bg-slate-100"
                    }
                  `}
                >

                  {item.icon}
                  {" "}
                  {item.label}

                </Link>

              ))}

            </div>

          </div>

        </aside>

        <main className="flex-1">

          {children}

        </main>

      </div>

    </div>

  )
}