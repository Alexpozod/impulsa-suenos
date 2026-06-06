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

  const token =
    searchParams.get("token")

  return (

    <main
      className="
        min-h-screen
        bg-slate-950
        text-white
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
          bg-slate-900
          border
          border-slate-800
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
            text-slate-300
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
    router.push("/my-tickets")
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
    bg-blue-600
    hover:bg-blue-500
    transition
    py-4
    rounded-2xl
    font-bold
  "
>
  Ver más sorteos
</button>

          <button
            onClick={() =>
              router.push("/")
            }
            className="
              w-full
              border
              border-slate-700
              py-4
              rounded-2xl
              font-bold
            "
          >
            Volver al inicio
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
            bg-slate-950
          "
        />
      }
    >

      <SuccessContent />

    </Suspense>
  )
}