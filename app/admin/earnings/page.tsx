'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/src/lib/supabase'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer
} from 'recharts'

export default function AdminEarnings() {

  const [transactions, setTransactions] = useState<any[]>([])
  const [totalFees, setTotalFees] = useState(0)
  const [totalDeposits, setTotalDeposits] = useState(0)
  const [totalWithdraws, setTotalWithdraws] = useState(0)
  const [loading, setLoading] = useState(true)

  const load = async () => {

    setLoading(true)

    const { data } = await supabase
      .from('transactions')
      .select('*')
      .order('created_at', { ascending: true })

    const list = data || []
    setTransactions(list)

    // 🔢 cálculos
    let fees = 0
    let deposits = 0
    let withdraws = 0

    list.forEach(t => {
      if (t.type === 'commission') fees += Number(t.amount)
      if (t.type === 'deposit') deposits += Number(t.amount)
      if (t.type === 'withdraw') withdraws += Number(t.amount)
    })

    setTotalFees(fees)
    setTotalDeposits(deposits)
    setTotalWithdraws(withdraws)

    setLoading(false)
  }

  useEffect(() => {
    load()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black text-white">
        Cargando...
      </div>
    )
  }

  // =========================
  // 📊 GRÁFICO (balance sistema)
  // =========================
  let balance = 0

  const chartData = transactions.map((t, i) => {

    if (t.type === 'deposit') balance += Number(t.amount)
    if (t.type === 'withdraw') balance -= Number(t.amount)
    if (t.type === 'commission') balance += Number(t.amount)

    return {
      name: `#${i + 1}`,
      balance
    }
  })

  return (
    <main className="min-h-screen bg-black text-white p-10">

      <h1 className="text-3xl font-bold mb-10">
        💰 Panel Financiero
      </h1>

      {/* =========================
          📊 MÉTRICAS
      ========================= */}
      <div className="grid md:grid-cols-3 gap-6 mb-10">

        <div className="bg-primary p-6 rounded-xl">
          <p className="text-sm">Ganancia (comisiones)</p>
          <p className="text-3xl font-bold">
            ${totalFees.toLocaleString()}
          </p>
        </div>

        <div className="bg-blue-600 p-6 rounded-xl">
          <p className="text-sm">Ingresos plataforma</p>
          <p className="text-3xl font-bold">
            ${totalDeposits.toLocaleString()}
          </p>
        </div>

        <div className="bg-red-600 p-6 rounded-xl">
          <p className="text-sm">Retiros</p>
          <p className="text-3xl font-bold">
            ${totalWithdraws.toLocaleString()}
          </p>
        </div>

      </div>

      {/* =========================
          📈 GRÁFICO
      ========================= */}
      <div className="bg-slate-900 p-6 rounded-xl mb-10 border border-slate-800">

        <h2 className="mb-4 font-bold">
          📊 Evolución del sistema
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
          <p>Sin datos</p>
        )}

      </div>

      {/* =========================
          📋 LISTADO SOLO COMISIONES
      ========================= */}
      <div className="space-y-4">

        {transactions
          .filter(t => t.type === 'commission')
          .slice()
          .reverse()
          .map((t) => (
            <div
              key={t.id}
              className="bg-slate-900 border border-slate-800 p-4 rounded-lg flex justify-between"
            >
              <div>
                <p className="text-sm text-slate-400">
                  {new Date(t.created_at).toLocaleString()}
                </p>

                <p className="text-xs text-slate-500">
                  Ref: {t.reference_id}
                </p>
              </div>

              <p className="text-green-400 font-bold">
                +${Number(t.amount).toLocaleString()}
              </p>
            </div>
          ))}

      </div>

    </main>
  )
}
