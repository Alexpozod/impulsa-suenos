'use client'

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/src/lib/supabase"
import { useFinancialDashboard } from "@/app/hooks/useFinancialDashboard"

export default function AccountPage() {

  const router = useRouter()

  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)

  const [kycStatus, setKycStatus] = useState<string | null>(null)
  const [bankLoaded, setBankLoaded] = useState(false)

  const { data: finance } = useFinancialDashboard()

  const [analytics, setAnalytics] = useState<any>(null)

  useEffect(() => {
    const load = async () => {

      try {
        const { data } = await supabase.auth.getUser()

        if (!data.user) {
          router.push('/login')
          return
        }

        const currentUser = data.user
        setUser(currentUser)

        const email = currentUser.email!.toLowerCase()

        // 🔥 PERFIL SEGURO
        const { data: profileData, error: profileError } = await supabase
          .from("profiles")
          .select("full_name, avatar_url, phone")
          .eq("id", currentUser.id)
          .maybeSingle()

        if (profileError) {
          console.error("PROFILE ERROR:", profileError)
        }

        setProfile(profileData || {
          full_name: "",
          phone: "",
          avatar_url: null
        })

        // KYC
        const { data: kyc } = await supabase
          .from("kyc")
          .select("status")
          .eq("user_email", email)
          .maybeSingle()

        setKycStatus(kyc?.status || null)

        // Banco
        const { data: bankAccounts } = await supabase
          .from("bank_accounts")
          .select("id")
          .eq("user_email", email)
          .limit(1)

        setBankLoaded((bankAccounts?.length || 0) > 0)

        const { data: campaigns } = await supabase
          .from("campaigns")
          .select("id")
          .eq("user_email", email)
          .eq("status", "active")

        if (!campaigns || campaigns.length === 0) {
          setAnalytics(null)
          setLoading(false)
          return
        }

        const results = await Promise.all(
          campaigns.map(async (c: any) => {
            const res = await fetch(`/api/campaign-analytics?campaign_id=${c.id}`)
            if (!res.ok) return null
            return res.json()
          })
        )

        const valid = results.filter(Boolean)

        let total_donations = 0
        let total_amount = 0
        let refs = 0
        let conversionSum = 0
        let sources: any = {}

        valid.forEach((a: any) => {

          total_donations += a.total_donations || 0
          total_amount += a.total_amount || 0
          refs += a.refs || 0
          conversionSum += Number(a.conversion || 0)

          if (a.sources) {
            Object.entries(a.sources).forEach(([key, val]: any) => {
              if (!sources[key]) {
                sources[key] = { count: 0, amount: 0 }
              }
              sources[key].count += val.count || 0
              sources[key].amount += val.amount || 0
            })
          }

        })

        setAnalytics({
          total_donations,
          total_amount,
          refs,
          conversion: valid.length
            ? Number((conversionSum / valid.length).toFixed(2))
            : 0,
          sources
        })

      } catch (err) {
        console.error("LOAD ERROR:", err)
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [router])

  if (loading) return <div className="p-6">Cargando...</div>

  const needsKyc = kycStatus !== "approved"
  const needsBank = !bankLoaded

  return (
  <div className="min-h-screen bg-gray-50">
    <div className="max-w-5xl mx-auto p-6 space-y-6">

      {/* HEADER */}
      <div className="bg-white p-6 rounded-2xl shadow-sm flex items-center gap-4">
        <div className="w-16 h-16 rounded-full bg-gray-200 overflow-hidden flex items-center justify-center">
          {profile?.avatar_url ? (
            <img src={profile.avatar_url} className="w-full h-full object-cover" />
          ) : (
            <span className="text-2xl">👤</span>
          )}
        </div>

        <div className="flex-1">
          <h1 className="text-2xl font-bold">
            {profile?.full_name || user?.email?.split("@")[0]}
          </h1>
          <p className="text-gray-500 text-sm">{user?.email}</p>

          <div className="flex gap-2 mt-2">
            <span className={`px-3 py-1 rounded-full text-xs font-medium ${
              kycStatus === 'approved'
                ? 'bg-green-100 text-green-700'
                : 'bg-red-100 text-red-700'
            }`}>
              KYC {kycStatus === "approved" ? "verificado" : "pendiente"}
            </span>

            <span className={`px-3 py-1 rounded-full text-xs font-medium ${
              bankLoaded
                ? 'bg-green-100 text-green-700'
                : 'bg-red-100 text-red-700'
            }`}>
              Banco {bankLoaded ? "conectado" : "pendiente"}
            </span>
          </div>
        </div>
      </div>

      {/* ACCIONES */}
      <div className="grid md:grid-cols-2 gap-4">
        <button
          onClick={() => router.push("/dashboard/kyc")}
          className="bg-white p-5 rounded-2xl shadow-sm hover:shadow-md transition text-left"
        >
          <p className="font-semibold text-lg">🪪 Verificación</p>
          <p className="text-sm text-gray-500">
            {kycStatus === "approved" ? "Completado" : "Necesario para retirar"}
          </p>
        </button>

        <button
          onClick={() => router.push("/dashboard/account/bank")}
          className="bg-white p-5 rounded-2xl shadow-sm hover:shadow-md transition text-left"
        >
          <p className="font-semibold text-lg">🏦 Cuenta bancaria</p>
          <p className="text-sm text-gray-500">
            {bankLoaded ? "Configurada" : "Agrega tu cuenta"}
          </p>
        </button>
      </div>

      {/* CTA */}
      <div className="flex gap-3 flex-wrap">
        <button
          onClick={() => router.push("/create")}
          className="px-5 py-3 bg-green-600 text-white rounded-xl font-medium hover:bg-green-700"
        >
          ➕ Crear campaña
        </button>

        {!needsKyc && !needsBank && finance?.totals?.balance > 0 && (
          <button
            onClick={() => router.push("/dashboard/account/withdraw")}
            className="px-5 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700"
          >
            💸 Retirar fondos
          </button>
        )}
      </div>

      {/* CONFIGURACIÓN */}
      <div className="bg-white p-6 rounded-2xl shadow-sm space-y-4">
        <h2 className="text-lg font-bold">Configuración de cuenta</h2>

        <div className="grid md:grid-cols-2 gap-4">

          <input
            type="text"
            placeholder="Nombre completo"
            value={profile?.full_name ?? ""}
            onChange={(e) =>
              setProfile((prev: any) => ({
                ...(prev || {}),
                full_name: e.target.value
              }))
            }
            className="p-3 border rounded-xl focus:ring-2 focus:ring-green-500 outline-none"
          />

          <input
            type="text"
            placeholder="Teléfono"
            value={profile?.phone ?? ""}
            onChange={(e) =>
              setProfile((prev: any) => ({
                ...(prev || {}),
                phone: e.target.value
              }))
            }
            className="p-3 border rounded-xl focus:ring-2 focus:ring-green-500 outline-none"
          />

        </div>

        <input
          type="file"
          className="text-sm"
          onChange={async (e) => {
            const file = e.target.files?.[0]
            if (!file || !user) return

            const filePath = `${user.id}/${Date.now()}_${file.name}`

            const { error } = await supabase.storage
              .from("avatars")
              .upload(filePath, file, { upsert: true })

            if (error) {
              alert("Error subiendo imagen")
              return
            }

            const { data } = supabase.storage
              .from("avatars")
              .getPublicUrl(filePath)

            setProfile((prev: any) => ({
              ...(prev || {}),
              avatar_url: data.publicUrl
            }))
          }}
        />

        <button
          onClick={async () => {
            if (!user) return

            const { error } = await supabase
              .from("profiles")
              .upsert({
                id: user.id,
                full_name: profile?.full_name || "",
                phone: profile?.phone || "",
                avatar_url: profile?.avatar_url || null
              }, { onConflict: "id" })

            if (error) alert("Error guardando")
            else alert("Perfil actualizado ✅")
          }}
          className="bg-green-600 text-white px-5 py-3 rounded-xl hover:bg-green-700"
        >
          Guardar cambios
        </button>

        <button
          onClick={async () => {
            const newPassword = window.prompt("Nueva contraseña (mínimo 6 caracteres)")
            if (!newPassword || newPassword.length < 6) {
              alert("Contraseña inválida")
              return
            }

            await supabase.auth.updateUser({ password: newPassword })
            alert("Contraseña actualizada")
          }}
          className="text-sm text-blue-600 hover:underline"
        >
          Cambiar contraseña
        </button>
      </div>

    </div>
  </div>
)
}

/* UI */

function StatCard({ label, value }: any) {
  return (
    <div className="p-4 bg-gray-50 rounded-xl text-center">
      <p className="text-sm text-gray-500">{label}</p>
      <p className="text-xl font-bold">
        {value}
      </p>
    </div>
  )
}