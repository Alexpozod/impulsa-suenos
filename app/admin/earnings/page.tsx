'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/src/lib/supabase'

export default function AdminEarnings() {

  const [transactions, setTransactions] = useState<any[]>([])
  const [total, setTotal] = useState(0)

  const load = async () => {

    const { data } = await supabase
      .from('transactions')
      .select('*')
      .eq('type', 'commission')
      .order('created_at', { ascending: false })

    setTransactions(data || [])

    const sum =
      data?.reduce((acc, t) => acc + Number(t.amount), 0) || 0

    setTotal(sum)
  }

  useEffect(() => {
    load()
  }, [])

  return (
    <main className="min-h-screen bg-black text-white p-10">

      <h1 className="text-3xl font-bold mb-8">
        💰 Ganancias de la Plataforma
      </h1>

      {/* TOTAL */}
      <div className="bg-green-600 p-6 rounded-xl mb-10">
        <p className="text-sm">Total ganado</p>
        <p className="text-3xl font-bold">
          ${total.toLocaleString()}
        </p>
      </div>

      {/* LISTADO */}
      <div className="space-y-4">

        {transactions.map((t) => (
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
