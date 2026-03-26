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
  const [tickets, setTickets] = useState<any[]>([])
  const [donations, setDonations] = useState<any[]>([])
  const [kyc, setKyc] = useState<any>(null)
  const [wallet, setWallet] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {

    const { data: userData } = await supabase.auth.getUser()

    if (!userData.user) {
      router.push('/login')
      return
    }

    setUser(userData.user)

    // 🎟️ Tickets
    const { data: userTickets } = await supabase
      .from('tickets')
      .select('*')
      .eq('user_email', userData.user.email)

    // 💰 Donaciones
    const { data: userDonations } = await supabase
      .from('donations')
      .select('*')
      .eq('user_email', userData.user.email)
      .order('created_at', { ascending: true })

    // 🛡️ KYC
    const { data: kycData } = await supabase
      .from('kyc')
      .select('*')
      .eq('user_email', userData.user.email)
      .maybeSingle()

    // 💰 WALLET
    const { data: walletData } = await supabase
      .from('wallets')
      .select('*')
      .eq('user_email', userData.user.email)
      .maybeSingle()

    setTickets(userTickets || [])
    setDonations(userDonations || [])
    setKyc(kycData || null)
    setWallet(walletData || null)

    setLoading(false)
  }

  const logout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  const requestWithdraw = async () => {
    const amountInput = prompt("¿Cuánto deseas retirar?")

    if (!amountInput) return

    const amount = Number(amountInput)

    if (isNaN(amount) || amount <= 0) {
      alert("Monto inválido")
      return
    }

    const res = await fetch('/api/withdraw', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: user.email,
        amount
      })
    })

    const data = await res.json()

    if (data.error) {
      alert(data.error)
    } else {
      alert("✅ Retiro solicitado")
      loadData()
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-gray-500">Cargando dashboard...</p>
      </div>
    )
  }

  const kycStatus = kyc?.status || 'none'
  const totalSpent = donations.reduce((sum, d) => sum + Number(d.amount), 0)

  const chartData = donations.map((d, i) => ({
    name: `#${i + 1}`,
    amount: Number(d.amount)
  }))

  return (
    <main className="min-h-screen bg-gray-50 px-6 py-10">

      <div className="max-w-6xl mx-auto">

        {/* HEADER */}
        <div className="flex justify-between items-center mb-6">

          <h1 className="text-2xl font-bold">
            👋 Hola, {user?.email}
          </h1>

          <button
            onClick={logout}
            className="bg-black text-white px-4 py-2 rounded-lg text-sm"
          >
            Cerrar sesión
          </button>

        </div>

        {/* 🔥 BOTONES ADMIN */}
        <div className="flex gap-4 mb-10">

          <button
            onClick={() => router.push('/admin/withdrawals')}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700"
          >
            💸 Panel Retiros
          </button>

          <button
            onClick={() => router.push('/admin/earnings')}
            className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-green-700"
          >
            💰 Ver Ganancias
          </button>

        </div>

        {/* 🚨 KYC */}
        {kycStatus !== 'approved' && (
          <div className="mb-8 bg-yellow-50 border p-5 rounded-xl">
            <p>Debes verificar tu identidad</p>
            <button
              onClick={() => router.push('/kyc')}
              className="bg-green-600 text-white px-4 py-2 mt-2 rounded"
            >
              Completar KYC
            </button>
          </div>
        )}

        {/* STATS */}
        <div className="grid md:grid-cols-4 gap-6 mb-10">

          <div className="bg-white p-6 rounded-xl border">
            <p>🎟️ Tickets</p>
            <p className="text-2xl font-bold">{tickets.length}</p>
          </div>

          <div className="bg-white p-6 rounded-xl border">
            <p>💰 Compras</p>
            <p className="text-2xl font-bold">{donations.length}</p>
          </div>

          <div className="bg-white p-6 rounded-xl border">
            <p>💵 Total invertido</p>
            <p className="text-2xl font-bold text-green-600">
              ${totalSpent.toLocaleString()}
            </p>
          </div>

          {/* 💰 WALLET */}
          <div className="bg-white p-6 rounded-xl border">
            <p>💰 Saldo</p>
            <p className="text-2xl font-bold text-green-600">
              ${Number(wallet?.balance || 0).toLocaleString()}
            </p>

            <button
              onClick={requestWithdraw}
              className="mt-3 bg-red-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-red-700"
            >
              💸 Retirar dinero
            </button>
          </div>

        </div>

        {/* 📊 GRÁFICO */}
        <div className="bg-white p-6 rounded-xl border mb-10">

          <h2 className="mb-4 font-bold">
            📊 Historial
          </h2>

          {chartData.length > 0 ? (
            <div className="w-full h-64">
              <ResponsiveContainer>
                <LineChart data={chartData}>
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="amount" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <p>Sin datos</p>
          )}

        </div>

      </div>

    </main>
  )
}
