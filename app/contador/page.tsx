'use client'

import { useEffect, useState } from 'react'

export default function ContadorPanel() {

  const [data, setData] = useState<any>(null)

  useEffect(() => {
    load()
  }, [])

  const load = async () => {
    const res = await fetch('/api/admin/finance')
    const json = await res.json()
    setData(json)
  }

  if (!data) {
    return <div className="p-6">Cargando datos contables...</div>
  }

  return (
    <main className="min-h-screen bg-white text-black p-10 space-y-8">

      <h1 className="text-3xl font-bold">
        📊 Panel Contable ImpulsaSueños
      </h1>

      {/* RESUMEN */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">

        <Card title="Ingresos Totales" value={data.totalIncome} />
        <Card title="Retiros Totales" value={data.totalWithdrawals} />
        <Card title="Balance" value={data.balance} />
        <Card title="Total Pagos" value={data.totalPayments} />

      </div>

      {/* EXPORT */}
      <div>
        <a
          href="/api/admin/export"
          className="bg-black text-white px-4 py-2 rounded"
        >
          Descargar Contabilidad (CSV)
        </a>
      </div>

      {/* DETALLE */}
      <div>
        <h2 className="text-xl font-bold mb-4">
          Últimos movimientos
        </h2>

        <table className="w-full text-sm border">
          <thead>
            <tr className="bg-gray-100">
              <th className="p-2 text-left">Fecha</th>
              <th className="p-2">Tipo</th>
              <th className="p-2">Monto</th>
              <th className="p-2">Moneda</th>
              <th className="p-2">Campaña</th>
              <th className="p-2">Usuario</th>
              <th className="p-2">Flow</th>
            </tr>
          </thead>

          <tbody>
            {data.recentPayments.map((p: any) => (
              <tr key={p.id} className="border-t">

                <td className="p-2">
                  {new Date(p.created_at).toLocaleDateString()}
                </td>

                <td className="p-2">
                  {p.type}
                </td>

                <td className="p-2">
                  ${Number(p.amount).toLocaleString()}
                </td>

                <td className="p-2">
                  CLP
                </td>

                <td className="p-2">
                  {p.campaigns?.title || p.campaign_id}
                </td>

                <td className="p-2">
                  {p.user_email}
                </td>

                <td className="p-2">
                  {p.flow_type}
                </td>

              </tr>
            ))}
          </tbody>

        </table>

      </div>

    </main>
  )
}

function Card({ title, value }: any) {
  return (
    <div className="border p-4 rounded">
      <p className="text-sm">{title}</p>
      <p className="text-xl font-bold">
        ${Number(value || 0).toLocaleString()}
      </p>
    </div>
  )
}