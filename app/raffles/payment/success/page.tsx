"use client"

import {
  Suspense
} from "react"

import {
  useSearchParams,
  useRouter
} from "next/navigation"

function SuccessContent() {

  const searchParams =
    useSearchParams()

  const router =
    useRouter()

  const orderId =
  searchParams.get("order")

console.log(
  "SUCCESS ORDER",
  orderId
)

  return (

    <main
      className="
        min-h-screen
        bg-[#FAF9F5]
        text-[#002314]
        flex
        items-center
        justify-center
        px-4
      "
    >

      <div
        className="
          max-w-xl
          w-full
          bg-[#EDE8FD]
          border
          border-[#002314]/20
          rounded-3xl
          p-10
          text-center
        "
      >

        <div
          className="
            text-6xl
            mb-6
          "
        >
          🎉
        </div>

        <h1
          className="
            text-4xl
            font-black
            mb-4
          "
        >
          Pago recibido
        </h1>

        <p
          className="
            text-[#002314]
            text-lg
            leading-relaxed
            mb-8
          "
        >
          Tu compra fue procesada correctamente.
          Estamos confirmando tus tickets.
        </p>
        
        <div
          className="
            space-y-4
          "
        >

<button
  onClick={() =>
    router.push("/raffles/my-tickets")
  }
  className="
    w-full
    bg-emerald-600
    hover:bg-emerald-500
    transition
    py-4
    rounded-2xl
    font-black
    text-lg
  "
>
  Ver mis tickets
</button>

          <button
  onClick={() =>
    router.push("/raffles")
  }
  className="
    w-full
    bg-[#7048E8] text-white
    hover:bg-[#002314]
    transition
    py-4
    rounded-2xl
    font-bold
  "
>
  🎁 Explorar sorteos
</button>

          <button
  onClick={() =>
    router.push("/raffles")
  }
  className="
    w-full
    border
    border-[#002314]/20
    py-4
    rounded-2xl
    font-bold
  "
>
  Volver a sorteos
</button>

        </div>

      </div>

    </main>
  )
}

export default function Page() {

  return (

    <Suspense
      fallback={
        <div
          className="
            min-h-screen
            bg-[#FAF9F5]
          "
        />
      }
    >

      <SuccessContent />

    </Suspense>
  )
}