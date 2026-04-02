"use client"

import { useEffect, useState } from "react"

export default function CampaignPage({ params }: any) {
  const [campaign, setCampaign] = useState<any>(null)

  // 💰 DONACIÓN
  const [selectedAmount, setSelectedAmount] = useState(5000)
  const [customAmount, setCustomAmount] = useState("")
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const fetchCampaign = async () => {
      try {
        const res = await fetch(`/api/campaign/${params.id}`)
        const data = await res.json()
        setCampaign(data)
      } catch (error) {
        console.error("Error loading campaign:", error)
      }
    }

    fetchCampaign()
  }, [params.id])

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
          user_email: "guest@test.com", // siguiente paso: auth real
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

          {/* IMAGEN */}
          <img
            src={campaign.image_url}
            alt="campaign"
            className="w-full rounded-xl object-cover"
          />

          {/* TÍTULO */}
          <h1 className="text-3xl font-bold">
            {campaign.title}
          </h1>

          {/* AUTOR */}
          <p className="text-gray-500">
            Por {campaign.user_email}
          </p>

          {/* BADGE */}
          <div className="inline-block bg-blue-100 text-blue-600 px-3 py-1 rounded-full text-sm">
            Donación protegida
          </div>

          {/* HISTORIA */}
          <div className="text-gray-700 leading-relaxed whitespace-pre-line">
            {campaign.description}
          </div>

        </div>

        {/* DERECHA (DONACIÓN 🔥) */}
        <div className="sticky top-20 h-fit">

          <div className="bg-white border rounded-xl p-5 shadow-sm space-y-5">

            {/* MONTO */}
            <div>
              <div className="text-2xl font-bold">
                ${campaign.current_amount}
              </div>

              <div className="text-sm text-gray-500">
                de ${campaign.goal_amount}
              </div>

              {/* PROGRESS */}
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

            {/* MONTOS RÁPIDOS */}
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

            {/* INPUT PERSONALIZADO */}
            <input
              type="number"
              placeholder="Otro monto"
              value={customAmount}
              onChange={(e) => {
                setCustomAmount(e.target.value)
                setSelectedAmount(0)
              }}
              className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
            />

            {/* BOTÓN DONAR */}
            <button
              onClick={handleDonate}
              disabled={loading}
              className="w-full bg-green-500 hover:bg-green-600 text-white py-3 rounded-xl font-semibold text-lg transition"
            >
              {loading ? "Redirigiendo..." : "Donar ahora"}
            </button>

            {/* CONFIANZA */}
            <p className="text-xs text-gray-500 text-center">
              🔒 Pago seguro con MercadoPago
            </p>

            {/* URGENCIA */}
            <p className="text-sm text-red-500 text-center">
              ⏳ Apoya antes de que termine la campaña
            </p>

            {/* DONACIONES RECIENTES (placeholder) */}
            <div>
              <p className="font-semibold text-sm mb-2">
                Donaciones recientes
              </p>

              <div className="space-y-2 text-sm text-gray-600">
                <div className="flex justify-between">
                  <span>Juan</span>
                  <span>$5.000</span>
                </div>

                <div className="flex justify-between">
                  <span>Anónimo</span>
                  <span>$10.000</span>
                </div>
              </div>
            </div>

          </div>

        </div>

      </div>
    </div>
  )
}