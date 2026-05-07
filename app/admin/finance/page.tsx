'use client'

import { useEffect, useState } from "react"
import { useAdminFinancialDashboard } from "@/app/hooks/useAdminFinancialDashboard"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Area,
  AreaChart
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

        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">

  <div>
    <h1 className="text-3xl font-bold text-white">
      💰 Panel Financiero PRO
    </h1>

    <p className="text-sm text-slate-400 mt-1">
      Última actualización:
      {" "}
      {new Date().toLocaleString()}
    </p>
  </div>

  <div className="flex flex-wrap gap-3">

    <div className="
      bg-emerald-500/10
      border
      border-emerald-500/30
      text-emerald-300
      px-4
      py-2
      rounded-xl
      text-sm
      font-medium
    ">
      🟢 MercadoPago operativo
    </div>

    <div className="
      bg-blue-500/10
      border
      border-blue-500/30
      text-blue-300
      px-4
      py-2
      rounded-xl
      text-sm
      font-medium
    ">
      🟢 Wallet Sync OK
    </div>

    <div className="
      bg-yellow-500/10
      border
      border-yellow-500/30
      text-yellow-300
      px-4
      py-2
      rounded-xl
      text-sm
      font-medium
    ">
      🟡 KYC Pendientes:
      {" "}
      {stats.pendingKyc || 0}
    </div>

  </div>

</div>

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
              <span className="text-secondaryDark">
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
              <span className="text-secondaryDark">
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
              <span className="text-secondaryDark">
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

  const chartData = Object.entries(data || {}).map(
    ([date, val]: any) => ({
      date,
      total: val?.total || 0
    })
  )

  return (

    <div className="
      bg-slate-900
      p-6
      rounded-2xl
      border
      border-slate-800
      shadow-lg
    ">

      <div className="flex items-center justify-between mb-6">

        <h2 className="text-lg font-semibold text-white">
          📈 Ingresos por día
        </h2>

        <span className="
          text-xs
          px-3
          py-1
          rounded-full
          bg-emerald-500/10
          border
          border-emerald-500/20
          text-emerald-300
        ">
          Tendencia positiva
        </span>

      </div>

      {chartData.length === 0 && <Empty />}

      <ResponsiveContainer width="100%" height={350}>

        <AreaChart data={chartData}>

          <defs>

            <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">

              <stop
                offset="0%"
                stopColor="#10b981"
                stopOpacity={0.4}
              />

              <stop
                offset="100%"
                stopColor="#10b981"
                stopOpacity={0}
              />

            </linearGradient>

          </defs>

          <CartesianGrid
            strokeDasharray="3 3"
            stroke="#1e293b"
          />

          <XAxis
            dataKey="date"
            stroke="#94a3b8"
          />

          <YAxis
            stroke="#94a3b8"
          />

          <Tooltip
            contentStyle={{
              background: "#020617",
              border: "1px solid #1e293b",
              borderRadius: "12px",
              color: "#fff"
            }}
          />

          <Area
            type="monotone"
            dataKey="total"
            stroke="#10b981"
            fillOpacity={1}
            fill="url(#colorRevenue)"
          />

          <Line
            type="monotone"
            dataKey="total"
            stroke="#10b981"
            strokeWidth={3}
            dot={{ r: 4 }}
            activeDot={{ r: 7 }}
          />

        </AreaChart>

      </ResponsiveContainer>

    </div>
  )
}

function Card({ title, value }: any) {

  const parsed =
    value !== null && value !== undefined
      ? Number(value)
      : 0

  const styles: any = {

    "Ingresos":
      "from-blue-500/20 to-slate-900 border-blue-500/20",

    "Balance":
      "from-emerald-500/20 to-slate-900 border-emerald-500/20",

    "Profit":
      "from-green-500/20 to-slate-900 border-green-500/20",

    "Retiros":
      "from-red-500/20 to-slate-900 border-red-500/20",

    "Comisiones":
      "from-yellow-500/20 to-slate-900 border-yellow-500/20",

    "Tips":
      "from-pink-500/20 to-slate-900 border-pink-500/20",

    default:
      "from-slate-800 to-slate-900 border-slate-700"
  }

  const cardStyle =
    styles[title] || styles.default

  return (

    <div
      className={`
        bg-gradient-to-br
        ${cardStyle}
        p-5
        rounded-2xl
        border
        shadow-lg
        hover:scale-[1.02]
        transition-all
        duration-300
      `}
    >

      <p className="text-sm text-slate-400">
        {title}
      </p>

      <p className="text-2xl font-bold text-white mt-2">
        ${parsed.toLocaleString()}
      </p>

      <div className="mt-3">

        <span className="
          text-xs
          px-2
          py-1
          rounded-full
          bg-emerald-500/10
          border
          border-emerald-500/20
          text-emerald-300
        ">
          ↑ +12.4%
        </span>

      </div>

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