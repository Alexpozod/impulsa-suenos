"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts"

/* =========================
   🧠 TYPES (PRO)
========================= */
type Campaign = {
  id: string
  title: string
  total_raised?: number
  status?: string
}

/* =========================
   🚀 COMPONENT
========================= */
export default function AdminPage() {

  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [metrics, setMetrics] = useState<any>(null)
  const [chartData, setChartData] = useState<any[]>([])
  const [alerts, setAlerts] = useState<any[]>([])

  useEffect(() => {
    loadData()
  }, [])

  /* =========================
     📊 LOAD DATA
  ========================= */
  const loadData = async () => {
    try {
      const res = await fetch("/api/admin/campaigns")
      const data: Campaign[] = await res.json()

      setCampaigns(data)

      /* =========================
         💰 MÉTRICAS
      ========================= */
      const totalRevenue = data.reduce(
        (sum, c) => sum + Number(c.total_raised || 0),
        0
      )

      const activeCampaigns = data.filter(
        (c) => !c.status || c.status === "active"
      ).length

      const topCampaigns = [...data]
        .sort((a, b) => (b.total_raised || 0) - (a.total_raised || 0))
        .slice(0, 5)

      setMetrics({
        totalRevenue,
        activeCampaigns,
        totalCampaigns: data.length,
        topCampaigns,
      })

      /* =========================
         📈 CHART (SIN ERROR TS)
      ========================= */
      const chart = data.slice(0, 7).map((c: Campaign, i: number) => ({
        name: `Día ${i + 1}`,
        ingresos: Number(c.total_raised || 0),
      }))

      setChartData(chart)

      /* =========================
         🚨 ALERTAS ANTIFRAUDE
      ========================= */
      const risky = data.filter(
        (c) => Number(c.total_raised || 0) > 5000000
      )

      setAlerts(
        risky.map((c) => ({
          type: "high_amount",
          message: `⚠️ Campaña sospechosa: ${c.title}`,
        }))
      )

    } catch (err) {
      console.error("Admin load error:", err)
    }
  }

  if (!metrics) {
    return (
      <div className="min-h-screen flex items-center justify-center text-white bg-slate-950">
        Cargando dashboard...
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white p-10">

      {/* HEADER */}
      <h1 className="text-3xl font-bold mb-6">
        📊 Dashboard Inteligente
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
      <div className="grid md:grid-cols-4 gap-6 mb-10">

        <div className="bg-slate-900 p-6 rounded-xl">
          <p className="text-sm text-slate-400">💰 Ingresos totales</p>
          <p className="text-2xl font-bold text-green-400">
            ${metrics.totalRevenue.toLocaleString()}
          </p>
        </div>

        <div className="bg-slate-900 p-6 rounded-xl">
          <p className="text-sm text-slate-400">🚀 Campañas activas</p>
          <p className="text-2xl font-bold">
            {metrics.activeCampaigns}
          </p>
        </div>

        <div className="bg-slate-900 p-6 rounded-xl">
          <p className="text-sm text-slate-400">📊 Total campañas</p>
          <p className="text-2xl font-bold">
            {metrics.totalCampaigns}
          </p>
        </div>

        <div className="bg-slate-900 p-6 rounded-xl">
          <p className="text-sm text-slate-400">🔥 Promedio</p>
          <p className="text-2xl font-bold">
            ${(metrics.totalRevenue / (metrics.totalCampaigns || 1)).toFixed(0)}
          </p>
        </div>

      </div>

      {/* 📈 GRÁFICO */}
      <div className="bg-slate-900 p-6 rounded-xl mb-10">

        <h2 className="text-lg font-bold mb-4">
          📈 Ingresos últimos días
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

      {/* 🚨 ALERTAS */}
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

      {/* 🔥 TOP CAMPAÑAS */}
      <div>

        <h2 className="text-lg font-bold mb-4">
          🔥 Top campañas
        </h2>

        {metrics.topCampaigns.map((c: Campaign) => (
          <div key={c.id} className="bg-slate-900 p-4 rounded-xl mb-2 flex justify-between">

            <div>
              <p className="font-bold">{c.title}</p>
              <p className="text-sm text-slate-400">
                ${Number(c.total_raised || 0).toLocaleString()}
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