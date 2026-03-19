'use client'

import { useState } from "react"

export default function DonateButton({ campaignId }: { campaignId: string }) {

  const [loading, setLoading] = useState(false)

  const handleDonate = async () => {

    const quantity = prompt("¿Cuántos tickets deseas comprar? (cada ticket $1000)")
    if (!quantity) return

    const ticketPrice = 1000
    const total = Number(quantity) * ticketPrice

    if (isNaN(total) || total <= 0) {
      alert("Cantidad inválida")
      return
    }

    setLoading(true)

    try {
      const res = await fetch("/api/create-payment", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          amount: total,
          campaign_id: campaignId,
        }),
      })

      const payment = await res.json()

      if (payment.url) {
        window.location.href = payment.url
      } else {
        alert("Error al crear el pago")
      }

    } catch (error) {
      alert("Error inesperado")
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={handleDonate}
      disabled={loading}
      className={`w-full py-4 rounded-xl font-bold text-lg transition-all duration-200 ${
        loading
          ? 'bg-gray-500 cursor-not-allowed'
          : 'bg-green-500 hover:bg-green-600 hover:scale-105 shadow-lg'
      }`}
    >
      {loading ? "Procesando..." : "🎟️ Comprar tickets"}
    </button>
  )
}
