"use client"

import { useRouter } from "next/navigation"

export default function FailurePage() {

  const router = useRouter()

  return (
    <main className="min-h-screen bg-slate-950 text-white flex items-center justify-center px-4">

      <div className="max-w-xl w-full bg-slate-900 border border-slate-800 rounded-3xl p-10 text-center">

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
    text-slate-300
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
          className="w-full bg-blue-600 hover:bg-blue-500 py-4 rounded-2xl font-bold"
        >
          Volver a sorteos
        </button>

      </div>

    </main>
  )
}