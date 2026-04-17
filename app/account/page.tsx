'use client'

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/src/lib/supabase"
import { useFinancialDashboard } from "@/app/hooks/useFinancialDashboard"

export default function AccountPage() {

  const router = useRouter()

  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)

  const [kycStatus, setKycStatus] = useState<string | null>(null)
  const [bankLoaded, setBankLoaded] = useState(false)

  const { data: finance } = useFinancialDashboard()

  useEffect(() => {
    const load = async () => {

      const { data } = await supabase.auth.getUser()

      if (!data.user) {
        router.push('/login')
        return
      }

      setUser(data.user)

      const email = data.user.email!.toLowerCase()

      const { data: kyc } = await supabase
        .from("kyc")
        .select("status")
        .eq("user_email", email)
        .maybeSingle()

      setKycStatus(kyc?.status || null)

      const { data: bankAccounts } = await supabase
        .from("bank_accounts")
        .select("id")
        .eq("user_email", email)
        .limit(1)

      setBankLoaded((bankAccounts?.length || 0) > 0)

      setLoading(false)
    }

    load()
  }, [router])

  if (loading) return <div className="p-6">Cargando...</div>

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto p-6">

        <h1 className="text-3xl font-bold mb-2">Mi Cuenta</h1>
        <p className="text-gray-600 mb-6">{user?.email}</p>

        {/* 🔐 STATUS */}
        <div className="mb-6 flex gap-3">

          <span className={`px-3 py-1 rounded text-sm ${
            kycStatus === 'approved'
              ? 'bg-green-100 text-green-700'
              : 'bg-red-100 text-red-700'
          }`}>
            KYC: {kycStatus || 'no iniciado'}
          </span>

          <span className={`px-3 py-1 rounded text-sm ${
            bankLoaded
              ? 'bg-green-100 text-green-700'
              : 'bg-red-100 text-red-700'
          }`}>
            Banco: {bankLoaded ? 'OK' : 'pendiente'}
          </span>

        </div>

        {/* 💰 RESUMEN */}
        {finance && (
          <div className="grid md:grid-cols-4 gap-4 mb-6">

            <MiniCard title="Disponible" value={finance.totals.balance} highlight />
            <MiniCard title="Recaudado" value={finance.totals.raised} />
            <MiniCard title="Retirado" value={finance.totals.withdrawn} />
            <MiniCard title="Pendiente" value={finance.totals.pending} />

          </div>
        )}

        {/* ⚡ ACCIONES */}
        <div className="mb-6 flex flex-wrap gap-3">

          <button
            onClick={() => router.push("/create")}
            className="px-4 py-2 bg-green-600 text-white rounded"
          >
            ➕ Crear campaña
          </button>

          {finance?.totals?.balance > 0 && bankLoaded && kycStatus === "approved" && (
            <button
              onClick={() => router.push("/account/withdraw")}
              className="px-4 py-2 bg-blue-600 text-white rounded"
            >
              💸 Retirar fondos
            </button>
          )}

        </div>

        {/* 🔘 ACCESOS */}
        <div className="grid md:grid-cols-2 gap-6">

          <button onClick={() => router.push("/dashboard")} className="p-4 bg-white border rounded hover:bg-gray-100">
            📊 Dashboard
          </button>

          {/* ✅ CAMBIO QUIRÚRGICO */}
          <button onClick={() => router.push("/dashboard")} className="p-4 bg-white border rounded hover:bg-gray-100">
            📂 Gestionar campañas
          </button>

          <button onClick={() => router.push("/account/bank")} className="p-4 bg-white border rounded hover:bg-gray-100">
            🏦 Banco
          </button>

          <button onClick={() => router.push("/kyc")} className="p-4 bg-white border rounded hover:bg-gray-100">
            🪪 KYC
          </button>

        </div>

      </div>
    </div>
  )
}

/* 💳 CARD */

function MiniCard({ title, value, highlight }: any) {
  return (
    <div className={`p-4 rounded-xl border ${
      highlight ? "bg-green-50 border-green-400" : "bg-white"
    }`}>
      <p className="text-xs text-gray-500">{title}</p>
      <p className="text-lg font-bold">
        ${Number(value || 0).toLocaleString()}
      </p>
    </div>
  )
}