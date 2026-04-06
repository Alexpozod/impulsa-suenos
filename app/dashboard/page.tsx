'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/src/lib/supabase'
import { useRouter } from 'next/navigation'

type FinanceData = {
  totals: {
    balance: number
    raised: number
    fees: number
    pending: number
  }
  campaigns: any[]
}

export default function Dashboard() {

  const router = useRouter()

  const [data, setData] = useState<FinanceData | null>(null)
  const [loading, setLoading] = useState(true)
  const [isReady, setIsReady] = useState(false)

  useEffect(() => {
    load()
  }, [])

  const load = async () => {

    const { data: session } = await supabase.auth.getSession()

    if (!session.session) {
      router.push('/login')
      return
    }

    const user = session.session.user
    const email = user.email?.toLowerCase() || ""
    const token = session.session.access_token

    // 🔐 VALIDACIÓN REAL
    const { data: kyc } = await supabase
      .from("kyc")
      .select("status")
      .eq("user_email", email)
      .maybeSingle()

    const { data: banks } = await supabase
      .from("bank_accounts")
      .select("id")
      .eq("user_email", email)
      .limit(1)

    const kycOk = kyc?.status === "approved"
    const bankOk = (banks?.length || 0) > 0

    setIsReady(kycOk && bankOk)

    // 💰 FINANCE
    try {
      const res = await fetch('/api/user/finance', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })

      const json = await res.json()
      setData(json)

    } catch (err) {
      console.error(err)
      setData(null)
    }

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

      <h1 className="text-2xl font-bold mb-2">
        💰 Panel financiero
      </h1>

      {/* ✅ MENSAJE CORREGIDO */}
      {!isReady ? (
        <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg text-sm">
          ⚠️ Para retirar dinero debes completar tu verificación (KYC) y agregar una cuenta bancaria.
        </div>
      ) : (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg text-sm">
          ✅ Cuenta verificada y lista para retiros
        </div>
      )}

      <div className="grid md:grid-cols-4 gap-4 mb-8">
        <Card title="Disponible" value={`$${data?.totals?.balance ?? 0}`} />
        <Card title="Recaudado" value={`$${data?.totals?.raised ?? 0}`} />
        <Card title="Comisiones" value={`$${data?.totals?.fees ?? 0}`} />
        <Card title="Pendiente" value={`$${data?.totals?.pending ?? 0}`} />
      </div>

      <div className="space-y-4">

        {(data?.campaigns ?? []).map((c: any) => (
          <div key={c.id} className="border p-4 rounded-xl">

            <h2 className="font-bold">{c.title}</h2>

            <div className="grid md:grid-cols-5 gap-4 text-sm mt-3">
              <div>Recaudado: ${c.raised}</div>
              <div>Disponible: ${c.available}</div>
              <div>Retirado: ${c.withdrawn}</div>
              <div>Pendiente: ${c.pending}</div>
            </div>

            <div className="flex gap-2 mt-3">

              <button
                onClick={() => requestWithdraw(c.id)}
                className="bg-black text-white px-4 py-2 rounded"
              >
                Retirar
              </button>

              {/* 🔥 BOTÓN EDITAR */}
              <button
                onClick={() => router.push(`/dashboard/edit/${c.id}`)}
                className="bg-blue-600 text-white px-4 py-2 rounded"
              >
                Editar
              </button>

            </div>

          </div>
        ))}

      </div>

    </main>
  )
}

function Card({ title, value }: { title: string; value: string }) {
  return (
    <div className="bg-white p-4 rounded-xl border shadow">
      <p className="text-sm text-gray-500">{title}</p>
      <p className="font-bold text-lg">{value}</p>
    </div>
  )
}