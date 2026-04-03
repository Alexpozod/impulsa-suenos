"use client"

import { useEffect, useState } from "react"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default function CampaignPage({ params }: any) {

  const [campaign, setCampaign] = useState<any>(null)

  const [userEmail, setUserEmail] = useState<string | null>(null)
  const [guestEmail, setGuestEmail] = useState("")

  const [amount, setAmount] = useState(5000)
  const [loading, setLoading] = useState(false)

  const [userTickets, setUserTickets] = useState<string[]>([])

  useEffect(() => {
    init()
  }, [params.id])

  const init = async () => {
    try {
      // campaña
      const res = await fetch(`/api/campaign/${params.id}`)
      const data = await res.json()
      setCampaign(data)

      // usuario
      const { data: { user } } = await supabase.auth.getUser()

      if (user?.email) {
        setUserEmail(user.email)

        // tickets usuario
        const { data: tickets } = await supabase
          .from("tickets")
          .select("ticket_number")
          .eq("campaign_id", params.id)
          .eq("user_email", user.email)

        setUserTickets(tickets?.map(t => t.ticket_number) || [])
      }

    } catch (error) {
      console.error(error)
    }
  }

  const handleDonate = async () => {

    const emailToUse = userEmail || guestEmail

    if (!emailToUse) {
      alert("Ingresa tu email")
      return
    }

    if (!amount || amount < 100) {
      alert("Monto mínimo: 100")
      return
    }

    try {
      setLoading(true)

      const res = await fetch("/api/create-payment", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          amount,
          campaign_id: campaign.id,
          user_email: emailToUse,
        }),
      })

      const data = await res.json()

      if (data.url) {
        window.location.href = data.url
      } else {
        alert("Error iniciando pago")
      }

    } catch (error) {
      console.error(error)
      alert("Error en el pago")
    } finally {
      setLoading(false)
    }
  }

  if (!campaign) {
    return <div className="p-6">Cargando campaña...</div>
  }

  const progress =
    campaign.goal_amount > 0
      ? (campaign.current_amount / campaign.goal_amount) * 100
      : 0

  // 🎟️ cálculo visual tickets
  let estimatedTickets = 0

  if (campaign.mode === "tickets") {
    estimatedTickets = Math.floor(amount / (campaign.ticket_price || 1))
  } else if (campaign.has_raffle) {
    const min = campaign.raffle_min_amount || 0
    const unit = campaign.raffle_unit_amount || 0

    if (amount >= min) {
      estimatedTickets = unit > 0 ? Math.floor(amount / unit) : 1
    }
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* IZQUIERDA */}
        <div className="lg:col-span-2 space-y-6">

          <img
            src={campaign.image_url}
            alt="campaign"
            className="w-full rounded-xl object-cover"
          />

          <h1 className="text-3xl font-bold">
            {campaign.title}
          </h1>

          <p className="text-gray-500">
            Por {campaign.user_email}
          </p>

          {/* 🎁 INCENTIVO */}
          {campaign.has_raffle && (
            <div className="bg-green-100 border border-green-300 p-4 rounded-xl">

              <p className="font-semibold text-green-800">
                🎁 Esta campaña incluye un sorteo
              </p>

              <p className="text-sm text-green-700 mt-1">
                Participa desde ${campaign.raffle_min_amount}
              </p>

            </div>
          )}

          {/* 📄 DESCRIPCIÓN */}
          <div className="text-gray-700 leading-relaxed whitespace-pre-line">
            {campaign.description}
          </div>

        </div>

        {/* DERECHA */}
        <div className="sticky top-20 h-fit space-y-5">

          {/* PROGRESO */}
          <div className="bg-white border rounded-xl p-5 shadow-sm">

            <div className="text-2xl font-bold">
              ${campaign.current_amount}
            </div>

            <div className="text-sm text-gray-500">
              de ${campaign.goal_amount}
            </div>

            <div className="w-full bg-gray-200 h-2 rounded mt-2">
              <div
                className="bg-green-500 h-2 rounded"
                style={{ width: `${progress}%` }}
              />
            </div>

            <p className="text-sm text-gray-500 mt-2">
              {Math.floor(progress)}% completado
            </p>

          </div>

          {/* 🎟️ TICKETS USUARIO */}
          {userTickets.length > 0 && (
            <div className="bg-blue-50 border border-blue-200 p-4 rounded-xl">

              <p className="text-sm">
                🎟️ Tienes <strong>{userTickets.length}</strong> tickets
              </p>

            </div>
          )}

          {/* DONACIÓN */}
          <div className="bg-white border rounded-xl p-5 shadow-sm space-y-4">

            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(Number(e.target.value))}
              className="w-full border rounded-lg px-3 py-2"
            />

            {!userEmail && (
              <input
                type="email"
                placeholder="Tu email"
                value={guestEmail}
                onChange={(e) => setGuestEmail(e.target.value)}
                className="w-full border rounded-lg px-3 py-2"
              />
            )}

            {/* 🎯 INFO DINÁMICA */}
            {estimatedTickets > 0 && (
              <p className="text-sm text-gray-600">
                🎟️ Recibirás {estimatedTickets} tickets
              </p>
            )}

            {campaign.has_raffle && amount < campaign.raffle_min_amount && (
              <p className="text-sm text-red-500">
                Dona al menos ${campaign.raffle_min_amount} para participar
              </p>
            )}

            <button
              onClick={handleDonate}
              disabled={loading}
              className="w-full bg-green-500 hover:bg-green-600 text-white py-3 rounded-xl font-semibold"
            >
              {loading ? "Redirigiendo..." : "Donar ahora"}
            </button>

            <p className="text-xs text-gray-500 text-center">
              🔒 Pago seguro con MercadoPago
            </p>

          </div>

        </div>

      </div>

    </div>
  )
}