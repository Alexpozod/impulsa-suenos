'use client'

import Link from "next/link"
import { usePathname } from "next/navigation"

export default function AdminLayout({ children }: any) {

  const path = usePathname()

  const raffleMenuOpen =
    path.startsWith("/admin/raffles")

  const Item = ({ href, label }: any) => {

    const active =
      path === href

    return (
      <Link
        href={href}
        className={`
          flex items-center px-4 py-2 rounded-xl transition

          ${
            active
              ? "bg-blue-600 text-white"
              : "text-slate-400 hover:bg-slate-800"
          }
        `}
      >
        {label}
      </Link>
    )
  }

  const SubItem = ({
    href,
    label,
    disabled = false
  }: any) => {

    const active =
      path === href

    if (disabled) {

      return (
        <div
          className="
            flex items-center
            px-4 py-2 ml-4
            rounded-xl
            text-slate-600
            cursor-not-allowed
            text-sm
          "
        >
          {label}
        </div>
      )
    }

    return (
      <Link
        href={href}
        className={`
          flex items-center
          px-4 py-2 ml-4
          rounded-xl
          transition
          text-sm

          ${
            active
              ? "bg-slate-700 text-white border border-slate-600"
              : "text-slate-400 hover:bg-slate-800"
          }
        `}
      >
        {label}
      </Link>
    )
  }

  return (

    <div className="flex min-h-screen bg-slate-950 text-white">

      {/* SIDEBAR */}
      <aside
        className="
          w-72
          bg-slate-900
          p-5
          space-y-6
          border-r border-slate-800
        "
      >

        <h2 className="text-xl font-bold">
          🚀 Impulsa Admin
        </h2>

        {/* DASHBOARD */}
        <div>

          <p className="text-xs text-slate-500 mb-2">
            Dashboard
          </p>

          <div className="space-y-1">

            <Item
              href="/admin"
              label="📊 Overview"
            />

            <Item
              href="/admin/analytics"
              label="📈 Analytics"
            />

          </div>

        </div>

        {/* FINANZAS */}
        <div>

          <p className="text-xs text-slate-500 mb-2">
            Finanzas
          </p>

          <div className="space-y-1">

            <Item
              href="/admin/finance"
              label="💰 Panel Financiero"
            />

            <Item
              href="/admin/wallet"
              label="👛 Wallets"
            />

            <Item
              href="/admin/payouts"
              label="🏦 Retiros"
            />

            <Item
              href="/admin/ledger"
              label="📒 Ledger"
            />

          </div>

        </div>

        {/* GESTIÓN */}
        <div>

          <p className="text-xs text-slate-500 mb-2">
            Gestión
          </p>

          <div className="space-y-1">

            <Item
              href="/admin/campaigns"
              label="🚀 Campañas"
            />

            {/* =========================
               RAFFLES MENU
            ========================= */}

            <div
              className={`
                rounded-2xl
                border
                transition-all

                ${
                  raffleMenuOpen
                    ? "border-slate-700 bg-slate-950/60"
                    : "border-transparent"
                }
              `}
            >

              <div
                className={`
                  flex items-center
                  justify-between
                  px-4 py-2
                  rounded-xl

                  ${
                    raffleMenuOpen
                      ? "bg-slate-800 text-white"
                      : "text-slate-300"
                  }
                `}
              >

                <span>
                  🎟️ Sorteos
                </span>

                <span className="text-xs text-slate-500">
                  {raffleMenuOpen ? "−" : "+"}
                </span>

              </div>

              {raffleMenuOpen && (

                <div className="space-y-1 py-2">

                  <SubItem
                    href="/admin/raffles"
                    label="📊 Analytics"
                  />

                  <SubItem
                    href="/admin/raffles/manage"
                    label="⚙️ Manage"
                  />

                  <SubItem
                    href="/admin/raffles/create"
                    label="➕ Create"
                  />

                  <SubItem
                    href="/admin/raffles/orders"
                    label="📦 Orders"
                  />

                  <SubItem
                    href="/admin/raffles/payments"
                    label="💳 Payments"
                  />

                  <SubItem
                    href="#"
                    label="🎟️ Tickets"
                    disabled
                  />

                  <SubItem
                    href="#"
                    label="🚨 Fraud"
                    disabled
                  />

                  <SubItem
                    href="#"
                    label="📤 Exports"
                    disabled
                  />

                </div>
              )}

            </div>

            <Item
              href="/admin/users"
              label="👥 Usuarios"
            />

            <Item
              href="/admin/kyc"
              label="🪪 KYC"
            />

          </div>

        </div>

        {/* SEGURIDAD */}
        <div>

          <p className="text-xs text-slate-500 mb-2">
            Seguridad
          </p>

          <div className="space-y-1">

            <Item
              href="/admin/risk"
              label="🚨 Riesgo"
            />

            <Item
              href="/admin/alerts"
              label="⚠️ Alertas"
            />

          </div>

        </div>

        {/* SISTEMA */}
        <div>

          <p className="text-xs text-slate-500 mb-2">
            Sistema
          </p>

          <div className="space-y-1">

            <Item
              href="/admin/events"
              label="📡 Eventos"
            />

            <Item
              href="/admin/audit"
              label="🧾 Auditoría"
            />

            <Item
              href="/admin/settings"
              label="⚙️ Configuración"
            />

            <Item
              href="/admin/reconcile"
              label="🧠 Conciliación"
            />

          </div>

        </div>

        {/* EXPORT */}
        <div>

          <a
            href="/api/admin/export"
            className="
              block
              bg-blue-600
              hover:bg-blue-500
              transition
              text-center
              py-2
              rounded-xl
              mt-4
            "
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