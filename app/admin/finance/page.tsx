'use client'

import { useFinancialDashboard } from "@/app/hooks/useFinancialDashboard"

export default function FinanceAdminPage() {

  const { data: stats, loading } = useFinancialDashboard()

  if (loading || !stats) {
    return <div className="p-10">Cargando panel financiero...</div>
  }

  return (
    <main className="min-h-screen bg-gray-50 p-6">

      <div className="max-w-7xl mx-auto space-y-8">

        <h1 className="text-3xl font-bold">
          💰 Panel Financiero PRO
        </h1>

        {/* =========================
            EXPORT
        ========================= */}
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

        {/* =========================
            STATS
        ========================= */}
        <div className="grid md:grid-cols-3 lg:grid-cols-6 gap-4">

          <Card title="Ingresos CLP" value={stats.totalIncome} />
          <Card title="USD" value={stats.totalUSD} />
          <Card title="Retiros" value={stats.totalWithdrawals} />
          <Card title="Balance" value={stats.balance} />
          <Card title="Comisiones" value={stats.totalFees} />
          <Card title="Tips" value={stats.totalTips} />

        </div>

        {/* =========================
            PROVIDERS
        ========================= */}
        <Section title="💳 Ingresos por proveedor">

          {Object.keys(stats.providers || {}).length === 0 && (
            <p className="text-sm text-gray-500">Sin datos</p>
          )}

          {Object.entries(stats.providers || {}).map(([key, val]: any) => (
            <Row key={key}>
              <span>{key}</span>
              <span>
                ${Number(val.total || 0).toLocaleString()} / ${Number(val.total_usd || 0).toFixed(2)} USD ({val.count})
              </span>
            </Row>
          ))}

        </Section>

        {/* =========================
            PAGOS
        ========================= */}
        <Section title="Pagos recientes">

          {stats.recentPayments?.length === 0 && (
            <p className="text-sm text-gray-500">Sin pagos</p>
          )}

          {stats.recentPayments?.map((p: any, i: number) => (
            <Row key={i}>
              <span>{p.user_email}</span>
              <span>${Number(p.amount).toLocaleString()}</span>
            </Row>
          ))}

        </Section>

        {/* =========================
            ERRORES
        ========================= */}
        <Section title="Errores recientes">

          {stats.errors?.length === 0 && (
            <p className="text-sm text-gray-500">No hay errores</p>
          )}

          {stats.errors?.map((e: any, i: number) => (
            <Row key={i}>
              <span>{e.message}</span>
            </Row>
          ))}

        </Section>

        {/* =========================
            PAYOUTS
        ========================= */}
        <Section title="Payouts recientes">

          {stats.payouts?.length === 0 && (
            <p className="text-sm text-gray-500">No hay payouts</p>
          )}

          {stats.payouts?.map((p: any, i: number) => (
            <Row key={i}>
              <span>{p.campaign_id}</span>
              <span>${Number(p.amount).toLocaleString()}</span>
              <span>{p.status}</span>
            </Row>
          ))}

        </Section>

        {/* =========================
            CONCILIACIÓN
        ========================= */}
        <Section title="Problemas de conciliación">

          {stats.issues?.length === 0 && (
            <p className="text-sm text-gray-500">Todo OK</p>
          )}

          {stats.issues?.map((i: any, idx: number) => (
            <Row key={idx}>
              <span>{i.payment_id}</span>
              <span>{i.issue_type}</span>
            </Row>
          ))}

        </Section>

      </div>

    </main>
  )
}

/* =========================
   COMPONENTES
========================= */

function Card({ title, value }: any) {
  return (
    <div className="bg-white p-5 rounded-xl shadow border">
      <p className="text-sm text-gray-500">{title}</p>
      <p className="text-xl font-bold">
        ${Number(value || 0).toLocaleString()}
      </p>
    </div>
  )
}

function Section({ title, children }: any) {
  return (
    <div className="bg-white p-5 rounded-xl shadow border space-y-3">
      <h2 className="font-semibold">{title}</h2>
      {children}
    </div>
  )
}

function Row({ children }: any) {
  return (
    <div className="flex justify-between text-sm border-b py-2">
      {children}
    </div>
  )
}