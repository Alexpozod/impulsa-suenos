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

  ,

{
  href: "/raffles/partners/payment-simulator",
  label: "Simulador",
  icon: "🧮"
}

]
   
  return (

    <div
      className="
        min-h-screen
        bg-gradient-to-br
        from-[#FAF9F5]
        via-[#FAF9F5]
        to-[#EDE8FD]
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
              bg-white/95
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
                src="/logo-email.png"
                alt="ImpulsaSueños Partners"
                className="
                  w-10
                  h-10
                  object-contain
                "
                draggable={false}
              />

              <div>

                <div
                  className="
                    text-sm
                    text-[#56665C]
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
                            bg-[#7048E8]
                            text-white
                            shadow-lg
                          `

                          : `
                            text-[#002314]
                            hover:bg-[#EDE8FD]
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