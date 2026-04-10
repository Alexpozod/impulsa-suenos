'use client'

import { useEffect, useState } from 'react'

export default function LedgerPage() {

  const [data, setData] = useState<any[]>([])

  useEffect(() => {
    load()
  }, [])

  const load = async () => {
    try {
      const res = await fetch('/api/ledger')
      const json = await res.json()
      setData(json || [])
    } catch (err) {
      console.error('Error cargando ledger', err)
    }
  }

  return (
    <main className="min-h-screen bg-slate-950 text-white p-10">

      <h1 className="text-3xl font-bold mb-6">
        📒 Ledger (Contabilidad)
      </h1>

      <div className="overflow-auto border border-slate-800 rounded-xl">

        <table className="w-full text-sm">
          <thead className="bg-slate-900 text-slate-400">
            <tr>
              <th className="p-3 text-left">Fecha</th>
              <th className="p-3 text-left">Tipo</th>
              <th className="p-3 text-left">Monto</th>
              <th className="p-3 text-left">Flow</th>
              <th className="p-3 text-left">Campaña</th>
              <th className="p-3 text-left">Email</th>
              <th className="p-3 text-left">Payment ID</th>
            </tr>
          </thead>

          <tbody>
            {data.map((l) => (
              <tr key={l.id} className="border-t border-slate-800">
                <td className="p-3">{new Date(l.created_at).toLocaleString()}</td>
                <td className="p-3">{l.type}</td>
                <td className={`p-3 ${l.amount > 0 ? 'text-green-400' : 'text-red-400'}`}>
                  ${Number(l.amount).toLocaleString()}
                </td>
                <td className="p-3">{l.flow_type}</td>
                <td className="p-3">{l.campaign_id}</td>
                <td className="p-3">{l.user_email}</td>
                <td className="p-3">{l.payment_id}</td>
              </tr>
            ))}
          </tbody>

        </table>

      </div>

    </main>
  )
}