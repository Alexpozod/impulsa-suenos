'use client'

import { useEffect, useState } from "react"
import { supabase } from "@/src/lib/supabase"
import { useRouter } from "next/navigation"

export default function WithdrawPage() {

  const router = useRouter()

  const [user, setUser] = useState<any>(null)
  const [campaigns, setCampaigns] = useState<any[]>([])
  const [selectedCampaign, setSelectedCampaign] = useState<string>("")

  const [balances, setBalances] = useState<any>({})

  const [amount, setAmount] = useState("")
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState("")

  const [history, setHistory] = useState<any[]>([])

  /* =========================
     LOAD USER + CAMPAIGNS
  ========================= */
  useEffect(() => {
    const load = async () => {

      const { data } = await supabase.auth.getUser()

      if (!data.user) {
        router.push("/login")
        return
      }

      setUser(data.user)

      const email = data.user.email

      // 📌 CAMPAÑAS
      const { data: campaignsData } = await supabase
        .from("campaigns")
        .select("id, title")
        .eq("user_email", email)

      setCampaigns(campaignsData || [])

      if (campaignsData?.length) {
        setSelectedCampaign(campaignsData[0].id)
      }

      // 💰 BALANCES (API REAL)
      const balancesMap: any = {}

      for (const c of campaignsData || []) {

        try {
          const res = await fetch(
            `/api/campaign-wallet?campaign_id=${c.id}`
          )

          const data = await res.json()

          balancesMap[c.id] = data.balance || 0

        } catch {
          balancesMap[c.id] = 0
        }
      }

      setBalances(balancesMap)

      // 📊 HISTORIAL
      const res = await fetch("/api/payout/list")
      const all = await res.json()

      const userPayouts = all.filter(
        (p: any) => p.owner === email
      )

      setHistory(userPayouts)
    }

    load()
  }, [router])

  /* =========================
     REQUEST WITHDRAW
  ========================= */
  const handleWithdraw = async () => {

    setLoading(true)
    setMessage("")

    try {

      const { data: sessionData } = await supabase.auth.getSession()
      const token = sessionData?.session?.access_token

      const res = await fetch("/api/payout/request", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          campaign_id: selectedCampaign,
          amount: Number(amount)
        })
      })

      const data = await res.json()

      if (!res.ok) {
        setMessage(data.error || "Error en retiro")
        setLoading(false)
        return
      }

      setMessage("✅ Retiro solicitado correctamente")
      setAmount("")

      // 🔄 refrescar
      location.reload()

    } catch (err) {
      setMessage("Error inesperado")
    }

    setLoading(false)
  }

  /* =========================
     VALIDACIONES
  ========================= */
  const currentBalance = balances[selectedCampaign] || 0
  const insufficient = Number(amount) > currentBalance
  const disabled = loading || insufficient || currentBalance <= 0

  return (
    <div className="min-h-screen bg-gray-50 p-6">

      <div className="max-w-3xl mx-auto">

        <h1 className="text-3xl font-bold mb-6">
          💸 Retiros
        </h1>

        {/* FORM */}
        <div className="bg-white p-6 rounded-2xl border mb-6">

          <h2 className="font-semibold mb-4">
            Solicitar retiro
          </h2>

          {/* SELECT CAMPAÑA */}
          <select
            value={selectedCampaign}
            onChange={(e) => setSelectedCampaign(e.target.value)}
            className="w-full border p-3 rounded-lg mb-4"
          >
            {campaigns.map((c) => (
              <option key={c.id} value={c.id}>
                {c.title} — Disponible: $
                {Number(balances[c.id] || 0).toLocaleString()}
              </option>
            ))}
          </select>

          {/* MONTO */}
          <input
            type="number"
            placeholder="Monto a retirar"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full border p-3 rounded-lg mb-2"
          />

          {/* INFO BALANCE */}
          {selectedCampaign && (
            <p className="text-sm text-gray-500 mb-2">
              Disponible: $
              {Number(currentBalance).toLocaleString()}
            </p>
          )}

          {/* ERROR */}
          {insufficient && (
            <p className="text-sm text-red-500 mb-2">
              ⚠️ El monto supera el saldo disponible
            </p>
          )}

          <button
            onClick={handleWithdraw}
            disabled={disabled}
            className={`w-full py-3 rounded-lg text-white ${
              disabled ? "bg-gray-400" : "bg-black"
            }`}
          >
            {loading ? "Procesando..." : "Solicitar retiro"}
          </button>

          {message && (
            <p className="text-sm mt-3 text-center">
              {message}
            </p>
          )}

        </div>

        {/* HISTORIAL */}
        <div className="bg-white p-6 rounded-2xl border">

          <h2 className="font-semibold mb-4">
            Historial de retiros
          </h2>

          {history.length === 0 && (
            <p className="text-gray-500 text-sm">
              No tienes retiros aún
            </p>
          )}

          <div className="space-y-3">

            {history.map((p) => (
              <div
                key={p.id}
                className="p-3 border rounded-lg flex justify-between"
              >
                <div>
                  <p className="font-semibold">
                    ${Number(p.amount).toLocaleString()}
                  </p>

                  <p className="text-xs text-gray-500">
                    {p.campaign_title}
                  </p>

                  <p className="text-xs text-gray-400">
                    {new Date(p.created_at).toLocaleString()}
                  </p>
                </div>

                <span className={`text-xs px-2 py-1 rounded ${
                  p.status === 'approved'
                    ? 'bg-green-100 text-green-700'
                    : p.status === 'pending'
                    ? 'bg-yellow-100 text-yellow-700'
                    : 'bg-gray-100 text-gray-700'
                }`}>
                  {p.status}
                </span>

              </div>
            ))}

          </div>

        </div>

      </div>

    </div>
  )
}