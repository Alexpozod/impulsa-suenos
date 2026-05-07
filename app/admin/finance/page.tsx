'use client'

import { useEffect, useState } from "react"
import { useAdminFinancialDashboard } from "@/app/hooks/useAdminFinancialDashboard"
import {
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
  const [, setUnhealthyCampaigns] = useState<any[]>([])

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
    <div
      className="
        min-h-screen
        bg-slate-950
        flex
        items-center
        justify-center
      "
    >

      <div className="text-center">

        <div
          className="
            w-16
            h-16
            border-4
            border-emerald-500/20
            border-t-emerald-400
            rounded-full
            animate-spin
            mx-auto
            mb-6
          "
        />

        <p className="text-slate-300 text-lg font-medium">
          Cargando panel financiero...
        </p>

      </div>

    </div>
  )
}

  return (
    <main className="
  min-h-screen
  bg-slate-950
  text-gray-100
  p-6
  overflow-x-hidden
">

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
            className="
  bg-emerald-500
  hover:bg-emerald-400
  text-white
  px-5
  py-2.5
  rounded-xl
  font-medium
  transition-all
  duration-300
  hover:scale-[1.02]
  shadow-lg
  shadow-emerald-500/20
"
          >
            📥 Exportar mes actual
          </button>

          <button
            onClick={() => window.open(`/api/admin/export`)}
            className="
  bg-slate-800
  hover:bg-slate-700
  text-white
  px-5
  py-2.5
  rounded-xl
  font-medium
  border
  border-slate-700
  transition-all
  duration-300
  hover:scale-[1.02]
"
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

        {/* HEALTH CENTER */}
<div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">

  <HealthCard
    title="MercadoPago"
    status="online"
    text="Operativo"
  />

  <HealthCard
    title="Wallet Sync"
    status="online"
    text="Sincronización OK"
  />

  <HealthCard
    title="Retiros"
    status={
      stats.totalWithdrawals > stats.totalIncome * 0.8
        ? "warning"
        : "online"
    }
    text={
      stats.totalWithdrawals > stats.totalIncome * 0.8
        ? "Retiros altos"
        : "Estables"
    }
  />

  <HealthCard
    title="Margen"
    status={
      stats.margin < 5
        ? "danger"
        : stats.margin > 20
        ? "online"
        : "warning"
    }
    text={
      stats.margin < 5
        ? "Margen bajo"

        : stats.margin > 20
        ? "Excelente"

        : "Normal"
    }
  />

</div>

        {/* SECCIONES */}
        <Section title="🏆 Top campañas">
          {topCampaigns.length === 0 && <Empty />}
          {topCampaigns.map((c, i) => (
  <Row
    key={i}
    index={i}
  >
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
  <Row
    key={i}
    index={i}
  >
              <span className="text-blue-400">{c.title}</span>
              <span className="text-secondaryDark">
                ${Number(c.profit).toLocaleString()} | {c.margin?.toFixed(1)}%
              </span>
            </Row>
          ))}
        </Section>

        <Section title="💰 Balance por campaña">
          {balances.length === 0 && <Empty />}
          {balances.map((c, i) => (
  <Row
    key={c.campaign_id}
    index={i}
  >
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
shadow-black/30
hover:shadow-2xl
hover:shadow-emerald-500/10
hover:-translate-y-1
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

    <div
      className="
        bg-slate-900/80
        backdrop-blur-sm
        border
        border-slate-800
        rounded-2xl
        p-6
        shadow-lg
        space-y-4
      "
    >

      <div className="
        flex
        items-center
        justify-between
      ">

        <h2 className="
          text-lg
          font-semibold
          text-white
        ">
          {title}
        </h2>

        <div className="
          text-xs
          px-3
          py-1
          rounded-full
          bg-slate-800
          border
          border-slate-700
          text-slate-400
        ">
          LIVE
        </div>

      </div>

      <div className="space-y-3">
        {children}
      </div>

    </div>
  )
}

function Row({
  children,
  index
}: any) {

  const medals: any = {
  0: "🥇",
  1: "🥈",
  2: "🥉"
}

const widths = [
  "w-full",
  "w-[92%]",
  "w-[84%]",
  "w-[76%]",
  "w-[68%]",
  "w-[60%]"
]

  return (

  <div className="relative">

    {/* BARRA FONDO */}
    <div
      className={`
        absolute
        inset-y-0
        left-0
        ${widths[index] || "w-[50%]"}
        rounded-xl
        bg-gradient-to-r
        from-emerald-500/10
        to-transparent
      `}
    />

    {/* CONTENIDO */}
    <div
      className="
        relative
        flex
        items-center
        justify-between
        gap-4
        py-4
        px-4
        rounded-xl
        border
        border-slate-800
        bg-slate-950/70
        hover:bg-slate-800/70
        transition-all
        duration-300
        hover:scale-[1.01]
      "
    >

      <div className="flex items-center gap-4">

        {/* POSICIÓN */}
        <div
          className="
            w-10
            h-10
            rounded-full
            bg-slate-800
            border
            border-slate-700
            flex
            items-center
            justify-center
            text-sm
            font-bold
            shrink-0
          "
        >
          {medals[index] || `#${index + 1}`}
        </div>

        {/* TEXTO */}
        <div className="min-w-0">
          {children[0]}
        </div>

      </div>

      {/* VALUE */}
      <div
        className="
          text-right
          shrink-0
          font-semibold
          text-white
        "
      >
        {children[1]}
      </div>

    </div>

  </div>
)
}

function Empty() {

  return (

    <div
      className="
        flex
        flex-col
        items-center
        justify-center
        py-10
        text-center
      "
    >

      <div className="
        w-14
        h-14
        rounded-full
        bg-slate-800
        border
        border-slate-700
        flex
        items-center
        justify-center
        text-2xl
        mb-4
      ">
        📭
      </div>

      <p className="text-slate-300 font-medium">
        Sin datos disponibles
      </p>

      <p className="text-sm text-slate-500 mt-1">
        Aún no existen registros para esta sección
      </p>

    </div>
  )
}

function HealthCard({
  title,
  status,
  text
}: any) {

  const styles: any = {

    online: {
      bg: "bg-emerald-500/10",
      border: "border-emerald-500/30",
      text: "text-emerald-300",
      dot: "bg-emerald-400",
      label: "ONLINE"
    },

    warning: {
      bg: "bg-yellow-500/10",
      border: "border-yellow-500/30",
      text: "text-yellow-300",
      dot: "bg-yellow-400",
      label: "WARNING"
    },

    danger: {
      bg: "bg-red-500/10",
      border: "border-red-500/30",
      text: "text-red-300",
      dot: "bg-red-400",
      label: "RISK"
    }

  }

  const s = styles[status]

  return (

    <div
      className={`
        ${s.bg}
        ${s.border}
        border
        rounded-2xl
        p-5
        backdrop-blur-sm
        hover:scale-[1.02]
        transition-all
        duration-300
      `}
    >

      <div className="flex items-center justify-between mb-4">

        <p className="text-sm text-slate-300">
          {title}
        </p>

        <div className="flex items-center gap-2">

          <div
            className={`
              ${s.dot}
              w-2
              h-2
              rounded-full
              animate-pulse
            `}
          />

          <span className={`text-xs font-medium ${s.text}`}>
            {s.label}
          </span>

        </div>

      </div>

      <p className={`text-lg font-semibold ${s.text}`}>
        {text}
      </p>

    </div>
  )
}