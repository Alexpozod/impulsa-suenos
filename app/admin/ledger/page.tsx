'use client'

import { useEffect, useState } from 'react'
import { supabase } from "@/src/lib/supabase"

export default function LedgerPage() {

  const [data, setData] = useState<any[]>([])
  const [search, setSearch] = useState("")
  const [filter, setFilter] = useState("all")

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

<div className="flex gap-2 flex-wrap mb-4">

  {[
    "all",
    "payment",
    "creator_net",
    "withdraw",
    "fees"
  ].map((f) => (

    <button
      key={f}
      onClick={() => setFilter(f)}
      className={`px-4 py-2 rounded-xl text-sm border transition
        ${
          filter === f
            ? "bg-primary border-primary text-white"
            : "bg-slate-900 border-slate-700 text-slate-300"
        }
      `}
    >
      {
        f === "all"
          ? "Todos"
          : f === "payment"
          ? "Payments"
          : f === "creator_net"
          ? "Creator Net"
          : f === "withdraw"
          ? "Withdraws"
          : "Fees"
      }
    </button>

  ))}

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

    const matchesSearch = (
  l.type?.toLowerCase().includes(q) ||
  l.user_email?.toLowerCase().includes(q) ||
  l.payment_id?.toLowerCase().includes(q) ||
  l.campaign_id?.toLowerCase().includes(q) ||
  l.campaigns?.title?.toLowerCase().includes(q)
)

const matchesFilter =
  filter === "all"
    ? true
    : filter === "fees"
    ? [
        "fee_mp",
        "fee_platform",
        "fee_platform_iva"
      ].includes(l.type)
    : l.type === filter

return matchesSearch && matchesFilter

  })

  .sort((a, b) => {

  const priority: Record<string, number> = {
    withdraw: 1,
    creator_net: 2,
    payment: 3,
    fee_mp: 4,
    fee_platform: 4,
    fee_platform_iva: 4,
    tip: 5
  }

  const aPriority = priority[a.type] || 99
  const bPriority = priority[b.type] || 99

  // prioridad primero
  if (aPriority !== bPriority) {
    return aPriority - bPriority
  }

  // más reciente primero
  return (
    new Date(b.created_at).getTime() -
    new Date(a.created_at).getTime()
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

          <button
  onClick={() => navigator.clipboard.writeText(l.campaign_id)}
  className="text-xs text-gray-400 hover:text-white text-left"
>
  {l.campaign_id}
</button>

        </div>
      </td>

      <td className="p-3">

  <button
    onClick={() => navigator.clipboard.writeText(l.payment_id)}
    className="hover:text-primary transition"
  >
    {l.payment_id}
  </button>

</td>

      <td className="p-3">

  <span
    className={`px-2 py-1 rounded-full text-xs font-medium border

      ${
        l.type === "payment"
          ? "bg-blue-500/10 border-blue-500/30 text-blue-300"

        : l.type === "creator_net"
          ? "bg-green-500/10 border-green-500/30 text-green-300"

        : l.type === "withdraw"
          ? "bg-red-500/10 border-red-500/30 text-red-300"

        : l.type?.includes("fee")
          ? "bg-yellow-500/10 border-yellow-500/30 text-yellow-300"

        : l.type === "tip"
          ? "bg-purple-500/10 border-purple-500/30 text-purple-300"

        : "bg-slate-700 border-slate-600 text-slate-300"
      }

    `}
  >
    {l.type}
  </span>

</td>

    </tr>

))}
          </tbody>

        </table>

      </div>

    </main>
  )
}