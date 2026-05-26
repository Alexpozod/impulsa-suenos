"use client"

import {
  useSearchParams,
  useRouter
} from "next/navigation"

export default function RafflePaymentSuccessPage() {

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

        {token && (

          <div
            className="
              bg-slate-950
              border
              border-slate-800
              rounded-2xl
              p-4
              mb-8
              text-left
            "
          >

            <p
              className="
                text-xs
                text-slate-500
                mb-2
              "
            >
              Token Flow
            </p>

            <p
              className="
                text-sm
                break-all
                text-slate-300
              "
            >
              {token}
            </p>

          </div>
        )}

        <div
          className="
            space-y-4
          "
        >

          <button
            onClick={() =>
              router.push("/sorteos")
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