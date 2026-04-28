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
      <div className="max-w-6xl mx-auto p-6">

        {/* ================= HEADER ================= */}
        <h1 className="text-3xl font-bold mb-2">Mi Cuenta</h1>
        <p className="text-gray-600 mb-6">{user?.email}</p>

        {/* ================= STATUS ================= */}
        <div className="mb-6 flex gap-3 flex-wrap">

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

        {/* ================= FINANZAS ================= */}
        {finance && (
          <div className="grid md:grid-cols-4 gap-4 mb-6">

            <MiniCard title="Disponible" value={finance.totals.balance} highlight />
            <MiniCard title="Recaudado" value={finance.totals.raised} />
            <MiniCard title="Retirado" value={finance.totals.withdrawn} />
            <MiniCard title="Pendiente" value={finance.totals.pending} />

          </div>
        )}

        {/* ================= ACCIONES ================= */}
        <div className="mb-8 flex flex-wrap gap-3">

          <button
            onClick={() => router.push("/create")}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            ➕ Crear campaña
          </button>

          {finance?.totals?.balance > 0 && bankLoaded && kycStatus === "approved" && (
            <button
              onClick={() => router.push("/account/withdraw")}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              💸 Retirar fondos
            </button>
          )}

        </div>

        {/* ================= ACCESOS (MEJORADOS) ================= */}
        <div className="grid md:grid-cols-2 gap-4 mb-10">

          <button
            onClick={() => router.push("/dashboard")}
            className="p-4 bg-white border rounded-xl hover:bg-gray-50 text-left"
          >
            <p className="font-semibold">📊 Dashboard</p>
            <p className="text-xs text-gray-500">Métricas y control</p>
          </button>

          <button
            onClick={() => router.push("/dashboard")}
            className="p-4 bg-white border rounded-xl hover:bg-gray-50 text-left"
          >
            <p className="font-semibold">📂 Gestionar campañas</p>
            <p className="text-xs text-gray-500">Administra tus campañas</p>
          </button>

          <button
            onClick={() => router.push("/account/bank")}
            className="p-4 bg-white border rounded-xl hover:bg-gray-50 text-left"
          >
            <p className="font-semibold">🏦 Banco</p>
            <p className="text-xs text-gray-500">Configura pagos</p>
          </button>

          <button
            onClick={() => router.push("/kyc")}
            className="p-4 bg-white border rounded-xl hover:bg-gray-50 text-left"
          >
            <p className="font-semibold">🪪 KYC</p>
            <p className="text-xs text-gray-500">Verificación de identidad</p>
          </button>

        </div>

        {/* ================= 🚀 DASHBOARD VIRAL ================= */}
        <div className="bg-white border rounded-2xl p-6">

          <h2 className="text-xl font-bold mb-4">
            🚀 Crecimiento & Viralidad
          </h2>

          <div className="grid md:grid-cols-4 gap-4">

            <div className="p-4 bg-gray-50 rounded-xl text-center">
              <p className="text-sm text-gray-500">🔗 Compartidos</p>
              <p className="text-xl font-bold">--</p>
            </div>

            <div className="p-4 bg-gray-50 rounded-xl text-center">
              <p className="text-sm text-gray-500">👥 Referidos</p>
              <p className="text-xl font-bold">--</p>
            </div>

            <div className="p-4 bg-gray-50 rounded-xl text-center">
              <p className="text-sm text-gray-500">💸 Donaciones por tráfico</p>
              <p className="text-xl font-bold">--</p>
            </div>

            <div className="p-4 bg-gray-50 rounded-xl text-center">
              <p className="text-sm text-gray-500">📈 Conversión</p>
              <p className="text-xl font-bold">--%</p>
            </div>

          </div>

          <p className="text-xs text-gray-400 mt-4">
            Pronto verás métricas reales de viralidad y crecimiento de tus campañas.
          </p>

        </div>

      </div>
    </div>
  )
}

/* ================= CARD ================= */

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