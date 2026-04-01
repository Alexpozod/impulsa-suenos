'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/src/lib/supabase'
import { useRouter } from 'next/navigation'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer
} from 'recharts'

export default function Dashboard() {

  const router = useRouter()

  const [user, setUser] = useState<any>(null)
  const [wallet, setWallet] = useState<any>(null)
  const [transactions, setTransactions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    load()
  }, [])

  const load = async () => {

    const { data } = await supabase.auth.getSession()

    if (!data.session) {
      router.push('/login')
      return
    }

    const user = data.session.user
    setUser(user)

    const userId = user.id

    // 🔥 USAR USER_ID (NO EMAIL)
    const [walletRes, txRes] = await Promise.all([

      supabase
        .from('wallets')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle(),

      supabase
        .from('transactions')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: true })

    ])

    setWallet(walletRes.data)
    setTransactions(txRes.data || [])

    setLoading(false)
  }

  const logout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  const requestWithdraw = async () => {

    const amount = prompt("Monto a retirar")

    if (!amount) return

    const session = await supabase.auth.getSession()

    const res = await fetch('/api/withdraw', {
      method: 'POST',
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${session.data.session?.access_token}`
      },
      body: JSON.stringify({
        amount: Number(amount)
      })
    })

    const data = await res.json()

    if (data.error) {
      alert(data.error)
    } else {
      alert("Retiro solicitado")
      load()
    }
  }

  if (loading) {
    return <div className="p-10">Cargando...</div>
  }

  let balance = 0

  const chartData = transactions.map((t, i) => {

    if (t.type === 'deposit') balance += Number(t.amount)
    if (t.type === 'withdraw') balance -= Number(t.amount)

    return {
      name: `#${i}`,
      balance
    }
  })

  return (
    <main className="p-10">

      <div className="flex justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold">Dashboard</h1>
          <p className="text-sm text-gray-500">{user.email}</p>
        </div>

        <button onClick={logout}>
          Logout
        </button>
      </div>

      <div className="mb-6">
        <p>Saldo:</p>
        <p className="text-2xl font-bold">
          ${wallet?.balance || 0}
        </p>

        <button
          onClick={requestWithdraw}
          className="mt-2 bg-black text-white px-4 py-2 rounded"
        >
          Retirar
        </button>
      </div>

      <div className="bg-white p-4 rounded shadow">
        <ResponsiveContainer width="100%" height={250}>
          <LineChart data={chartData}>
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Line dataKey="balance" />
          </LineChart>
        </ResponsiveContainer>
      </div>

    </main>
  )
}
