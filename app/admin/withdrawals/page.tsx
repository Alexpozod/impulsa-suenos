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

  const getRiskColor = (score: number) => {
    if (score >= 70) return "bg-red-600"
    if (score >= 40) return "bg-yellow-500"
    return "bg-green-600"
  }

  const getStatusColor = (status: string) => {
    if (status === "pending") return "bg-yellow-500"
    if (status === "approved") return "bg-green-600"
    if (status === "rejected") return "bg-red-600"
    return "bg-gray-500"
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
        <div className="grid gap-5">

          {list.map((w) => {

            const risk = w.user_risk?.score || 0

            return (
              <div
                key={w.id}
                className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-lg"
              >

                {/* HEADER */}
                <div className="flex justify-between items-center">

                  <div>
                    <p className="font-semibold text-lg">
                      {w.user_email}
                    </p>

                    <p className="text-xs text-slate-400">
                      {new Date(w.created_at).toLocaleString()}
                    </p>
                  </div>

                  <div className="text-right">
                    <p className="text-2xl font-bold text-green-400">
                      ${Number(w.amount).toLocaleString()}
                    </p>

                    <span className={`text-xs px-3 py-1 rounded-full ${getStatusColor(w.status)}`}>
                      {w.status.toUpperCase()}
                    </span>
                  </div>

                </div>

                {/* RIESGO */}
                <div className="mt-4 flex items-center gap-3">

                  <span className="text-sm text-slate-400">
                    Riesgo:
                  </span>

                  <span className={`text-xs px-3 py-1 rounded-full ${getRiskColor(risk)}`}>
                    {risk}
                  </span>

                  <span className="text-xs text-slate-400">
                    {w.user_risk?.status || "normal"}
                  </span>

                </div>

                {/* MOTIVO RECHAZO */}
                {w.rejection_reason && (
                  <div className="mt-3 text-sm text-red-400">
                    Motivo: {w.rejection_reason}
                  </div>
                )}

                {/* BOTONES */}
                {w.status === 'pending' && (
                  <div className="flex gap-3 mt-5">

                    <button
                      onClick={() => update(w.id, 'approve')}
                      className="bg-green-600 px-4 py-2 rounded-lg text-sm hover:bg-green-700 transition"
                    >
                      ✅ Aprobar
                    </button>

                    <button
                      onClick={() => update(w.id, 'reject')}
                      className="bg-red-600 px-4 py-2 rounded-lg text-sm hover:bg-red-700 transition"
                    >
                      ❌ Rechazar
                    </button>

                  </div>
                )}

              </div>
            )
          })}

        </div>
      )}

    </main>
  )
}
