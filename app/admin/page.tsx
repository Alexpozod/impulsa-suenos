"use client"

import { useEffect, useState } from "react"
import Link from "next/link"

export default function AdminPage() {

  const [campaigns, setCampaigns] = useState<any[]>([])
  const [metrics, setMetrics] = useState<any>(null)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const res = await fetch("/api/admin/campaigns")
      const data = await res.json()

      setCampaigns(data)

      // 💰 total recaudado
      const totalRevenue = data.reduce(
        (sum: number, c: any) => sum + Number(c.total_raised || 0),
        0
      )

      // 📊 campañas activas
      const activeCampaigns = data.filter(
        (c: any) => !c.status || c.status === "active"
      ).length

      // 🔥 top campañas
      const topCampaigns = [...data]
        .sort((a, b) => (b.total_raised || 0) - (a.total_raised || 0))
        .slice(0, 5)

      setMetrics({
        totalRevenue,
        activeCampaigns,
        totalCampaigns: data.length,
        topCampaigns,
      })

    } catch (err) {
      console.error(err)
    }
  }

  if (!metrics) {
    return <div className="p-10 text-white">Cargando métricas...</div>
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white p-10">

      {/* HEADER */}
      <h1 className="text-3xl font-bold mb-6">
        📊 Dashboard Admin
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

        <div className="bg-slate-900 p-6 rounded-xl border border-slate-800">
          <p className="text-sm text-slate-400">💰 Ingresos totales</p>
          <p className="text-2xl font-bold text-green-400">
            ${metrics.totalRevenue.toLocaleString()}
          </p>
        </div>

        <div className="bg-slate-900 p-6 rounded-xl border border-slate-800">
          <p className="text-sm text-slate-400">🚀 Campañas activas</p>
          <p className="text-2xl font-bold">
            {metrics.activeCampaigns}
          </p>
        </div>

        <div className="bg-slate-900 p-6 rounded-xl border border-slate-800">
          <p className="text-sm text-slate-400">📊 Total campañas</p>
          <p className="text-2xl font-bold">
            {metrics.totalCampaigns}
          </p>
        </div>

        <div className="bg-slate-900 p-6 rounded-xl border border-slate-800">
          <p className="text-sm text-slate-400">🔥 Promedio por campaña</p>
          <p className="text-2xl font-bold">
            ${(metrics.totalRevenue / (metrics.totalCampaigns || 1)).toFixed(0)}
          </p>
        </div>

      </div>

      {/* TOP CAMPAÑAS */}
      <div className="mb-10">

        <h2 className="text-xl font-bold mb-4">
          🔥 Top campañas
        </h2>

        <div className="space-y-3">

          {metrics.topCampaigns.map((c: any) => (
            <div key={c.id} className="bg-slate-900 p-4 rounded-xl border border-slate-800 flex justify-between">

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

      {/* LISTADO SIMPLE */}
      <div>

        <h2 className="text-xl font-bold mb-4">
          📋 Últimas campañas
        </h2>

        <div className="grid md:grid-cols-2 gap-4">

          {campaigns.slice(0, 6).map((c) => (
            <div key={c.id} className="bg-slate-900 p-4 rounded-xl border border-slate-800">

              <p className="font-bold">{c.title}</p>

              <p className="text-sm text-slate-400">
                ${Number(c.total_raised || 0).toLocaleString()}
              </p>

              <Link href={`/admin/campaign/${c.id}`}>
                <button className="mt-2 bg-blue-600 px-3 py-1 rounded">
                  Ver detalle
                </button>
              </Link>

            </div>
          ))}

        </div>

      </div>

    </div>
  )
}