"use client"

import { useParams } from "next/navigation"

export default function ReferralDetailPage() {

  const params = useParams()

  const id = String(params.id)

  return (

    <div className="space-y-6">

      <div>

        <h1 className="text-3xl font-bold">

          🎁 Detalle Referido

        </h1>

        <p className="text-slate-400 mt-2">

          ID: {id}

        </p>

      </div>

      <div
        className="
        bg-slate-900
        border
        border-slate-800
        rounded-3xl
        p-6
        "
      >

        Próximamente dashboard del referido

      </div>

    </div>

  )

}