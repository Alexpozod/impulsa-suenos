'use client'

import { useFinancialDashboard } from "@/app/hooks/useFinancialDashboard"

export default function FinanceAdminPage() {

  const { data: stats, loading } = useFinancialDashboard()

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-gray-100 p-6">
        Cargando panel financiero...
      </div>
    )
  }

  if (!stats) {
    return (
      <div className="min-h-screen bg-slate-950 text-red-400 p-6">
        Error cargando datos
      </div>
    )
  }

  return (
    <main className="min-h-screen bg-slate-950 text-gray-100 p-6">

      <div className="max-w-7xl mx-auto space-y-8">

        <h1 className="text-3xl font-bold">
          💰 Panel Financiero PRO
        </h1>

        {/* EXPORT */}
        <div className="flex gap-3">

          <button
            onClick={() => {
              const from = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString()
              const to = new Date().toISOString()
              window.open(`/api/admin/export?from=${from}&to=${to}`)
            }}
            className="bg-black text-white px-4 py-2 rounded-lg"
          >
            📥 Exportar mes actual
          </button>

          <button
            onClick={() => {
              window.open(`/api/admin/export`)
            }}
            className="bg-gray-700 text-white px-4 py-2 rounded-lg"
          >
            📥 Exportar todo
          </button>

        </div>

        {/* STATS */}
        <div className="grid md:grid-cols-3 lg:grid-cols-6 gap-4">

          <Card title="Ingresos CLP" value={stats.totalIncome} />
          <Card title="USD" value={stats.totalUSD} />
          <Card title="Retiros" value={stats.totalWithdrawals} />
          <Card title="Balance" value={stats.balance} />
          <Card title="Comisiones" value={stats.totalFees} />
          <Card title="Tips" value={stats.totalTips} />

        </div>

        {/* PAGOS */}
        <Section title="Pagos recientes">

          {stats.recentPayments?.length === 0 && (
            <p className="text-gray-400">Sin pagos</p>
          )}

          {stats.recentPayments?.map((p: any, i: number) => (
            <Row key={i}>
              <span>{p.user_email || "Usuario"}</span>
              <span className="text-green-400">
                ${Number(p.amount || 0).toLocaleString()}
              </span>
            </Row>
          ))}

        </Section>

      </div>

    </main>
  )
}

/* COMPONENTES */

function Card({ title, value }: any) {
  return (
    <div className="bg-slate-900 p-5 rounded-xl border border-slate-800">
      <p className="text-sm text-gray-400">{title}</p>
      <p className="text-xl font-bold text-green-400">
        ${Number(value || 0).toLocaleString()}
      </p>
    </div>
  )
}

function Section({ title, children }: any) {
  return (
    <div className="bg-slate-900 p-5 rounded-xl border border-slate-800 space-y-3">
      <h2 className="font-semibold text-gray-200">{title}</h2>
      {children}
    </div>
  )
}

function Row({ children }: any) {
  return (
    <div className="flex justify-between text-sm border-b border-slate-800 py-2">
      {children}
    </div>
  )
}