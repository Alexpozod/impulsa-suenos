'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/src/lib/supabase'

export default function AdminWithdrawals() {

  const [list, setList] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const load = async () => {
    setLoading(true)

    const { data } = await supabase
      .from('withdrawals')
      .select('*')
      .order('created_at', { ascending: false })

    setList(data || [])
    setLoading(false)
  }

  useEffect(() => {
    load()
  }, [])

  const update = async (id: string, status: string) => {

    const confirmAction = confirm(`¿Seguro que quieres ${status}?`)
    if (!confirmAction) return

    const { error } = await supabase
      .from('withdrawals')
      .update({ status })
      .eq('id', id)

    if (error) {
      alert('Error actualizando')
      return
    }

    load()
  }

  return (
    <main className="min-h-screen bg-slate-950 text-white p-10">

      <h1 className="text-3xl font-bold mb-8">
        💸 Panel de Retiros
      </h1>

      {loading ? (
        <p className="text-slate-400">Cargando...</p>
      ) : list.length === 0 ? (
        <p className="text-slate-400">No hay retiros</p>
      ) : (
        <div className="space-y-4">

          {list.map((w) => (

            <div
              key={w.id}
              className="bg-slate-900 border border-slate-800 p-5 rounded-xl"
            >

              <div className="flex justify-between items-center">

                <div>
                  <p className="font-semibold">
                    {w.user_email}
                  </p>

                  <p className="text-sm text-slate-400">
                    {new Date(w.created_at).toLocaleString()}
                  </p>
                </div>

                <div className="text-right">
                  <p className="text-xl font-bold text-green-400">
                    ${Number(w.amount).toLocaleString()}
                  </p>

                  <p className={`
                    text-sm font-semibold
                    ${w.status === 'pending' && 'text-yellow-400'}
                    ${w.status === 'approved' && 'text-green-500'}
                    ${w.status === 'rejected' && 'text-red-500'}
                  `}>
                    {w.status.toUpperCase()}
                  </p>
                </div>

              </div>

              {/* BOTONES SOLO SI ESTÁ PENDIENTE */}
              {w.status === 'pending' && (
                <div className="flex gap-3 mt-4">

                  <button
                    onClick={() => update(w.id, 'approved')}
                    className="bg-green-600 px-4 py-2 rounded-lg text-sm hover:bg-green-700"
                  >
                    ✅ Aprobar
                  </button>

                  <button
                    onClick={() => update(w.id, 'rejected')}
                    className="bg-red-600 px-4 py-2 rounded-lg text-sm hover:bg-red-700"
                  >
                    ❌ Rechazar
                  </button>

                </div>
              )}

            </div>

          ))}

        </div>
      )}

    </main>
  )
}
