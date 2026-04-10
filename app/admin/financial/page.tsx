"use client"

import { useEffect, useState } from "react"

export default function FinancialDashboard() {

  const [data, setData] = useState<any>(null)

  useEffect(() => {
    load()
  }, [])

  const load = async () => {
    const res = await fetch("/api/admin/finance")
    const json = await res.json()
    setData(json)
  }

  if (!data) return <div className="p-6 text-white">Cargando...</div>

  return (
    <div className="p-6 bg-slate-950 text-white min-h-screen space-y-6">

      <h1 className="text-2xl font-bold">
        💳 Finanzas Plataforma
      </h1>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">

        <Card title="Ingresos" value={data.totalIncome} />
        <Card title="Retiros" value={data.totalWithdrawals} />
        <Card title="Balance" value={data.balance} />
        <Card title="Pagos" value={data.totalPayments} />

      </div>

      <div className="bg-slate-900 p-4 rounded-xl">
        <h2 className="mb-3">🧾 Pagos recientes</h2>

        {data.recentPayments.map((p: any) => (
          <div key={p.id} className="border-b border-slate-800 py-2">
            {p.user_email} → ${p.amount}
          </div>
        ))}
      </div>

    </div>
  )
}

function Card({ title, value }: any) {
  return (
    <div className="bg-slate-900 p-4 rounded-xl">
      <p className="text-sm text-slate-400">{title}</p>
      <p className="text-xl font-bold">
        ${Number(value || 0).toLocaleString()}
      </p>
    </div>
  )
}