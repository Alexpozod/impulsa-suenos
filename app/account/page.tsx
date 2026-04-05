'use client'

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/src/lib/supabase"

export default function AccountPage() {

  const router = useRouter()

  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)

  const [kycStatus, setKycStatus] = useState<string | null>(null)
  const [bankLoaded, setBankLoaded] = useState(false)

  /* =========================
     🔐 LOAD USER + DATA
  ========================= */
  useEffect(() => {
    const load = async () => {

      const { data } = await supabase.auth.getUser()

      if (!data.user) {
        router.push('/login')
        return
      }

      setUser(data.user)

      const email = data.user.email

      // KYC
      const { data: kyc } = await supabase
        .from("kyc")
        .select("status")
        .eq("user_email", email)
        .maybeSingle()

      setKycStatus(kyc?.status || null)

      // BANK
      const { data: bank } = await supabase
        .from("bank_accounts")
        .select("id")
        .eq("user_email", email)
        .maybeSingle()

      setBankLoaded(!!bank)

      setLoading(false)
    }

    load()
  }, [router])

  if (loading) {
    return <div className="p-6">Cargando...</div>
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto p-6">

        {/* HEADER */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Mi Cuenta</h1>

          <p className="text-gray-600 mt-2">
            {user?.email}
          </p>
        </div>

        {/* ESTADO GLOBAL */}
        <div className="mb-6 flex flex-wrap gap-3">

          <span className={`px-3 py-1 rounded-full text-sm ${
            kycStatus === 'approved'
              ? 'bg-green-100 text-green-700'
              : kycStatus === 'pending'
              ? 'bg-yellow-100 text-yellow-700'
              : 'bg-red-100 text-red-700'
          }`}>
            KYC: {kycStatus || 'no iniciado'}
          </span>

          <span className={`px-3 py-1 rounded-full text-sm ${
            bankLoaded
              ? 'bg-green-100 text-green-700'
              : 'bg-red-100 text-red-700'
          }`}>
            Banco: {bankLoaded ? 'configurado' : 'pendiente'}
          </span>

        </div>

        {/* GRID */}
        <div className="grid md:grid-cols-2 gap-6">

          {/* PERFIL */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border">
            <h2 className="text-xl font-semibold mb-4">👤 Perfil</h2>

            <div className="flex flex-col gap-3">

              <button
                onClick={() => router.push("/dashboard")}
                className="p-3 border rounded-xl hover:bg-gray-50 text-left"
              >
                📊 Ver mi dashboard
              </button>

              <button
                onClick={() => router.push("/my-tickets")}
                className="p-3 border rounded-xl hover:bg-gray-50 text-left"
              >
                🎟️ Mis tickets
              </button>

            </div>
          </div>

          {/* SEGURIDAD */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border">
            <h2 className="text-xl font-semibold mb-4">🔐 Seguridad</h2>

            <div className="flex flex-col gap-3">

              <button
                onClick={() => router.push("/kyc")}
                className="p-3 border rounded-xl hover:bg-gray-50 text-left"
              >
                🪪 KYC ({kycStatus || 'no iniciado'})
              </button>

              <button
                onClick={() => router.push("/recover")}
                className="p-3 border rounded-xl hover:bg-gray-50 text-left"
              >
                🔑 Cambiar contraseña
              </button>

            </div>
          </div>

          {/* FINANZAS */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border">
            <h2 className="text-xl font-semibold mb-4">💰 Finanzas</h2>

            <div className="flex flex-col gap-3">

              <button
                onClick={() => router.push("/account/bank")}
                className="p-3 border rounded-xl hover:bg-gray-50 text-left"
              >
                🏦 Datos bancarios ({bankLoaded ? 'OK' : 'pendiente'})
              </button>

              <button
                onClick={() => alert("Próximamente: historial financiero")}
                className="p-3 border rounded-xl hover:bg-gray-50 text-left"
              >
                📊 Movimientos
              </button>

              <button
                onClick={() => alert("Próximamente: retiros")}
                className="p-3 border rounded-xl hover:bg-gray-50 text-left"
              >
                💸 Retiros
              </button>

            </div>
          </div>

          {/* CAMPAÑAS */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border">
            <h2 className="text-xl font-semibold mb-4">🚀 Campañas</h2>

            <div className="flex flex-col gap-3">

              <button
                onClick={() => router.push("/create")}
                className="p-3 border rounded-xl hover:bg-gray-50 text-left"
              >
                ➕ Crear campaña
              </button>

              <button
                onClick={() => router.push("/dashboard")}
                className="p-3 border rounded-xl hover:bg-gray-50 text-left"
              >
                📊 Mis campañas
              </button>

            </div>
          </div>

        </div>

        <div className="mt-10 text-sm text-gray-500 text-center">
          Plataforma segura • ImpulsaSueños
        </div>

      </div>
    </div>
  )
}