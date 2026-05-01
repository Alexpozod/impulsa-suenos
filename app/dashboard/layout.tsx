"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import type { ReactNode } from "react"

export default function DashboardLayout({
  children,
}: {
  children: ReactNode
}) {

  const pathname = usePathname()

  const nav = [
    { name: "Resumen", href: "/dashboard" },
    { name: "Campañas", href: "/dashboard/campaigns" },
    { name: "Finanzas", href: "/dashboard/finance" },
    { name: "Notificaciones", href: "/dashboard/notifications" },
    { name: "KYC", href: "/dashboard/kyc" }
    { name: "Mi cuenta", href: "/account" }, // no rompemos nada
    { name: "Donaciones", href: "/dashboard/donations" },
  ]

  return (
    <div className="flex min-h-screen bg-gray-50">

      {/* SIDEBAR */}
      <aside className="w-64 bg-white border-r hidden md:block">

        <div className="p-6 font-bold text-lg">
          Dashboard
        </div>

        <nav className="flex flex-col gap-1 px-3">

          {nav.map((item) => {

            const active = pathname === item.href

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`px-4 py-2 rounded-lg text-sm transition
                  ${active
                    ? "bg-green-100 text-green-700 font-semibold"
                    : "text-gray-600 hover:bg-gray-100"}
                `}
              >
                {item.name}
              </Link>
            )
          })}

        </nav>

      </aside>

      {/* CONTENIDO */}
      <main className="flex-1">

        {/* MOBILE TOP BAR */}
        <div className="md:hidden p-4 border-b bg-white">
          <p className="font-semibold">Dashboard</p>
        </div>

        <div className="p-4 md:p-6">
          {children}
        </div>

      </main>

    </div>
  )
}