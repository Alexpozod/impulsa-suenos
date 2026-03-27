'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/src/lib/supabase'
import { useRouter } from 'next/navigation'

export default function AdminWithdrawals() {

  const router = useRouter()

  const [list, setList] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [adminEmail, setAdminEmail] = useState("")

  const load = async () => {
    const res = await fetch('/api/admin/withdrawals')
    const data = await res.json()
    setList(data || [])
    setLoading(false)
  }

  useEffect(() => {

    const checkAdmin = async () => {

      const { data: userData } = await supabase.auth.getUser()

      if (!userData.user) {
        router.push('/login')
        return
      }

      setAdminEmail(userData.user.email || "")

      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', userData.user.id)
        .single()

      if (!profile || profile.role !== 'admin') {
        router.push('/')
        return
      }

      load()
    }

    checkAdmin()

  }, [])

  const update = async (id: string, action: string) => {

    const confirmAction = confirm(`¿Seguro que quieres ${action}?`)
    if (!confirmAction) return

    let reason = null

    if (action === "reject") {
      reason = prompt("Motivo del rechazo:")
    }

    const res = await fetch('/api/admin/withdrawals', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        withdrawalId: id,
        action,
        adminEmail,
        reason
      })
    })

    const data = await res.json()

    if (!res.ok) {
      alert(data.error || 'Error')
      return
    }

    load()
  }

  return (
    <main className="min-h-screen bg-slate-950 text-white p-10">

      <h1 className="text-3xl font-bold mb-8">
        💸 Panel de Retiros (Admin)
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

                  {/* 🔥 RIESGO */}
                  <p className="text-sm mt-1">
                    Riesgo:{" "}
                    <span className={`
                      font-bold
                      ${w.user_risk?.score >= 70 && 'text-red-500'}
                      ${w.user_risk?.score >= 40 && w.user_risk?.score < 70 && 'text-yellow-400'}
                      ${w.user_risk?.score < 40 && 'text-green-400'}
                    `}>
                      {w.user_risk?.score || 0}
                    </span>
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

              {w.status === 'pending' && (
                <div className="flex gap-3 mt-4">

                  <button
                    onClick={() => update(w.id, 'approve')}
                    className="bg-green-600 px-4 py-2 rounded-lg text-sm hover:bg-green-700"
                  >
                    ✅ Aprobar
                  </button>

                  <button
                    onClick={() => update(w.id, 'reject')}
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
