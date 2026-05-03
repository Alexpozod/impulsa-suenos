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
    <div className="max-w-6xl mx-auto p-6">

      {/* HEADER */}
      <div className="flex items-center gap-4 mb-6 bg-white p-4 rounded-xl border">

        <div className="w-14 h-14 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
          {profile?.avatar_url ? (
            <img src={profile.avatar_url} className="w-full h-full object-cover" />
          ) : (
            <span className="text-xl">👤</span>
          )}
        </div>

        <div>
          <h1 className="text-2xl font-bold">
            {profile?.full_name || user?.email?.split("@")[0] || "Mi Cuenta"}
          </h1>
          <p className="text-gray-500 text-sm">{user?.email}</p>
        </div>

      </div>

      {/* ALERTA */}
      {(needsKyc || needsBank) && (
        <div className="mb-6 p-4 rounded-xl border bg-yellow-50 border-yellow-300">
          <p className="font-semibold mb-2">⚠️ Completa tu cuenta</p>
          <ul className="text-sm space-y-1">
            {needsKyc && <li>• Verifica tu identidad (KYC)</li>}
            {needsBank && <li>• Agrega tu cuenta bancaria</li>}
          </ul>
        </div>
      )}

      {/* STATUS */}
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

      {/* ACCIONES CRÍTICAS */}
      <div className="mb-8 grid md:grid-cols-2 gap-4">

        <button
          onClick={() => router.push("/dashboard/kyc")}
          className="p-4 rounded-xl border bg-white hover:shadow-md transition text-left"
        >
          <p className="font-semibold">🪪 Verificación KYC</p>
          <p className="text-xs text-gray-500">
            {kycStatus === "approved" ? "Completado" : "Requerido para retirar"}
          </p>
        </button>

        <button
          onClick={() => router.push("/dashboard/account/bank")}
          className="p-4 rounded-xl border bg-white hover:shadow-md transition text-left"
        >
          <p className="font-semibold">🏦 Cuenta bancaria</p>
          <p className="text-xs text-gray-500">
            {bankLoaded ? "Configurada" : "Agrega tu cuenta"}
          </p>
        </button>

      </div>

      {/* FINANZAS */}
      <div className="mb-6 text-sm text-gray-500">
        Consulta tus ingresos y retiros en la sección Finanzas.
      </div>

      {/* BOTONES */}
      <div className="mb-8 flex flex-wrap gap-3">

        <button
          onClick={() => router.push("/create")}
          className="px-5 py-2.5 bg-green-600 text-white rounded-xl hover:bg-green-700 font-medium"
        >
          ➕ Crear campaña
        </button>

        {!needsKyc && !needsBank && finance?.totals?.balance > 0 && (
          <button
            onClick={() => router.push("/dashboard/account/withdraw")}
            className="px-5 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 font-medium"
          >
            💸 Retirar fondos
          </button>
        )}

      </div>

      {/* ⚙️ CONFIGURACIÓN */}
<div className="bg-white border rounded-2xl p-6 mb-8 shadow-sm">
  <h2 className="text-xl font-bold mb-1">⚙️ Configuración de cuenta</h2>
  <p className="text-sm text-gray-500 mb-6">
    Actualiza tu información personal y foto de perfil
  </p>

  <div className="grid md:grid-cols-3 gap-6">

    {/* AVATAR */}
    <div className="flex flex-col items-center gap-3">
      <div className="w-24 h-24 rounded-full bg-gray-200 overflow-hidden flex items-center justify-center border">
        {profile?.avatar_url ? (
          <img src={profile.avatar_url} className="w-full h-full object-cover" />
        ) : (
          <span className="text-3xl">👤</span>
        )}
      </div>

      <label className="cursor-pointer mt-2 w-full">

  <div className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm text-gray-700 text-center transition">
    📸 Cambiar foto de perfil
  </div>

  <input
    type="file"
    accept="image/*"
    className="hidden"
    onChange={async (e) => {
      const file = e.target.files?.[0]
      if (!file || !user) return

      try {
        const fileExt = file.name.split('.').pop()
        const filePath = `${user.id}/avatar.${fileExt}`

        const { error: uploadError } = await supabase.storage
          .from("avatars")
          .upload(filePath, file, {
            upsert: true,
            contentType: file.type
          })

        if (uploadError) {
          alert("Error subiendo imagen")
          return
        }

        const { data } = supabase.storage
          .from("avatars")
          .getPublicUrl(filePath)

        const publicUrl = `${data.publicUrl}?t=${Date.now()}`

        setProfile((prev: any) => ({
          ...(prev || {}),
          avatar_url: publicUrl
        }))

        await supabase
          .from("profiles")
          .upsert({
            id: user.id,
            avatar_url: publicUrl
          }, { onConflict: "id" })

      } catch (err) {
        console.error(err)
        alert("Error subiendo imagen")
      }
    }}
  />

