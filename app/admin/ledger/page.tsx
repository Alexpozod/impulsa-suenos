'use client'

import { useEffect, useState } from 'react'
import { supabase } from "@/src/lib/supabase"

export default function LedgerPage() {

  const [data, setData] = useState<any[]>([])
  const [search, setSearch] = useState("")

  useEffect(() => {
    load()
  }, [])

  const load = async () => {
  try {

    const { data: sessionData } =
      await supabase.auth.getSession()

    const token =
      sessionData?.session?.access_token

    if (!token) {
      console.error("No session token")
      return
    }

    const res = await fetch('/api/ledger', {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })

    const json = await res.json()

    setData(Array.isArray(json) ? json : [])

  } catch (err) {
    console.error('Error cargando ledger', err)
  }
}

  return (
    <main className="min-h-screen bg-slate-950 text-white p-10">

      <h1 className="text-3xl font-bold mb-6">
        📒 Ledger (Contabilidad)
      </h1>

<div className="mb-4">

  <input
    type="text"
    placeholder="Buscar email, payment ID, campaña o tipo..."
    value={search}
    onChange={(e) => setSearch(e.target.value)}
    className="
      w-full
      bg-slate-900
      border
      border-slate-800
      rounded-xl
      px-4
      py-3
      text-sm
      text-white
      outline-none
      focus:border-primary
    "
  />

</div>

      <div className="overflow-auto border border-slate-800 rounded-xl">

        <table className="w-full text-sm">
          <thead className="bg-slate-900 text-slate-400 sticky top-0 z-10">
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
            {data
  .filter((l) => {

    const q = search.toLowerCase()

    return (
      l.type?.toLowerCase().includes(q) ||
      l.user_email?.toLowerCase().includes(q) ||
      l.payment_id?.toLowerCase().includes(q) ||
      l.campaign_id?.toLowerCase().includes(q) ||
      l.campaigns?.title?.toLowerCase().includes(q)
    )
  })
  .map((l) => (

    <tr key={l.id} className="border-t border-slate-800">

      <td className="p-3">
        {new Date(l.created_at).toLocaleString()}
      </td>

      <td className="p-3">
        {l.type}
      </td>

      <td className={`p-3 ${
        l.amount > 0
          ? 'text-green-400'
          : 'text-red-400'
      }`}>
        ${Number(l.amount).toLocaleString()}
      </td>

      <td className="p-3">
        {l.flow_type}
      </td>

      <td className="p-3">
        <div className="flex flex-col">

          <span>
            {l.campaigns?.title || "Sin nombre"}
          </span>

          <span className="text-xs text-gray-400">
            {l.campaign_id}
          </span>

        </div>
      </td>

      <td className="p-3">
        {l.user_email}
      </td>

      <td className="p-3">
        {l.payment_id}
      </td>

    </tr>

))}
          </tbody>

        </table>

      </div>

    </main>
  )
}