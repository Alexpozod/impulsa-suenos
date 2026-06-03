"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

export default function PaymentCheckPage() {

  const router = useRouter()

  useEffect(() => {

    async function verify() {

      const orderId =
        localStorage.getItem(
          "last_raffle_order_id"
        )

      if (!orderId) {

        router.replace(
          "/raffles/payment/pending"
        )

        return
      }

      try {

        const res =
          await fetch(
            `/api/raffles/order-status?order_id=${orderId}`
          )

        const json =
          await res.json()

        if (
          json.payment_status === "approved" &&
          json.order_status === "paid"
        ) {

          router.replace(
            "/raffles/payment/success"
          )

          return
        }

        if (
          json.payment_status === "failed" ||
          json.order_status === "cancelled"
        ) {

          router.replace(
            "/raffles/payment/failure"
          )

          return
        }

        router.replace(
          "/raffles/payment/pending"
        )

      } catch {

        router.replace(
          "/raffles/payment/pending"
        )

      }
    }

    verify()

  }, [router])

  return (
    <div className="min-h-screen flex items-center justify-center">
      Verificando pago...
    </div>
  )
}