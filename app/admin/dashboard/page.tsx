'use client'

import { useEffect, useState } from 'react'

export default function AdminDashboard() {

  const [stats, setStats] = useState<any>(null)

  useEffect(() => {
    load()
  }, [])

  const load = async () => {
    const res = await fetch('/api/admin/stats')
    const data = await res.json()
    setStats(data)
  }

  if (!stats) {
    return <p className="p-10 text-white">Cargando...</p>
  }

  return (
    <main className="min-h-screen bg-slate-950 text-white p-10">

      <h1 className="text-3xl font-bold mb-8">
        📊 Dashboard Admin
      </h1>

      {/* CARDS */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-5 mb-10">

        <Card title="Comisiones" value={stats.totalCommissions} color="green" />
        <Card title="Retiros" value={stats.totalWithdrawals} color="red" />
        <Card title="Donaciones" value={stats.totalDonations} color="blue" />
        <Card title="Riesgosos" value={stats.totalRisky} color="yellow" />

      </div>

      {/* HISTORIAL */}
      <div className="bg-slate-900 p-5 rounded-xl border border-slate-800">
        <h2 className="text-xl mb-4">📈 Últimos ingresos</h2>

        {stats.history.map((h: any, i: number) => (
          <div key={i} className="flex justify-between text-sm border-b border-slate-800 py-2">
            <span>{new Date(h.created_at).toLocaleDateString()}</span>
            <span>${Number(h.amount).toLocaleString()}</span>
          </div>
        ))}
      </div>

    </main>
  )
}

function Card({ title, value, color }: any) {

  const colors: any = {
    green: "text-green-400",
    red: "text-red-400",
    blue: "text-blue-400",
    yellow: "text-yellow-400"
  }

  return (
    <div className="bg-slate-900 p-5 rounded-xl border border-slate-800">
      <p className="text-sm text-slate-400">{title}</p>
      <p className={`text-2xl font-bold ${colors[color]}`}>
        ${Number(value).toLocaleString()}
      </p>
    </div>
  )
}
