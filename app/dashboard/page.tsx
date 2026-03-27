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
  const [transactions, setTransactions] = useState<any[]>([])
  const [kyc, setKyc] = useState<any>(null)
  const [wallet, setWallet] = useState<any>(null)
  const [risk, setRisk] = useState<any>(null)
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

    const email = userData.user.email

    // 🔥 TODAS LAS CONSULTAS EN PARALELO (MEJOR PERFORMANCE)
    const [
      ticketsRes,
      donationsRes,
      transactionsRes,
      kycRes,
      walletRes,
      riskRes
    ] = await Promise.all([

      supabase.from('tickets').select('*').eq('user_email', email),

      supabase.from('donations')
        .select('*')
        .eq('user_email', email)
        .order('created_at', { ascending: true }),

      supabase.from('transactions')
        .select('*')
        .eq('user_email', email)
        .order('created_at', { ascending: true }),

      supabase.from('kyc')
        .select('*')
        .eq('user_email', email)
        .maybeSingle(),

      supabase.from('wallets')
        .select('*')
        .eq('user_email', email)
        .maybeSingle(),

      supabase.from('user_risk')
        .select('*')
        .eq('user_email', email)
        .maybeSingle()
    ])

    setTickets(ticketsRes.data || [])
    setDonations(donationsRes.data || [])
    setTransactions(transactionsRes.data || [])
    setKyc(kycRes.data || null)
    setWallet(walletRes.data || null)
    setRisk(riskRes.data || null)

    setLoading(false)
  }

  const logout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  // 🚨 RETIRO (MEJORADO)
  const requestWithdraw = async () => {

    if (risk?.status === 'blocked') {
      alert("🚫 Cuenta bloqueada por seguridad")
      return
    }

    if (risk?.score > 70) {
      alert("⚠️ Riesgo alto. Contacta soporte")
      return
    }

    if (!wallet?.balance || wallet.balance <= 0) {
      alert("No tienes saldo disponible")
      return
    }

    const amountInput = prompt(`Saldo disponible: $${wallet.balance}\n¿Cuánto deseas retirar?`)
    if (!amountInput) return

    const amount = Number(amountInput)

    if (isNaN(amount) || amount <= 0) {
      alert("Monto inválido")
      return
    }

    if (amount > wallet.balance) {
      alert("Saldo insuficiente")
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
      alert("✅ Retiro solicitado correctamente")
      loadData()
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Cargando dashboard...
      </div>
    )
  }

  const totalSpent = donations.reduce((sum, d) => sum + Number(d.amount), 0)
  const balanceReal = Number(wallet?.balance || 0)

  // 📊 GRÁFICO REAL
  let runningBalance = 0

  const chartData = transactions.map((t, i) => {

    if (t.type === 'deposit') runningBalance += Number(t.amount)
    if (t.type === 'withdraw') runningBalance -= Number(t.amount)
    if (t.type === 'purchase') runningBalance -= Number(t.amount)

    return {
      name: `#${i + 1}`,
      balance: runningBalance
    }
  })

  return (
    <main className="min-h-screen bg-gray-50 px-6 py-10">

      <div className="max-w-6xl mx-auto">

        {/* HEADER */}
        <div className="flex justify-between items-center mb-8">

          <div>
            <h1 className="text-2xl font-bold">
              👋 Hola
            </h1>
            <p className="text-gray-500 text-sm">{user?.email}</p>
          </div>

          <button
            onClick={logout}
            className="bg-black text-white px-4 py-2 rounded-lg text-sm"
          >
            Cerrar sesión
          </button>

        </div>

        {/* ALERTAS */}
        {risk?.score > 50 && (
          <div className="mb-6 bg-red-50 border border-red-200 p-4 rounded-xl">
            ⚠️ Actividad sospechosa detectada
          </div>
        )}

        {kyc?.status !== 'approved' && (
          <div className="mb-6 bg-yellow-50 border p-4 rounded-xl">
            Debes completar tu verificación (KYC)
            <button
              onClick={() => router.push('/kyc')}
              className="ml-3 bg-green-600 text-white px-3 py-1 rounded"
            >
              Verificar
            </button>
          </div>
        )}

        {/* STATS */}
        <div className="grid md:grid-cols-4 gap-6 mb-10">

          <div className="bg-white p-6 rounded-xl border">
            <p className="text-gray-500 text-sm">Tickets</p>
            <p className="text-2xl font-bold">{tickets.length}</p>
          </div>

          <div className="bg-white p-6 rounded-xl border">
            <p className="text-gray-500 text-sm">Compras</p>
            <p className="text-2xl font-bold">{donations.length}</p>
          </div>

          <div className="bg-white p-6 rounded-xl border">
            <p className="text-gray-500 text-sm">Invertido</p>
            <p className="text-2xl font-bold text-green-600">
              ${totalSpent.toLocaleString()}
            </p>
          </div>

          <div className="bg-white p-6 rounded-xl border">
            <p className="text-gray-500 text-sm">Saldo</p>
            <p className="text-2xl font-bold text-green-600">
              ${balanceReal.toLocaleString()}
            </p>

            <button
              onClick={requestWithdraw}
              className="mt-3 w-full bg-green-600 text-white py-2 rounded-lg text-sm hover:bg-green-700"
            >
              💸 Retirar dinero
            </button>
          </div>

        </div>

        {/* GRÁFICO */}
        <div className="bg-white p-6 rounded-xl border mb-10">

          <h2 className="mb-4 font-bold">
            📊 Evolución del saldo
          </h2>

          {chartData.length > 0 ? (
            <div className="w-full h-64">
              <ResponsiveContainer>
                <LineChart data={chartData}>
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="balance" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <p className="text-gray-400">Sin movimientos</p>
          )}

        </div>

      </div>

    </main>
  )
}
