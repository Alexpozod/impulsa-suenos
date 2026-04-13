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

        <div className="grid md:grid-cols-2 gap-6">

          <button onClick={() => router.push("/dashboard")} className="p-4 bg-white border rounded">
            📊 Dashboard
          </button>

          <button onClick={() => router.push("/create")} className="p-4 bg-white border rounded">
            ➕ Crear campaña
          </button>

          <button onClick={() => router.push("/account/bank")} className="p-4 bg-white border rounded">
            🏦 Banco
          </button>

          <button onClick={() => router.push("/kyc")} className="p-4 bg-white border rounded">
            🪪 KYC
          </button>

        </div>

      </div>
    </div>
  )
}