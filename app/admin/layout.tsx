'use client'

import Link from "next/link"
import { usePathname } from "next/navigation"

export default function AdminLayout({ children }: any) {

  const path = usePathname()

  const Item = ({ href, label }: any) => {

    const active = path === href

    return (
      <Link
        href={href}
        className={`flex items-center px-4 py-2 rounded transition
          ${active ? "bg-blue-600 text-white" : "text-slate-400 hover:bg-slate-800"}
        `}
      >
        {label}
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

        {/* FINANZAS */}
        <div>
          <p className="text-xs text-slate-500 mb-2">Finanzas</p>

          {/* 🔥 RUTA CORRECTA */}
          <Item href="/admin/finance" label="💰 Panel Financiero" />

          <Item href="/admin/wallet" label="👛 Wallets" />

          <Item href="/admin/payouts" label="🏦 Retiros" />

          <Item href="/admin/ledger" label="📒 Ledger" />
        </div>

        {/* GESTIÓN */}
        <div>
          <p className="text-xs text-slate-500 mb-2">Gestión</p>
          <Item href="/admin/campaigns" label="🚀 Campañas" />
          <Item href="/admin/users" label="👥 Usuarios" />
          <Item href="/admin/kyc" label="🪪 KYC" />
        </div>

        {/* SEGURIDAD */}
        <div>
          <p className="text-xs text-slate-500 mb-2">Seguridad</p>
          <Item href="/admin/risk" label="🚨 Riesgo" />
          <Item href="/admin/alerts" label="⚠️ Alertas" />
        </div>

        {/* SISTEMA */}
        <div>
          <p className="text-xs text-slate-500 mb-2">Sistema</p>
          <Item href="/admin/events" label="📡 Eventos" />
          <Item href="/admin/audit" label="🧾 Auditoría" />
          <Item href="/admin/settings" label="⚙️ Configuración" />
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