'use client'

import { useEffect, useState } from "react"
import { supabase } from "@/src/lib/supabase"

export default function FinancePage() {

  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [amount, setAmount] = useState("")
  const [message, setMessage] = useState("")

  useEffect(() => {
    load()
  }, [])

  const load = async () => {
    const { data: { session } } = await supabase.auth.getSession()

    const res = await fetch("/api/user/finance", {
      headers: {
        Authorization: `Bearer ${session?.access_token}`
      }
    })

    const json = await res.json()
    setData(json)
    setLoading(false)
  }

  const requestPayout = async () => {
    setMessage("")

    const { data: { session } } = await supabase.auth.getSession()

    const res = await fetch("/api/payouts/payout/request", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${session?.access_token}`
      },
      body: JSON.stringify({
        campaign_id: data.movements?.[0]?.campaign_id,
        amount: Number(amount)
      })
    })

    const json = await res.json()

    if (json.error) {
      setMessage(`❌ ${json.error}`)
    } else {
      setMessage(`✅ ${json.message}`)
      load()
    }
  }

  if (loading) return <div className="p-6">Cargando...</div>

  return (
    <main className="p-6 max-w-4xl mx-auto space-y-6">

      <h1 className="text-2xl font-bold">💰 Tu dinero</h1>

      {/* BALANCE */}
      <div className="grid grid-cols-3 gap-4">

        <Card title="Disponible" value={data.available} />
        <Card title="En revisión" value={data.pending} />
        <Card title="Total generado" value={data.balance} />

      </div>

      {/* RETIRO */}
      <div className="bg-white p-5 rounded-xl border space-y-3">

        <h2 className="font-semibold">Solicitar retiro</h2>

        <input
          type="number"
          placeholder="Monto"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className="w-full border p-2 rounded"
        />

        <button
          onClick={requestPayout}
          className="bg-green-600 text-white px-4 py-2 rounded"
        >
          Solicitar retiro
        </button>

        <p className="text-sm text-gray-500">
          Los pagos entran en revisión y pueden tardar entre 2 a 5 días hábiles.
        </p>

        {message && <p className="text-sm">{message}</p>}
      </div>

      {/* HISTORIAL */}
      <div className="bg-white p-5 rounded-xl border">

        <h2 className="font-semibold mb-3">Historial</h2>

        {data.movements.map((m: any, i: number) => (
          <div key={i} className="flex justify-between text-sm border-b py-2">
            <span>{m.type}</span>
            <span>${m.amount}</span>
          </div>
        ))}

      </div>

    </main>
  )
}

function Card({ title, value }: any) {
  return (
    <div className="bg-white p-4 rounded-xl border">
      <p className="text-sm text-gray-500">{title}</p>
      <p className="text-xl font-bold">${value}</p>
    </div>
  )
}