</label>

      <p className="text-xs text-gray-400 text-center">
        JPG o PNG. Máx 2MB
      </p>
    </div>

    {/* DATOS */}
    <div className="md:col-span-2 space-y-4">

      <div>
        <label className="text-xs text-gray-500">Nombre completo</label>
        <input
          type="text"
          value={profile?.full_name ?? ""}
          onChange={(e) =>
            setProfile((prev: any) => ({
              ...(prev || {}),
              full_name: e.target.value
            }))
          }
          className="w-full mt-1 p-3 border rounded-xl focus:ring-2 focus:ring-green-500 outline-none transition"
        />
      </div>

      <div>
        <label className="text-xs text-gray-500">Teléfono</label>
        <input
          type="text"
          value={profile?.phone ?? ""}
          onChange={(e) =>
            setProfile((prev: any) => ({
              ...(prev || {}),
              phone: e.target.value
            }))
          }
          className="w-full mt-1 p-3 border rounded-xl focus:ring-2 focus:ring-green-500 outline-none transition"
        />
      </div>

      {/* BOTONES */}
      <div className="flex items-center gap-4 pt-2">

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

            if (error) {
              alert("Error guardando")
            } else {
              alert("Perfil actualizado correctamente ✅")
            }
          }}
          className="px-6 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 font-medium shadow-sm"
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

            const { error } = await supabase.auth.updateUser({
              password: newPassword
            })

            if (error) {
              alert("Error cambiando contraseña")
            } else {
              alert("Contraseña actualizada")
            }
          }}
          className="text-sm text-blue-600 hover:underline"
        >
          Cambiar contraseña
        </button>

      </div>

    </div>

  </div>
</div>

      {/* ANALYTICS */}
      <div className="bg-white border rounded-2xl p-6 space-y-6">

        <h2 className="text-xl font-bold">
          🚀 Crecimiento & Viralidad
        </h2>

        <div className="grid md:grid-cols-4 gap-4">
          <StatCard label="🔗 Referidos" value={analytics?.refs ?? 0} />
          <StatCard label="👥 Donaciones" value={analytics?.total_donations ?? 0} />
          <StatCard label="📈 Conversión" value={`${analytics?.conversion ?? 0}%`} />
          <StatCard label="💰 Generado" value={`$${Number(analytics?.total_amount || 0).toLocaleString()}`} />
        </div>

        <div>
          <h3 className="text-sm font-semibold text-gray-600 mb-2">
            🌐 Fuentes de tráfico
          </h3>

          <div className="space-y-2">
            {analytics?.sources
              ? Object.entries(analytics.sources).map(([key, val]: any) => (
                  <div
                    key={key}
                    className="flex justify-between items-center bg-gray-50 px-4 py-2 rounded-lg"
                  >
                    <span className="text-sm font-medium capitalize">
                      {key}
                    </span>

                    <div className="text-right text-sm">
                      <p className="font-bold">
                        ${Number(val.amount || 0).toLocaleString()}
                      </p>
                      <p className="text-gray-500 text-xs">
                        {val.count} donaciones
                      </p>
                    </div>
                  </div>
                ))
              : <p className="text-gray-400 text-sm">Sin datos aún</p>
            }
          </div>
        </div>

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