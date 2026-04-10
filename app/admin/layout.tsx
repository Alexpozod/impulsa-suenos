'use client'

import Link from "next/link"
import { usePathname } from "next/navigation"

export default function AdminLayout({ children }: any) {

  const path = usePathname()

  const Item = ({ href, label }: any) => (
    <Link
      href={href}
      className={`block px-4 py-2 rounded ${
        path === href
          ? "bg-blue-600 text-white"
          : "text-slate-400 hover:bg-slate-800"
      }`}
    >
      {label}
    </Link>
  )

  return (
    <div className="flex min-h-screen bg-slate-950 text-white">

      {/* SIDEBAR */}
      <aside className="w-64 bg-slate-900 p-4 space-y-6">

        <h2 className="text-xl font-bold mb-4">
          ⚙️ Admin
        </h2>

        {/* DASHBOARD */}
        <div>
          <p className="text-xs text-slate-500 mb-2">Dashboard</p>
          <Item href="/admin/dashboard" label="📊 Overview" />
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

        {/* SISTEMA */}
        <div>
          <p className="text-xs text-slate-500 mb-2">Sistema</p>
          <a
            href="/api/admin/export"
            className="block px-4 py-2 text-slate-400 hover:bg-slate-800 rounded"
          >
            📤 Exportar
          </a>
        </div>

      </aside>

      {/* CONTENT */}
      <main className="flex-1 p-6">
        {children}
      </main>

    </div>
  )
}