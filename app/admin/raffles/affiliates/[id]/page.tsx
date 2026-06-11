"use client"

import { useParams } from "next/navigation"

export default function AffiliateDetailPage() {

  const { id } = useParams()

  return (

    <div className="space-y-6">

      <div>

        <h1 className="text-3xl font-bold">

          ⭐ Detalle Influencer

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

        <h2 className="text-xl font-semibold">

          Dashboard en construcción

        </h2>

        <p className="text-slate-400 mt-3">

          Aquí mostraremos:

        </p>

        <ul className="mt-4 space-y-2 text-slate-300">

          <li>✅ Información del influencer</li>

          <li>✅ Código</li>

          <li>✅ Link compartible</li>

          <li>✅ Clicks</li>

          <li>✅ Compras</li>

          <li>✅ Comisión generada</li>

          <li>✅ Comisión pagada</li>

        </ul>

      </div>

    </div>

  )

}