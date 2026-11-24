import Link from "next/link"
import type { ReactNode } from "react"

const pages = [
  ["", "Resumen"], ["manage", "Sorteos"], ["create", "Crear sorteo"], ["live", "En vivo"],
  ["tickets", "Tickets"], ["orders", "Órdenes"], ["payments", "Pagos"], ["results", "Resultados"],
  ["affiliates", "Afiliados"], ["affiliate-payouts", "Retiros"], ["referrals", "Referidos"],
  ["promotions", "Promociones"], ["resources", "Recursos"], ["exports", "Exportaciones"],
  ["analytics", "Estadísticas"], ["audit", "Auditoría"], ["fraud", "Fraude"],
  ["public-site", "Sitio público"], ["system", "Sistema"],
]

export default function AdminLayout({ children }: { children: ReactNode }) {
  return <div className="min-h-screen bg-[#FAF9F5] text-[#002314] lg:flex">
    <nav aria-label="Administración de Sorteos" className="flex flex-wrap gap-2 bg-[#002314] p-4 text-white lg:w-64 lg:flex-col">
      {pages.map(([path, label]) => <Link key={label} href={path ? `/admin/raffles/${path}` : "/admin/raffles"}>{label}</Link>)}
    </nav>
    <main className="min-w-0 flex-1 p-6">{children}</main>
  </div>
}
