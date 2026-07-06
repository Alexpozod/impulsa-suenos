"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"

export default function PendingPage() {

  const router = useRouter()

  const [loading, setLoading] =
    useState(false)

  async function checkStatus() {

    const orderId =
      localStorage.getItem(
        "last_raffle_order_id"
      )

    if (!orderId) {
      return
    }

    try {

      setLoading(true)

      const res =
        await fetch(
          `/api/raffles/order-status?order_id=${orderId}`
        )

      if (!res.ok) {
        return
      }

      const json =
        await res.json()

      if (

        json.order_status === "paid" &&

        (
          json.payment_status === "paid" ||

          json.payment_status === "approved"
        )

      ) {

        router.replace(
          "/raffles/payment/success"
        )

        return

      }

      if (

        json.order_status === "cancelled" ||

        json.payment_status === "failed"

      ) {

        router.replace(
          "/raffles/payment/failure"
        )

      }

    }

    catch(error){

      console.error(error)

    }

    finally{

      setLoading(false)

    }

  }

  useEffect(()=>{

    checkStatus()

    const timer =
      setInterval(
        checkStatus,
        4000
      )

    return ()=>clearInterval(timer)

  },[router])

    return (

  <main className="min-h-screen bg-slate-950 text-white flex items-center justify-center px-4">

    <div className="max-w-xl w-full bg-slate-900 border border-slate-800 rounded-3xl p-10 text-center">

      <div className="text-6xl mb-6">
        ⏳
      </div>

      <h1 className="text-4xl font-black mb-4">
        Estamos confirmando tu pago
      </h1>

      <p
        className="
          text-slate-300
          text-lg
          leading-relaxed
          mb-8
        "
      >
        Tu pago fue recibido y estamos esperando la
        confirmación definitiva del proveedor de pago.
        Una vez aprobado, tus tickets serán asignados
        automáticamente.
      </p>

      <div
        className="
          bg-slate-950
          border
          border-slate-800
          rounded-2xl
          p-5
          mb-8
          text-left
          space-y-2
        "
      >

        <div>✅ Compra registrada</div>

        <div>⏳ Confirmación de pago en proceso</div>

        <div>🎟️ Tickets asignados automáticamente al aprobarse</div>

        <div>📧 Recibirás una confirmación por correo</div>

      </div>

      <div className="space-y-4">

        <button
          onClick={checkStatus}
          disabled={loading}
          className="
            w-full
            bg-emerald-600
            hover:bg-emerald-500
            py-4
            rounded-2xl
            font-bold
            transition
            disabled:opacity-60
          "
        >
          {
            loading
              ? "Consultando..."
              : "🔄 Volver a consultar estado"
          }
        </button>

        <button
          onClick={() => router.push("/raffles")}
          className="
            w-full
            border
            border-slate-700
            py-4
            rounded-2xl
            font-bold
            hover:bg-slate-800
            transition
          "
        >
          Ver más sorteos
        </button>

      </div>

    </div>

  </main>

)

}