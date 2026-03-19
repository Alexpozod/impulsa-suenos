'use client'

export default function DonateButton({ campaignId }: { campaignId: string }) {

  const handleDonate = async () => {
    const amount = prompt("¿Cuánto deseas donar?")
    if (!amount) return

    try {
      const res = await fetch("/api/create-payment", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          amount,
          campaign_id: campaignId,
        }),
      })

      const payment = await res.json()

      console.log("Respuesta backend:", payment)

      // 🔥 VALIDACIÓN CORRECTA
      if (payment.id) {
        window.location.href = `https://www.mercadopago.cl/checkout/v1/redirect?pref_id=${payment.id}`
      } else {
        alert("Error al crear el pago")
      }

    } catch (error) {
      console.error("Error:", error)
      alert("Error al procesar el pago")
    }
  }

  return (
    <button
      onClick={handleDonate}
      style={{
        padding: 12,
        borderRadius: 6,
        backgroundColor: '#009ee3',
        color: 'white',
        border: 'none',
        cursor: 'pointer',
        marginTop: 20
      }}
    >
      Donar con MercadoPago
    </button>
  )
}
