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
    label: "Dashboard"
  },

  {
    href: "/raffles/partners/links",
    label: "Links"
  },

  {
    href: "/raffles/partners/resources",
    label: "Recursos"
  },

  {
    href: "/raffles/partners/profile",
    label: "Perfil"
  },

  {
    href: "/raffles/partners/payouts",
    label: "Pagos"
  }

  ,

{
  href: "/raffles/partners/payment-simulator",
  label: "Simulador"
}

]
   
  return (

    <div
      className="
        min-h-screen
        bg-[#FAF9F5]
      "
    >

      <div
        className="
          max-w-[1500px]
          mx-auto
          flex flex-col lg:flex-row
          gap-4
          px-4
          py-8
        "
      >

        <aside
          className="
            w-full lg:w-56
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
              lg:sticky
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
                src="/raffles/brand/logo-impulsa.svg"
                alt="ImpulsaSueños Partners"
                className="w-24 h-auto object-contain"
                draggable={false}
              />

              <div>

                <div
                  className="
                    text-sm
                    text-[#002314]
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
                flex-wrap lg:flex-col
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
                    aria-current={active ? "page" : undefined}
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
                            bg-[#7048E8] text-white
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