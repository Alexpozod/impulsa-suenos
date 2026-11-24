import type { ReactNode } from "react"
import { rafflesFontVariables } from "@/lib/raffles/brand/fonts"
import "@/lib/raffles/brand/raffles-brand.css"

/**
 * Scoped to /admin/raffles. Inherits the existing shared admin shell;
 * does not change campaign pages, admin navigation or auth flows.
 */
export default function RafflesAdminBrandLayout({
  children
}: {
  children: ReactNode
}) {
  return (
    <div className={`raffles-brand raffles-brand-admin min-h-screen bg-[#FAF9F5] text-[#002314] ${rafflesFontVariables}`}>
      {children}
    </div>
  )
}
