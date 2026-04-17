"use client"

import { useEffect, useState } from "react"

export default function FinancialDashboard() {

  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    load()
  }, [])

  const load = async () => {
    try {
      const res = await fetch("/api/admin/finance")
      const json = await res.json()

      console.log("FINANCE DATA:", json) // 🔥 DEBUG CLAVE

      setData(json)
    } catch (err) {
      console.error("Finance load error:", err)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <div className="p-6 text-gray-300">Cargando...</div>
  }

  if (!data) {
    return <div className="p-6 text-red-400">Error cargando datos</div>
  }

  return (
    <div className="p-6 bg-slate-950 min-h-screen space-y-6 text-gray-100">

      <div className="flex justify-between items-center">

        <h1 className="text-2xl font-bold">
          💳 Finanzas Plataforma
        </h1>

        <a
          href="/api/admin/export"
          className="bg-blue-600 px-4 py-2 rounded text-white"
        >
          📤 Exportar CSV
        </a>

      </div>

      {/* 🔥 MÉTRICAS */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">

        <Card title="Ingresos" value={data.totalIncome} />
        <Card title="Retiros" value={data.totalWithdrawals} />
        <Card title="Balance" value={data.balance} />
        <Card title="Pagos" value={data.totalPayments} />

      </div>

      {/* 🔥 DEBUG VISUAL (puedes quitar después) */}
      <div className="bg-slate-800 p-4 rounded-xl text-xs overflow-auto">
        <pre>{JSON.stringify(data, null, 2)}</pre>
      </div>

      {/* PAGOS */}
      <div className="bg-slate-900 p-4 rounded-xl">
        <h2 className="mb-3 text-gray-200">🧾 Pagos recientes</h2>

        {data.recentPayments?.length === 0 && (
          <p className="text-gray-400 text-sm">Sin pagos recientes</p>
        )}

        {data.recentPayments?.map((p: any) => (
          <div key={p.id} className="border-b border-slate-800 py-2 text-sm">

            <span className="text-gray-300">
              {p.user_email || "Usuario"}
            </span>

            <span className="float-right text-green-400 font-semibold">
              ${Number(p.amount || 0).toLocaleString()}
            </span>

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

      <p className="text-xl font-bold text-green-400">
        ${Number(value || 0).toLocaleString()}
      </p>

    </div>
  )
}