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

        <h1 className="text-3xl font-bold mb-2">Mi Cuenta</h1>
        <p className="text-gray-600 mb-6">{user?.email}</p>

        {/* 🔴 ACTIVACIÓN CUENTA */}
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

        {/* 🔥 ACCIONES CRÍTICAS */}
        <div className="mb-8 grid md:grid-cols-2 gap-4">

          <button
            onClick={() => router.push("/dashboard/kyc")}
            className="p-4 rounded-xl border bg-white hover:bg-gray-50 text-left"
          >
            <p className="font-semibold">🪪 Verificación KYC</p>
            <p className="text-xs text-gray-500">
              {kycStatus === "approved" ? "Completado" : "Requerido para retirar"}
            </p>
          </button>

          <button
            onClick={() => router.push("/account/bank")}
            className="p-4 rounded-xl border bg-white hover:bg-gray-50 text-left"
          >
            <p className="font-semibold">🏦 Cuenta bancaria</p>
            <p className="text-xs text-gray-500">
              {bankLoaded ? "Configurada" : "Agrega tu cuenta"}
            </p>
          </button>

        </div>

        {/* FINANZAS */}
        {finance && (
          <div className="grid md:grid-cols-4 gap-4 mb-6">
            <MiniCard title="Disponible" value={finance.totals.balance} highlight />
            <MiniCard title="Recaudado" value={finance.totals.raised} />
            <MiniCard title="Retirado" value={finance.totals.withdrawn} />
            <MiniCard title="Pendiente" value={finance.totals.pending} />
          </div>
        )}

        {/* ACCIONES */}
        <div className="mb-8 flex flex-wrap gap-3">

          <button
            onClick={() => router.push("/create")}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            ➕ Crear campaña
          </button>

          {!needsKyc && !needsBank && finance?.totals?.balance > 0 && (
            <button
              onClick={() => router.push("/account/withdraw")}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              💸 Retirar fondos
            </button>
          )}

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

/* ================= UI ================= */

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