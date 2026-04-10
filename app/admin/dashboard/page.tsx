'use client'

import { useEffect, useState } from 'react'

export default function AdminDashboard() {

  const [stats, setStats] = useState<any>(null)

  useEffect(() => {
    load()
  }, [])

  const load = async () => {
    try {
      const res = await fetch('/api/admin/stats')
      const data = await res.json()
      setStats(data)
    } catch (err) {
      console.error("Error cargando dashboard", err)
    }
  }

  if (!stats) {
    return <p className="p-10 text-white">Cargando dashboard...</p>
  }

  return (
    <div className="space-y-6">

      {/* HEADER */}
      <div className="flex justify-between items-center">

        <h1 className="text-2xl font-bold">
          📊 Dashboard General
        </h1>

        <div className="flex gap-2">
          <a
            href="/api/admin/export"
            className="bg-blue-600 px-4 py-2 rounded text-sm"
          >
            📤 Exportar
          </a>
        </div>

      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">

        <Card title="Donaciones" value={stats.totalDonations} color="blue" />
        <Card title="Comisiones" value={stats.totalCommissions} color="green" />
        <Card title="Tips" value={stats.totalTips || 0} color="green" />
        <Card title="Retiros" value={stats.totalWithdrawals} color="red" />
        <Card title="Riesgos" value={stats.totalRisky} color="yellow" />

      </div>

      {/* ALERTAS */}
      <div className="bg-slate-900 p-4 rounded-xl border border-slate-800">

        <h2 className="font-bold mb-3">🚨 Alertas del sistema</h2>

        {(!stats.alerts || stats.alerts.length === 0) && (
          <p className="text-slate-400 text-sm">
            ✔ Todo funcionando correctamente
          </p>
        )}

        {stats.alerts?.map((a: any, i: number) => (
          <div key={i} className="text-red-400 text-sm mb-1">
            ⚠️ {a.message}
          </div>
        ))}

      </div>

      {/* ACTIVIDAD + TOP */}
      <div className="grid md:grid-cols-2 gap-4">

        {/* HISTORIAL */}
        <div className="bg-slate-900 p-4 rounded-xl border border-slate-800">

          <h2 className="font-bold mb-3">📈 Últimas donaciones</h2>

          {stats.history.map((h: any, i: number) => (
            <div
              key={i}
              className="flex justify-between text-sm border-b border-slate-800 py-2"
            >
              <span className="text-slate-400">
                {new Date(h.created_at).toLocaleDateString()}
              </span>

              <span className="text-green-400 font-medium">
                ${Number(h.amount).toLocaleString()}
              </span>
            </div>
          ))}

        </div>

        {/* TOP CAMPAÑAS */}
        <div className="bg-slate-900 p-4 rounded-xl border border-slate-800">

          <h2 className="font-bold mb-3">🔥 Top campañas</h2>

          {stats.topCampaigns?.map((c: any, i: number) => (
            <div
              key={i}
              className="flex justify-between text-sm border-b border-slate-800 py-2"
            >
              <span className="text-slate-300">
                {c.title}
              </span>

              <span className="text-blue-400 font-medium">
                ${Number(c.total).toLocaleString()}
              </span>
            </div>
          ))}

        </div>

      </div>

      {/* ACCIONES RÁPIDAS */}
      <div className="bg-slate-900 p-4 rounded-xl border border-slate-800">

        <h2 className="font-bold mb-3">⚡ Acciones rápidas</h2>

        <div className="flex flex-wrap gap-3">

          <QuickLink href="/admin/payouts" label="Aprobar retiros" />
          <QuickLink href="/admin/campaigns" label="Gestionar campañas" />
          <QuickLink href="/admin/users" label="Gestionar usuarios" />
          <QuickLink href="/admin/risk" label="Ver riesgos" />

        </div>

      </div>

    </div>
  )
}

/* =========================
   COMPONENTES
========================= */

function Card({ title, value, color }: any) {

  const colors: any = {
    green: "text-green-400",
    red: "text-red-400",
    blue: "text-blue-400",
    yellow: "text-yellow-400"
  }

  return (
    <div className="bg-slate-900 p-4 rounded-xl border border-slate-800">

      <p className="text-sm text-slate-400">
        {title}
      </p>

      <p className={`text-2xl font-bold ${colors[color]}`}>
        ${Number(value || 0).toLocaleString()}
      </p>

    </div>
  )
}

function QuickLink({ href, label }: any) {
  return (
    <a
      href={href}
      className="bg-slate-800 hover:bg-slate-700 px-4 py-2 rounded text-sm"
    >
      {label}
    </a>
  )
}