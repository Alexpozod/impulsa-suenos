'use client'

import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { supabase } from "@/src/lib/supabase"

import {
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  AreaChart,
  Area,
} from "recharts"

type Campaign = {
  id: string
  title: string
  total?: number
}

type ChartItem = {
  name: string
  ingresos: number
}

type Alert = {
  message: string
}

export default function AdminPage() {

  const router = useRouter()

  const [loading, setLoading] = useState(true)
  const [authorized, setAuthorized] = useState(false)

  const [metrics, setMetrics] = useState<any>({ totalRevenue: 0 })
  const [chartData, setChartData] = useState<ChartItem[]>([])
  const [alerts, setAlerts] = useState<Alert[]>([])
  const [topCampaigns, setTopCampaigns] = useState<Campaign[]>([])

  useEffect(() => {
    checkAccess()
  }, [])

  /* =========================
     🔐 AUTH + ROLE CHECK
  ========================= */
  const checkAccess = async () => {

    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      router.push('/login')
      return
    }

    const role = user.user_metadata?.role

    if (role !== 'admin') {
      router.push('/dashboard')
      return
    }

    setAuthorized(true)
    loadData()
  }

  /* =========================
     📊 LOAD DATA (FIX FINAL)
  ========================= */
  const loadData = async () => {
    try {

      const session = await supabase.auth.getSession()

      const res = await fetch("/api/admin/finance", {
        headers: {
          Authorization: `Bearer ${session.data.session?.access_token}`
        }
      })

      const data = await res.json()

      /* ✅ METRICS */
      setMetrics({
        totalRevenue: data.totalIncome || 0,
      })

      /* ✅ CHART DESDE daily */
      const formattedChart = Object.entries(data.daily || {}).map(
        ([date, val]: any) => ({
          name: date,
          ingresos: Number(val.total || 0),
        })
      )

      setChartData(formattedChart)

      /* ✅ ALERTAS DESDE errors */
      setAlerts(
        (data.errors || []).map((e: any) => ({
          message: e.message
        }))
      )

      /* ✅ TOP CAMPAIGNS (DESACTIVADO POR AHORA) */
      setTopCampaigns([])

    } catch (err) {
      console.error("ADMIN ERROR:", err)
    } finally {
      setLoading(false)
    }
  }

  /* =========================
     LOADING / BLOCK
  ========================= */
  if (loading || !authorized) {
  return (
    <div className="
      min-h-screen
      bg-slate-950
      flex
      items-center
      justify-center
    ">

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
          Verificando acceso administrador...
        </p>

      </div>

    </div>
  )
}

  return (
   <div className="
  min-h-screen
  bg-[#020617]
  text-white
  p-6
  lg:p-10
  overflow-x-hidden
">

      <div className="
  flex
  flex-col
  lg:flex-row
  lg:items-center
  lg:justify-between
  gap-6
  mb-10
">

  {/* LEFT */}
  <div>

    <h1 className="
      text-4xl
      font-black
      text-white
      tracking-tight
    ">
      📊 Dashboard Ejecutivo
    </h1>

    <p className="text-slate-400 mt-2">
      Resumen general operativo de ImpulsaSueños
    </p>

    <div className="flex flex-wrap gap-3 mt-4">

      <div className="
        px-4
        py-2
        rounded-xl
        bg-emerald-500/10
        border
        border-emerald-500/20
        text-emerald-300
        text-sm
      ">
        🟢 Plataforma operativa
      </div>

      <div className="
        px-4
        py-2
        rounded-xl
        bg-blue-500/10
        border
        border-blue-500/20
        text-blue-300
        text-sm
      ">
        🔄 Sync activa
      </div>

    </div>

  </div>

  {/* RIGHT */}
  <div className="
    bg-slate-900/80
    border
    border-slate-800
    rounded-2xl
    p-6
    min-w-[280px]
    shadow-xl
  ">

    <p className="text-slate-400 text-sm">
      💰 Total procesado
    </p>

    <p className="
      text-4xl
      font-black
      text-emerald-400
      mt-2
    ">
      ${Number(metrics.totalRevenue || 0).toLocaleString()}
    </p>

    <div className="mt-4 flex items-center gap-2">

      <span className="
        px-2
        py-1
        rounded-full
        bg-emerald-500/10
        border
        border-emerald-500/20
        text-emerald-300
        text-xs
      ">
        ↑ Plataforma creciendo
      </span>

    </div>

  </div>

</div>

      {/* NAV */}
      <div className="
  grid
  md:grid-cols-2
  xl:grid-cols-4
  gap-5
  mb-12
">

  <AdminCard
    href="/admin/kyc"
    emoji="🪪"
    title="KYC"
    description="Verificación identidad"
    color="green"
  />

  <AdminCard
    href="/admin/payouts"
    emoji="💸"
    title="Retiros"
    description="Pagos y transferencias"
    color="yellow"
  />

  <AdminCard
    href="/admin/campaigns"
    emoji="🚀"
    title="Campañas"
    description="Gestión crowdfunding"
    color="blue"
  />

  <AdminCard
    href="/admin/users"
    emoji="👤"
    title="Usuarios"
    description="Administración usuarios"
    color="purple"
  />

</div>

           {/* CHART */}
      <div className="
  bg-slate-900/80
  border
  border-slate-800
  rounded-2xl
  p-6
  mb-10
  shadow-xl
">

        <div className="flex items-center justify-between mb-6">

  <div>

    <h2 className="text-xl font-bold text-white">
      📈 Ingresos por día
    </h2>

    <p className="text-sm text-slate-400 mt-1">
      Evolución de ingresos de la plataforma
    </p>

  </div>

  <div className="
    px-3
    py-1
    rounded-full
    bg-emerald-500/10
    border
    border-emerald-500/20
    text-emerald-300
    text-xs
  ">
    LIVE DATA
  </div>

</div>

        <ResponsiveContainer width="100%" height={300}>

  <AreaChart data={chartData}>

    <CartesianGrid
      strokeDasharray="3 3"
      stroke="#1e293b"
    />
            <XAxis dataKey="name" stroke="#ccc" />
            <YAxis stroke="#ccc" />
            <Tooltip />
            <defs>

  <linearGradient id="incomeGradient" x1="0" y1="0" x2="0" y2="1">

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

<Area
  type="monotone"
  dataKey="ingresos"
  stroke="#10b981"
  fill="url(#incomeGradient)"
  fillOpacity={1}
/>

<Line
  type="monotone"
  dataKey="ingresos"
  stroke="#10b981"
  strokeWidth={3}
  dot={{ r: 4 }}
  activeDot={{ r: 7 }}
/>

  </AreaChart>

</ResponsiveContainer>

      </div>

      {/* ALERTAS */}
      <div className="mb-10">

        <h2 className="text-lg font-bold mb-4">
          🚨 Alertas sistema
        </h2>

        {alerts.length === 0 && (
          <p className="text-slate-400">Sin alertas</p>
        )}

        {alerts.map((a, i) => (

  <div
    key={i}
    className="
      bg-red-900/30
      border
      border-red-500
      p-4
      rounded-lg
      mb-2
    "
  >

    {a.message === "bank_update_error"
      ? "⚠️ Error sincronizando actualización bancaria"
      : a.message}

  </div>

))}

      </div>

{/* ACTIVIDAD */}

<div className="
  bg-slate-900/80
  border
  border-slate-800
  rounded-2xl
  p-6
  shadow-xl
">

  <div className="flex items-center justify-between mb-6">

    <div>

      <h2 className="text-xl font-bold">
        ⚡ Actividad reciente
      </h2>

      <p className="text-slate-400 text-sm mt-1">
        Eventos recientes de la plataforma
      </p>

    </div>

    <div className="
      px-3
      py-1
      rounded-full
      bg-blue-500/10
      border
      border-blue-500/20
      text-blue-300
      text-xs
    ">
      LIVE
    </div>

  </div>

  <div className="space-y-3">

    <ActivityItem
      emoji="💰"
      text="Nuevo pago recibido"
      color="green"
    />

    <ActivityItem
      emoji="🚀"
      text="Nueva campaña publicada"
      color="blue"
    />

    <ActivityItem
      emoji="🪪"
      text="KYC pendiente revisión"
      color="yellow"
    />

  </div>

</div>

    </div>
  )
}

