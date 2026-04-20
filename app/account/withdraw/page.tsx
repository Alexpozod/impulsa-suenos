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

  useEffect(() => {
    const load = async () => {

      const { data } = await supabase.auth.getUser()

      if (!data.user) {
        router.push("/login")
        return
      }

      setUser(data.user)

      const email = data.user.email

      const { data: campaignsData } = await supabase
        .from("campaigns")
        .select("id, title")
        .eq("user_email", email)

      setCampaigns(campaignsData || [])

      if (campaignsData?.length) {
        setSelectedCampaign(campaignsData[0].id)
      }

      const balancesMap: any = {}

      /* =========================
         🔥 FIX REAL AQUÍ (IMPORTANTE)
         Calculamos desde ledger correctamente
      ========================= */
      try {
        const res = await fetch("/api/ledger")
        const ledger = await res.json()

        for (const c of campaignsData || []) {

          const campaignLedger = (ledger || []).filter((tx: any) =>
            tx.campaign_id === c.id &&
            tx.user_email === email && // 🔥 SOLO USUARIO
            tx.status === "confirmed"
          )

          const available = campaignLedger.reduce(
            (acc: number, tx: any) => acc + Number(tx.amount || 0),
            0
          )

          const pending = (ledger || [])
            .filter((tx: any) =>
              tx.campaign_id === c.id &&
              tx.user_email === email &&
              tx.type === "withdraw_pending"
            )
            .reduce((acc: number, tx: any) => acc + Math.abs(Number(tx.amount || 0)), 0)

          balancesMap[c.id] = {
            available,
            pending
          }
        }

      } catch (err) {
        console.error("Error calculando balances:", err)

        for (const c of campaignsData || []) {
          balancesMap[c.id] = { available: 0, pending: 0 }
        }
      }

      setBalances(balancesMap)

      /* =========================
         HISTORIAL
      ========================= */
      const { data: sessionData } = await supabase.auth.getSession()
      const token = sessionData?.session?.access_token

      const res = await fetch("/api/payout/list", {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })

      const all = await res.json()
      setHistory(all || [])
    }

    load()
  }, [router])

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
      location.reload()

    } catch {
      setMessage("Error inesperado")
    }

    setLoading(false)
  }

  const currentBalance = balances[selectedCampaign]?.available || 0
  const pendingBalance = balances[selectedCampaign]?.pending || 0

  const insufficient = Number(amount) > currentBalance
  const disabled = loading || insufficient || currentBalance <= 0

  return (
    <div className="min-h-screen bg-gray-50 p-6">

      <div className="max-w-3xl mx-auto">

        <h1 className="text-3xl font-bold mb-6">
          💸 Retiros
        </h1>

        <div className="bg-white p-6 rounded-2xl border mb-6">

          <h2 className="font-semibold mb-4">
            Solicitar retiro
          </h2>

          <select
            value={selectedCampaign}
            onChange={(e) => setSelectedCampaign(e.target.value)}
            className="w-full border p-3 rounded-lg mb-4"
          >
            {campaigns.map((c) => (
              <option key={c.id} value={c.id}>
                {c.title} — Disponible: $
                {Number(balances[c.id]?.available || 0).toLocaleString()}
              </option>
            ))}
          </select>

          <input
            type="number"
            placeholder="Monto a retirar"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full border p-3 rounded-lg mb-2"
          />

          <p className="text-sm text-gray-500">
            Disponible: ${Number(currentBalance).toLocaleString()}
          </p>

          {pendingBalance > 0 && (
            <p className="text-xs text-yellow-600 mb-2">
              🔒 Retenido: ${Number(pendingBalance).toLocaleString()}
            </p>
          )}

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
                  p.status === 'paid'
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