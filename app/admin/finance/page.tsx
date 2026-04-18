'use client'

import { useEffect, useState } from "react"
import { useFinancialDashboard } from "@/app/hooks/useFinancialDashboard"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer
} from "recharts"

export default function FinanceAdminPage() {

  const { data: stats, loading } = useFinancialDashboard()

  const [topCampaigns, setTopCampaigns] = useState<any[]>([])
  const [balances, setBalances] = useState<any[]>([])

  useEffect(() => {
    loadTop()
    loadBalances()
  }, [])

  const loadTop = async () => {
    try {
      const res = await fetch("/api/admin/top-campaigns")
      const data = await res.json()
      setTopCampaigns(data)
    } catch (e) {
      console.error("Top campaigns error", e)
    }
  }

  const loadBalances = async () => {
    try {
      const res = await fetch("/api/admin/campaign-balances")
      const data = await res.json()
      setBalances(data)
    } catch (e) {
      console.error("Balances error", e)
    }
  }

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

        {/* =========================
           🔥 KPIs PRINCIPALES
        ========================= */}
        <div className="grid md:grid-cols-3 lg:grid-cols-6 gap-4">

          <Card title="Ingresos" value={stats.totalIncome} />
          <Card title="USD" value={stats.totalUSD} />
          <Card title="Retiros" value={stats.totalWithdrawals} />
          <Card title="Balance" value={stats.balance} />
          <Card title="Comisiones" value={stats.totalFees} />
          <Card title="Tips" value={stats.totalTips} />

          <Card
            title="Ticket promedio"
            value={
              stats.totalPayments > 0
                ? Math.round(stats.totalIncome / stats.totalPayments)
                : 0
            }
          />

        </div>

        {/* =========================
           🚀 KPIs PRO (NUEVOS)
        ========================= */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">

          <Card title="Profit" value={stats.profit} />

          <Card
            title="Margen %"
            value={Number(stats.margin || 0).toFixed(2)}
          />

          <Card
            title="Take Rate %"
            value={Number(stats.takeRate || 0).toFixed(2)}
          />

          <Card
            title="Fee Promedio"
            value={stats.avgFeePerPayment}
          />

        </div>

        {/* 📈 GRÁFICO */}
        <RevenueChart data={stats.daily} />

        {/* =========================
           🚨 ALERTAS
        ========================= */}

        {stats.totalWithdrawals > stats.totalIncome * 0.8 && (
          <div className="bg-red-900 p-3 rounded-xl border border-red-700">
            ⚠️ Retiros altos respecto a ingresos
          </div>
        )}

        {stats.totalProviderFees === 0 && (
          <div className="bg-yellow-900 p-3 rounded-xl border border-yellow-700">
            ⚠️ No se detectan comisiones de pasarela
          </div>
        )}

        {stats.margin < 5 && (
          <div className="bg-yellow-900 p-3 rounded-xl border border-yellow-700">
            ⚠️ Margen bajo (menos del 5%)
          </div>
        )}

        {stats.margin > 20 && (
          <div className="bg-green-900 p-3 rounded-xl border border-green-700">
            🚀 Excelente margen de negocio
          </div>
        )}

        {/* =========================
           🏆 TOP CAMPAÑAS
        ========================= */}
        <Section title="🏆 Top campañas">

          {topCampaigns.length === 0 && (
            <p className="text-gray-400 text-sm">Sin datos</p>
          )}

          {topCampaigns.map((c, i) => (
            <Row key={i}>
              <span className="text-blue-400">
                {c.title}
              </span>

              <span className="text-green-400">
                ${Number(c.total).toLocaleString()}
                {" "}
                ({c.percentage?.toFixed(1)}%)
              </span>
            </Row>
          ))}

        </Section>

        {/* =========================
           💰 BALANCE POR CAMPAÑA
        ========================= */}
        <Section title="💰 Balance por campaña">

          {balances.length === 0 && (
            <p className="text-gray-400 text-sm">Sin datos</p>
          )}

          {balances.map((c) => (
            <Row key={c.campaign_id}>
              <span className="text-blue-400">
                {c.title}
              </span>

              <span className="text-green-400">
                ${Number(c.balance).toLocaleString()}
              </span>
            </Row>
          ))}

        </Section>

        {/* =========================
           💳 PAGOS
        ========================= */}
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

/* =========================
   📊 GRÁFICO
========================= */

function RevenueChart({ data }: any) {

  const chartData = Object.entries(data || {}).map(([date, val]: any) => ({
    date,
    total: val.total
  }))

  return (
    <div className="bg-slate-900 p-5 rounded-xl border border-slate-800">

      <h2 className="mb-4 text-gray-200 font-semibold">
        📈 Ingresos por día
      </h2>

      {chartData.length === 0 && (
        <p className="text-gray-400 text-sm">Sin datos</p>
      )}

      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={chartData}>
          <XAxis dataKey="date" stroke="#94a3b8" />
          <YAxis stroke="#94a3b8" />
          <Tooltip />
          <Line
            type="monotone"
            dataKey="total"
            stroke="#22c55e"
            strokeWidth={2}
          />
        </LineChart>
      </ResponsiveContainer>

    </div>
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