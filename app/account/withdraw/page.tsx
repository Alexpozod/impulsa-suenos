'use client'

import { useEffect, useState } from "react"
import { supabase } from "@/src/lib/supabase"
import { useRouter } from "next/navigation"

export default function WithdrawPage() {

  const router = useRouter()

  const [user, setUser] = useState<any>(null)
  const [campaigns, setCampaigns] = useState<any[]>([])
  const [selectedCampaign, setSelectedCampaign] = useState<string>("")

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

      // CAMPAÑAS DEL USUARIO
      const { data: campaignsData } = await supabase
        .from("campaigns")
        .select("id, title")
        .eq("user_email", email)

      setCampaigns(campaignsData || [])

      if (campaignsData?.length) {
        setSelectedCampaign(campaignsData[0].id)
      }

      // HISTORIAL (API EXISTENTE)
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

      setMessage("✅ Retiro solicitado")
      setAmount("")

      location.reload()

    } catch (err) {
      setMessage("Error inesperado")
    }

    setLoading(false)
  }

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
                {c.title}
              </option>
            ))}
          </select>

          <input
            type="number"
            placeholder="Monto"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full border p-3 rounded-lg mb-4"
          />

          <button
            onClick={handleWithdraw}
            disabled={loading}
            className="w-full bg-black text-white py-3 rounded-lg"
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
            Historial
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
                </div>

                <span className="text-xs px-2 py-1 rounded bg-gray-100">
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