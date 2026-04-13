'use client'

import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { supabase } from "@/src/lib/supabase"

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts"

/* =========================
   TYPES
========================= */
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

  const [metrics, setMetrics] = useState<any>(null)
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
     📊 LOAD DATA
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

      setMetrics({
        totalRevenue: data.totalRevenue,
      })

      const formattedChart = data.chart.map((d: any) => ({
        name: d.date,
        ingresos: Number(d.ingresos),
      }))

      setChartData(formattedChart)
      setAlerts(data.alerts || [])
      setTopCampaigns(data.topCampaigns || [])

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
      <div className="min-h-screen flex items-center justify-center bg-slate-950 text-white">
        Verificando acceso...
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white p-10">

      <h1 className="text-3xl font-bold mb-6">
        📊 Dashboard Financiero
      </h1>

      {/* NAV */}
      <div className="grid md:grid-cols-4 gap-4 mb-10">

        <Link href="/admin/kyc" className="bg-slate-900 p-4 rounded-xl border border-slate-800 hover:border-green-500">
          🪪 KYC
        </Link>

        <Link href="/admin/payouts" className="bg-slate-900 p-4 rounded-xl border border-slate-800 hover:border-yellow-500">
          💸 Retiros
        </Link>

        <Link href="/admin/campaigns" className="bg-slate-900 p-4 rounded-xl border border-slate-800 hover:border-blue-500">
          🚀 Campañas
        </Link>

        <Link href="/admin/users" className="bg-slate-900 p-4 rounded-xl border border-slate-800 hover:border-purple-500">
          👤 Usuarios
        </Link>

      </div>

      {/* MÉTRICAS */}
      <div className="mb-10">

        <div className="bg-slate-900 p-6 rounded-xl w-fit">
          <p className="text-sm text-slate-400">💰 Ingresos totales</p>
          <p className="text-3xl font-bold text-green-400">
            ${metrics.totalRevenue.toLocaleString()}
          </p>
        </div>

      </div>

      {/* CHART */}
      <div className="bg-slate-900 p-6 rounded-xl mb-10">

        <h2 className="text-lg font-bold mb-4">
          📈 Ingresos por día
        </h2>

        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={chartData}>
            <XAxis dataKey="name" stroke="#ccc" />
            <YAxis stroke="#ccc" />
            <Tooltip />
            <Line type="monotone" dataKey="ingresos" stroke="#22c55e" />
          </LineChart>
        </ResponsiveContainer>

      </div>

      {/* ALERTAS */}
      <div className="mb-10">

        <h2 className="text-lg font-bold mb-4">
          🚨 Alertas antifraude
        </h2>

        {alerts.length === 0 && (
          <p className="text-slate-400">Sin alertas</p>
        )}

        {alerts.map((a, i) => (
          <div key={i} className="bg-red-900/30 border border-red-500 p-4 rounded-lg mb-2">
            {a.message}
          </div>
        ))}

      </div>

      {/* TOP CAMPAÑAS */}
      <div>

        <h2 className="text-lg font-bold mb-4">
          🔥 Top campañas
        </h2>

        {topCampaigns.map((c) => (
          <div key={c.id} className="bg-slate-900 p-4 rounded-xl mb-2 flex justify-between">

            <div>
              <p className="font-bold">{c.title}</p>
              <p className="text-sm text-slate-400">
                ${Number(c.total || 0).toLocaleString()}
              </p>
            </div>

            <Link href={`/admin/campaign/${c.id}`}>
              <button className="bg-blue-600 px-3 py-1 rounded">
                Ver
              </button>
            </Link>

          </div>
        ))}

      </div>

    </div>
  )
}