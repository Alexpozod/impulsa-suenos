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
    href: "/raffles/partners/dashboard",
    label: "Dashboard",
    icon: "📊"
  },

  {
    href: "/raffles/partners/links",
    label: "Links",
    icon: "🔗"
  },

  {
    href: "/raffles/partners/resources",
    label: "Recursos",
    icon: "📦"
  },

  {
    href: "/raffles/partners/profile",
    label: "Perfil",
    icon: "👤"
  },

  {
    href: "/raffles/partners/payouts",
    label: "Pagos",
    icon: "💰"
  }

]
   
  return (

    <div
      className="
        min-h-screen
        bg-gradient-to-br
        from-slate-50
        via-white
        to-slate-100
      "
    >

      <div
        className="
          max-w-[1500px]
          mx-auto
          flex
          gap-4
          px-4
          py-8
        "
      >

        <aside
          className="
            w-56
            shrink-0
          "
        >

          <div
            className="
              bg-white/80
              backdrop-blur-xl
              rounded-3xl
              shadow-xl
              p-5
              sticky
              top-6
            "
          >

            <div
              className="
                flex
                items-center
                gap-3
                mb-8
              "
            >

              <img
                src="/favicon-removebg-preview.png"
                alt="Partners"
                className="
                  w-10
                  h-10
                  object-contain
                "
              />

              <div>

                <div
                  className="
                    text-sm
                    text-slate-500
                  "
                >
                  ImpulsaSueños
                </div>

                <div
                  className="
                    text-xl
                    font-black
                  "
                >
                  Partners
                </div>

              </div>

            </div>

            <nav
              className="
                flex
                flex-col
                gap-2
              "
            >

              {menu.map(item => {

                const active =
                  pathname === item.href

                return (

                  <Link
                    key={item.href}
                    href={item.href}
                    className={`
                      flex
                      items-center
                      gap-3
                      px-4
                      py-3
                      rounded-2xl
                      transition-all

                      ${
                        active

                          ? `
                            bg-gradient-to-r
                            from-blue-600
                            via-purple-600
                            to-cyan-500
                            text-white
                            shadow-lg
                          `

                          : `
                            text-slate-700
                            hover:bg-slate-100
                          `
                      }
                    `}
                  >

                    <span>
                      {item.icon}
                    </span>

                    <span
                      className="
                        font-medium
                      "
                    >
                      {item.label}
                    </span>

                  </Link>

                )

              })}

            </nav>

          </div>

        </aside>

        <main
          className="
            flex-1
            min-w-0
          "
        >

          {children}

        </main>

      </div>

    </div>

  )
}