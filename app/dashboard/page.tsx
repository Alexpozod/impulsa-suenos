'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/src/lib/supabase'
import { useRouter } from 'next/navigation'

export default function Dashboard() {

  const router = useRouter()

  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    load()
  }, [])

  const load = async () => {

    const { data: session } = await supabase.auth.getSession()

    if (!session.session) {
      router.push('/login')
      return
    }

    const token = session.session.access_token

    const res = await fetch('/api/user/finance', {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })

    const json = await res.json()

    setData(json)
    setLoading(false)
  }

  const requestWithdraw = async (campaign_id: string) => {

    const amount = prompt("Monto a retirar")

    if (!amount) return

    const session = await supabase.auth.getSession()

    const res = await fetch('/api/payout/request', {
      method: 'POST',
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${session.data.session?.access_token}`
      },
      body: JSON.stringify({
        campaign_id,
        amount: Number(amount)
      })
    })

    const result = await res.json()

    alert(result.message || result.error)
    load()
  }

  if (loading) return <div className="p-10">Cargando...</div>

  return (
    <main className="p-10 max-w-6xl mx-auto">

      <h1 className="text-2xl font-bold mb-6">
        💰 Panel financiero
      </h1>

      {/* TOTALES */}
      <div className="grid md:grid-cols-4 gap-4 mb-8">

        <Card title="Disponible" value={`$${data.totals.balance}`} />
        <Card title="Recaudado" value={`$${data.totals.raised}`} />
        <Card title="Comisiones" value={`$${data.totals.fees}`} />
        <Card title="Pendiente" value={`$${data.totals.pending}`} />

      </div>

      {/* CAMPAÑAS */}
      <div className="space-y-4">

        {data.campaigns.map((c: any) => (
          <div key={c.id} className="border p-4 rounded-xl">

            <h2 className="font-bold">{c.title}</h2>

            <div className="grid md:grid-cols-5 gap-4 text-sm mt-3">

              <div>Recaudado: ${c.raised}</div>
              <div>Disponible: ${c.available}</div>
              <div>Retirado: ${c.withdrawn}</div>
              <div>Pendiente: ${c.pending}</div>

            </div>

            <button
              onClick={() => requestWithdraw(c.id)}
              className="mt-3 bg-black text-white px-4 py-2 rounded"
            >
              Solicitar retiro
            </button>

          </div>
        ))}

      </div>

    </main>
  )
}

function Card({ title, value }: any) {
  return (
    <div className="bg-white p-4 rounded-xl border shadow">
      <p className="text-sm text-gray-500">{title}</p>
      <p className="font-bold text-lg">{value}</p>
    </div>
  )
}