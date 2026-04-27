'use client'

import { useEffect, useState } from "react"
import { useAdminFinancialDashboard } from "@/app/hooks/useAdminFinancialDashboard"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer
} from "recharts"

export default function FinanceAdminPage() {

  const { data: stats, loading } = useAdminFinancialDashboard()

  const [topCampaigns, setTopCampaigns] = useState<any[]>([])
  const [balances, setBalances] = useState<any[]>([])
  const [profitRanking, setProfitRanking] = useState<any[]>([])
  const [unhealthyCampaigns, setUnhealthyCampaigns] = useState<any[]>([])

  useEffect(() => {
    loadTop()
    loadBalances()
    loadProfit()
  }, [])

  const loadTop = async () => {
    try {
      const res = await fetch("/api/admin/top-campaigns")
      const data = await res.json()
      setTopCampaigns(Array.isArray(data) ? data : [])
    } catch (e) {
      console.error("Top campaigns error", e)
      setTopCampaigns([])
    }
  }

  const loadBalances = async () => {
    try {
      const res = await fetch("/api/admin/campaign-balances")
      const data = await res.json()
      setBalances(Array.isArray(data) ? data : [])
    } catch (e) {
      console.error("Balances error", e)
      setBalances([])
    }
  }

  const loadProfit = async () => {
    try {
      const res = await fetch("/api/admin/campaign-profit")
      const data = await res.json()
      setProfitRanking(Array.isArray(data?.ranking) ? data.ranking : [])
      setUnhealthyCampaigns(Array.isArray(data?.unhealthy) ? data.unhealthy : [])
    } catch (e) {
      console.error("Profit ranking error", e)
      setProfitRanking([])
      setUnhealthyCampaigns([])
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
            onClick={() => window.open(`/api/admin/export`)}
            className="bg-gray-700 text-white px-4 py-2 rounded-lg"
          >
            📥 Exportar todo
          </button>
        </div>

        {/* KPIs */}
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

        {/* KPIs PRO */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card title="Profit" value={stats.profit} />
          <Card title="Margen %" value={Number(stats.margin || 0).toFixed(2)} />
          <Card title="Take Rate %" value={Number(stats.takeRate || 0).toFixed(2)} />
          <Card title="Fee Promedio" value={stats.avgFeePerPayment} />
        </div>

        {/* 🔥 DESGLOSE COMPLETO */}
        <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-4">

          <Card title="Fee Plataforma (Base)" value={stats?.platform?.base} />
          <Card title="IVA Plataforma" value={stats?.platform?.iva} />

          {/* 🔥 NUEVO */}
          <Card title="Fee Fijo ($300)" value={stats?.feeBreakdown?.fixed} />
          <Card title="Fee Variable (1%)" value={stats?.feeBreakdown?.variable} />

          <Card title="Neto a Creadores" value={stats?.creatorNet} />

        </div>

        {/* GRÁFICO */}
        <RevenueChart data={stats.daily || {}} />

        {/* ALERTAS */}
        {stats.totalWithdrawals > stats.totalIncome * 0.8 && (
          <Alert type="red" text="Retiros altos respecto a ingresos" />
        )}

        {stats.margin < 5 && (
          <Alert type="yellow" text="Margen bajo (menos del 5%)" />
        )}

        {stats.margin > 20 && (
          <Alert type="green" text="Excelente margen de negocio" />
        )}

        {/* SECCIONES */}
        <Section title="🏆 Top campañas">
          {topCampaigns.length === 0 && <Empty />}
          {topCampaigns.map((c, i) => (
            <Row key={i}>
              <span className="text-blue-400">{c.title}</span>
              <span className="text-green-400">
                ${Number(c.total).toLocaleString()} ({c.percentage?.toFixed(1)}%)
              </span>
            </Row>
          ))}
        </Section>

        <Section title="💰 Campañas más rentables">
          {profitRanking.length === 0 && <Empty />}
          {profitRanking.map((c, i) => (
            <Row key={i}>
              <span className="text-blue-400">{c.title}</span>
              <span className="text-green-400">
                ${Number(c.profit).toLocaleString()} | {c.margin?.toFixed(1)}%
              </span>
            </Row>
          ))}
        </Section>

        <Section title="💰 Balance por campaña">
          {balances.length === 0 && <Empty />}
          {balances.map((c) => (
            <Row key={c.campaign_id}>
              <span className="text-blue-400">{c.title}</span>
              <span className="text-green-400">
                ${Number(c.balance).toLocaleString()}
              </span>
            </Row>
          ))}
        </Section>

      </div>

    </main>
  )
}

/* COMPONENTES */

function RevenueChart({ data }: any) {
  const chartData = Object.entries(data || {}).map(([date, val]: any) => ({
    date,
    total: val?.total || 0
  }))

  return (
    <div className="bg-slate-900 p-5 rounded-xl border border-slate-800">
      <h2 className="mb-4 text-gray-200 font-semibold">
        📈 Ingresos por día
      </h2>

      {chartData.length === 0 && <Empty />}

      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={chartData}>
          <XAxis dataKey="date" stroke="#94a3b8" />
          <YAxis stroke="#94a3b8" />
          <Tooltip />
          <Line type="monotone" dataKey="total" stroke="#22c55e" strokeWidth={2} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}

function Card({ title, value }: any) {
  const parsed = value !== null && value !== undefined ? Number(value) : 0

  return (
    <div className="bg-slate-900 p-5 rounded-xl border border-slate-800">
      <p className="text-sm text-gray-400">{title}</p>
      <p className="text-xl font-bold text-green-400">
        ${parsed.toLocaleString()}
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

function Empty() {
  return <p className="text-gray-400 text-sm">Sin datos</p>
}

function Alert({ type, text }: any) {
  const styles: any = {
    red: "bg-red-900 border-red-700",
    yellow: "bg-yellow-900 border-yellow-700",
    green: "bg-green-900 border-green-700"
  }

  return (
    <div className={`${styles[type]} p-3 rounded-xl border`}>
      ⚠️ {text}
    </div>
  )
}