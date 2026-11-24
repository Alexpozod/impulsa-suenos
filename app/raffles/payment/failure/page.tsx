"use client"

import { useRouter } from "next/navigation"

export default function FailurePage() {

  const router = useRouter()

  return (
    <main className="min-h-screen bg-[#FAF9F5] text-[#002314] flex items-center justify-center px-4">

      <div className="max-w-xl w-full bg-[#EDE8FD] border border-[#002314]/20 rounded-3xl p-10 text-center">

        <div className="text-6xl mb-6">
  ⚠️
</div>

<h1
  className="
    text-4xl
    font-black
    mb-4
  "
>
  No pudimos completar tu pago
</h1>

<p
  className="
    text-[#002314]
    text-lg
    leading-relaxed
    mb-8
  "
>
  Tu pago fue cancelado o rechazado por el
  proveedor de pago.

  No te preocupes: no se asignaron tickets a
  esta compra y puedes intentarlo nuevamente
  cuando lo desees.
</p>

<div
  className="
    bg-[#FAF9F5]
    border
    border-[#002314]/20
    rounded-2xl
    p-5
    mb-8
    text-left
    space-y-2
  "
>

  <div>
    ❌ Pago no confirmado
  </div>

  <div>
    🎟️ No se asignaron tickets
  </div>

  <div>
    🔄 Puedes volver a intentarlo en cualquier momento
  </div>

</div>

        <button
          onClick={() => router.push("/raffles")}
          className="w-full bg-[#7048E8] text-white hover:bg-[#002314] py-4 rounded-2xl font-bold"
        >
          Volver a sorteos
        </button>

      </div>

    </main>
  )
}