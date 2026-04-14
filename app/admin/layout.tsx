'use client'

import Link from "next/link"
import { usePathname } from "next/navigation"

export default function AdminLayout({ children }: any) {

  const path = usePathname()

  const Item = ({ href, label, soon }: any) => {

    const active = path === href

    return (
      <Link
        href={soon ? "#" : href}
        onClick={(e) => {
          if (soon) {
            e.preventDefault()
            alert("🚧 Próximamente")
          }
        }}
        className={`flex items-center justify-between px-4 py-2 rounded transition
          ${active ? "bg-blue-600 text-white" : "text-slate-400 hover:bg-slate-800"}
        `}
      >
        <span>{label}</span>
        {soon && <span className="text-xs text-yellow-400">Soon</span>}
      </Link>
    )
  }

  return (
    <div className="flex min-h-screen bg-slate-950 text-white">

      {/* SIDEBAR */}
      <aside className="w-72 bg-slate-900 p-5 space-y-6 border-r border-slate-800">

        <h2 className="text-xl font-bold">
          🚀 Impulsa Admin
        </h2>

        {/* DASHBOARD */}
        <div>
          <p className="text-xs text-slate-500 mb-2">Dashboard</p>
          <Item href="/admin" label="📊 Overview" />
        </div>

        {/* OPERACIONES */}
        <div>
          <p className="text-xs text-slate-500 mb-2">Operaciones</p>
          <Item href="/admin/financial" label="💰 Finanzas" />
          <Item href="/admin/payouts" label="🏦 Retiros" />
          <Item href="/admin/ledger" label="📒 Ledger" />
        </div>

        {/* GESTIÓN */}
        <div>
          <p className="text-xs text-slate-500 mb-2">Gestión</p>
          <Item href="/admin/campaigns" label="🚀 Campañas" />
          <Item href="/admin/users" label="👥 Usuarios" />
        </div>

        {/* SEGURIDAD */}
        <div>
          <p className="text-xs text-slate-500 mb-2">Seguridad</p>
          <Item href="/admin/risk" label="🚨 Riesgo" />
        </div>

        {/* FUTURO */}
        <div>
          <p className="text-xs text-slate-500 mb-2">Expansión</p>
          <Item label="📲 Notificaciones" soon />
          <Item label="🧾 Facturación" soon />
          <Item label="🌎 Multi-moneda" soon />
          <Item label="🤖 Automatización" soon />
        </div>

        {/* EXPORT */}
        <div>
          <a
            href="/api/admin/export"
            className="block bg-blue-600 text-center py-2 rounded mt-4"
          >
            📤 Exportar datos
          </a>
        </div>

      </aside>

      {/* MAIN */}
      <main className="flex-1 p-6">
        {children}
      </main>

    </div>
  )
}