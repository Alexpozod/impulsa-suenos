"use client"

import { useEffect, useState } from "react"
import { createClient } from "@supabase/supabase-js"
import { getSignedUrl } from "@/lib/storage/getSignedUrl"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default function CampaignPage({ params }: any) {
  const [campaign, setCampaign] = useState<any>(null)
  const [imageUrl, setImageUrl] = useState<string | null>(null)

  // 👤 USER
  const [userEmail, setUserEmail] = useState<string | null>(null)
  const [guestEmail, setGuestEmail] = useState("")

  // 💰 DONACIÓN
  const [selectedAmount, setSelectedAmount] = useState(5000)
  const [customAmount, setCustomAmount] = useState("")
  const [loading, setLoading] = useState(false)

  // 🔥 DONACIONES EN VIVO
  const [donations, setDonations] = useState<any[]>([])
  const [lastDonation, setLastDonation] = useState<any>(null)

  useEffect(() => {
    const init = async () => {
      try {
        // campaña
        const res = await fetch(`/api/campaign/${params.id}`)
        const data = await res.json()
        setCampaign(data)

        // 🔐 signed URL imagen
        if (data?.image_url) {
          const signed = await getSignedUrl("campaign-images", data.image_url)
          setImageUrl(signed)
        }

        // usuario
        const {
          data: { user },
        } = await supabase.auth.getUser()

        if (user?.email) {
          setUserEmail(user.email)
        }

      } catch (error) {
        console.error(error)
      }
    }

    init()
  }, [params.id])

  // 🔄 DONACIONES EN VIVO
  useEffect(() => {
    const fetchDonations = async () => {
      try {
        const res = await fetch(
          `/api/donations-live?campaign_id=${params.id}`
        )
        const data = await res.json()

        if (data.length > 0) {
          if (
            donations.length > 0 &&
            data[0].created_at !== donations[0].created_at
          ) {
            setLastDonation(data[0])
          }

          setDonations(data)
        }
      } catch (e) {
        console.error(e)
      }
    }

    fetchDonations()
    const interval = setInterval(fetchDonations, 5000)

    return () => clearInterval(interval)
  }, [params.id, donations])

  if (!campaign) {
    return <div className="p-6">Cargando campaña...</div>
  }

  const progress =
    campaign.goal_amount > 0
      ? (campaign.current_amount / campaign.goal_amount) * 100
      : 0

  const handleDonate = async () => {
    const finalAmount = customAmount
      ? Number(customAmount)
      : selectedAmount

    const emailToUse = userEmail || guestEmail

    if (!emailToUse) {
      alert("Ingresa tu email")
      return
    }

    if (!finalAmount || finalAmount < 100) {
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
          amount: finalAmount,
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

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* IZQUIERDA */}
        <div className="lg:col-span-2 space-y-6">

          {/* 🔐 IMAGEN SEGURA */}
          {imageUrl ? (
            <img
              src={imageUrl}
              alt="campaign"
              className="w-full rounded-xl object-cover"
            />
          ) : (
            <div className="w-full h-64 bg-gray-200 rounded-xl flex items-center justify-center">
              Cargando imagen...
            </div>
          )}

          <h1 className="text-3xl font-bold">
            {campaign.title}
          </h1>

          <p className="text-gray-500">
            Por {campaign.user_email}
          </p>

          <div className="inline-block bg-blue-100 text-blue-600 px-3 py-1 rounded-full text-sm">
            Donación protegida
          </div>

          <div className="text-gray-700 leading-relaxed whitespace-pre-line">
            {campaign.description}
          </div>

        </div>

        {/* DERECHA */}
        <div className="sticky top-20 h-fit">

          <div className="bg-white border rounded-xl p-5 shadow-sm space-y-5">

            {/* PROGRESO */}
            <div>
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

            {/* MONTOS */}
            <div className="grid grid-cols-3 gap-2">
              {[1000, 5000, 10000].map((amount) => (
                <button
                  key={amount}
                  onClick={() => {
                    setSelectedAmount(amount)
                    setCustomAmount("")
                  }}
                  className={`py-2 rounded-lg border text-sm font-medium transition
                  ${
                    selectedAmount === amount && !customAmount
                      ? "bg-green-500 text-white border-green-500"
                      : "hover:bg-gray-100"
                  }`}
                >
                  ${amount}
                </button>
              ))}
            </div>

            {/* INPUT MONTO */}
            <input
              type="number"
              placeholder="Otro monto"
              value={customAmount}
              onChange={(e) => {
                setCustomAmount(e.target.value)
                setSelectedAmount(0)
              }}
              className="w-full border rounded-lg px-3 py-2 text-sm"
            />

            {/* EMAIL */}
            {!userEmail && (
              <input
                type="email"
                placeholder="Tu email"
                value={guestEmail}
                onChange={(e) => setGuestEmail(e.target.value)}
                className="w-full border rounded-lg px-3 py-2 text-sm"
              />
            )}

            {/* BOTÓN */}
            <button
              onClick={handleDonate}
              disabled={loading}
              className="w-full bg-green-500 hover:bg-green-600 text-white py-3 rounded-xl font-semibold text-lg"
            >
              {loading ? "Redirigiendo..." : "Donar ahora"}
            </button>

          </div>

        </div>

      </div>
    </div>
  )
}