"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"

export default function AffiliateDetailPage() {

  const { id } = useParams()

  const [loading, setLoading] =
    useState(true)

  const [dashboard, setDashboard] =
    useState<any>(null)

  useEffect(() => {

    load()

  }, [])

  async function load() {

    try {

      setLoading(true)

      const res =
        await fetch(
          `/api/admin/raffles/affiliates/${id}`
        )

      const json =
        await res.json()

      setDashboard(json)

    }

    catch (error) {

      console.error(error)

    }

    finally {

      setLoading(false)

    }

  }

  if (loading) {

    return (

      <div className="space-y-6">

        <h1 className="text-3xl font-bold">

          ⭐ Detalle Influencer

        </h1>

        <div
          className="
            bg-slate-900
            border
            border-slate-800
            rounded-3xl
            p-6
          "
        >

          Cargando...

        </div>

      </div>

    )

  }

  return (

    <div className="space-y-6">

      <div>

        <h1 className="text-3xl font-bold">

          ⭐ Detalle Influencer

        </h1>

        <p className="text-slate-400 mt-2">

          ID: {String(id)}

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

        <div className="grid md:grid-cols-2 gap-6">

          <div>

            <h2 className="text-xl font-semibold">

              Información

            </h2>

            <div className="mt-4 space-y-3">

              <div>

                <span className="text-slate-400">

                  Código

                </span>

                <div>

                  {dashboard?.affiliate?.code ?? "-"}

                </div>

              </div>

              <div>

                <span className="text-slate-400">

                  Email

                </span>

                <div>

                  {dashboard?.affiliate?.email ?? "-"}

                </div>

              </div>

              <div>

                <span className="text-slate-400">

                  Comisión

                </span>

                <div>

                  {dashboard?.affiliate?.commissionPercent ?? 0}%

                </div>

              </div>

              <div>

                <span className="text-slate-400">

                  Estado

                </span>

                <div>

                  {dashboard?.affiliate?.active
                    ? "🟢 Activo"
                    : "🔴 Inactivo"}

                </div>

              </div>

            </div>

          </div>

          <div>

            <h2 className="text-xl font-semibold">

              Estadísticas

            </h2>

            <div className="mt-4 space-y-3">

              <div>

                Clicks:
                {" "}
                {dashboard?.stats?.clicks ?? 0}

              </div>

              <div>

                Begin Checkout:
                {" "}
                {dashboard?.stats?.beginCheckout ?? 0}

              </div>

              <div>

                Órdenes:
                {" "}
                {dashboard?.stats?.orders ?? 0}

              </div>

              <div>

                Pagadas:
                {" "}
                {dashboard?.stats?.paidOrders ?? 0}

              </div>

              <div>

                Revenue:
                {" "}
                $
                {Number(
                  dashboard?.stats?.revenue ?? 0
                ).toLocaleString("es-CL")}

              </div>

              <div>

                Comisión estimada:
                {" "}
                $
                {Number(
                  dashboard?.stats?.estimatedCommission ?? 0
                ).toLocaleString("es-CL")}

              </div>

              <div>

                Comisión pagada:
                {" "}
                $
                {Number(
                  dashboard?.stats?.paidCommission ?? 0
                ).toLocaleString("es-CL")}

              </div>

            </div>

          </div>

        </div>

      </div>

    </div>

  )

}