function AdminCard({
  href,
  emoji,
  title,
  description,
  color
}: any) {

  const colors: any = {

    green:
      "hover:border-emerald-500/40 hover:shadow-emerald-500/10",

    yellow:
      "hover:border-yellow-500/40 hover:shadow-yellow-500/10",

    blue:
      "hover:border-blue-500/40 hover:shadow-blue-500/10",

    purple:
      "hover:border-purple-500/40 hover:shadow-purple-500/10"

  }

  return (

    <Link
      href={href}
      className={`
        bg-slate-900/80
        border
        border-slate-800
        rounded-2xl
        p-6
        transition-all
        duration-300
        hover:-translate-y-1
        hover:shadow-2xl
        ${colors[color]}
      `}
    >

      <div className="text-3xl mb-4">
        {emoji}
      </div>

      <h3 className="text-lg font-bold text-white">
        {title}
      </h3>

      <p className="text-sm text-slate-400 mt-2">
        {description}
      </p>

    </Link>
  )
}

function ActivityItem({
  emoji,
  text,
  color
}: any) {

  const styles: any = {

    green:
      "bg-emerald-500/10 border-emerald-500/20 text-emerald-300",

    blue:
      "bg-blue-500/10 border-blue-500/20 text-blue-300",

    yellow:
      "bg-yellow-500/10 border-yellow-500/20 text-yellow-300"

  }

  return (

    <div
      className={`
        flex
        items-center
        gap-4
        p-4
        rounded-xl
        border
        ${styles[color]}
      `}
    >

      <div className="text-2xl">
        {emoji}
      </div>

      <div className="font-medium">
        {text}
      </div>

    </div>
  )
}