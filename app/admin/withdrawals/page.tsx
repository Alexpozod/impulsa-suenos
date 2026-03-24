'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/src/lib/supabase'

export default function AdminWithdrawals() {

  const [list, setList] = useState<any[]>([])

  const load = async () => {
    const { data } = await supabase
      .from('withdrawals')
      .select('*')
      .order('created_at', { ascending: false })

    setList(data || [])
  }

  useEffect(() => {
    load()
  }, [])

  const update = async (id: string, status: string) => {
    await supabase
      .from('withdrawals')
      .update({ status })
      .eq('id', id)

    load()
  }

  return (
    <main className="p-6 text-white bg-black min-h-screen">

      <h1 className="text-2xl mb-6">Retiros</h1>

      {list.map(w => (
        <div key={w.id} className="border p-4 mb-3">

          <p>{w.user_email}</p>
          <p>${w.amount}</p>
          <p>{w.status}</p>

          <button onClick={() => update(w.id, 'approved')}>
            Aprobar
          </button>

          <button onClick={() => update(w.id, 'rejected')}>
            Rechazar
          </button>

        </div>
      ))}

    </main>
  )
}
