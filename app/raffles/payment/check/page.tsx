"use client"

import {
  Suspense,
  useEffect
} from "react"

import {
  useRouter,
  useSearchParams
} from "next/navigation"

function PaymentCheckContent() {

  const router = useRouter()
  
  useEffect(() => {

    async function verify() {

      const orderId =
  localStorage.getItem(
    "last_raffle_order_id"
  )

console.log(
  "CHECK PAGE ORDER",
  orderId
)

      if (!orderId) {

        router.replace(
          "/raffles/payment/failure"
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

          console.log(
            "CHECK PAGE STATUS",
            json
          )

        console.log(
          "ORDER STATUS",
          json
        )

        if (
          json.payment_status === "approved" &&
          json.order_status === "paid"
        ) {

          router.replace(
            `/raffles/payment/success?order=${orderId}`
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

export default function Page() {

  return (

    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          Verificando...
        </div>
      }
    >

      <PaymentCheckContent />

    </Suspense>

  )

}