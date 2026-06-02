"use client"

import { useRouter } from "next/navigation"

export default function FailurePage() {

  const router = useRouter()

  return (
    <main className="min-h-screen bg-slate-950 text-white flex items-center justify-center px-4">

      <div className="max-w-xl w-full bg-slate-900 border border-slate-800 rounded-3xl p-10 text-center">

        <div className="text-6xl mb-6">
          ❌
        </div>

        <h1 className="text-4xl font-black mb-4">
          Pago rechazado
        </h1>

        <p className="text-slate-300 text-lg mb-8">
          El pago no pudo ser procesado.
          No se asignaron tickets a esta compra.
        </p>

        <button
          onClick={() => router.push("/sorteos")}
          className="w-full bg-blue-600 hover:bg-blue-500 py-4 rounded-2xl font-bold"
        >
          Volver a sorteos
        </button>

      </div>

    </main>
  )
}