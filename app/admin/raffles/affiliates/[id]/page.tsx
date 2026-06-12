"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"

export default function AffiliateDetailPage() {

  const params = useParams()

const id = String(params.id)

  const [loading, setLoading] =
    useState(true)

  const [dashboard, setDashboard] =
    useState<any>(null)

    const [summary, setSummary] =
  useState<any>(null)

const [ledger, setLedger] =
  useState<any[]>([])

  const [chartData, setChartData] =
  useState<any[]>([])

  const [wallet, setWallet] =
  useState<any>(null)

  const [showLedger, setShowLedger] =
  useState(true)

  const [searchLedger, setSearchLedger] =
  useState("")

  const filteredLedger =
  [...ledger]

    .filter((item: any) => {

      if (!searchLedger.trim()) {

        return true

      }

      return JSON.stringify(item)
        .toLowerCase()
        .includes(
          searchLedger.toLowerCase()
        )

    })

    .sort((a: any, b: any) => {

      const da =
        new Date(
          a.created_at ?? 0
        ).getTime()

      const db =
        new Date(
          b.created_at ?? 0
        ).getTime()

      return db - da

    })

  useEffect(() => {

    load()

  }, [])

  async function load() {

    try {

      setLoading(true)

      const [

  dashboardRes,

  summaryRes,

  ledgerRes,

  chartRes,

  walletRes

] = await Promise.all([

  fetch(
    `/api/admin/raffles/affiliates/${id}`
  ),

  fetch(
    `/api/admin/raffles/affiliates/${id}/summary`
  ),

  fetch(
    `/api/admin/raffles/affiliates/${id}/ledger`
  ),

  fetch(
    `/api/admin/raffles/affiliates/${id}/chart`
    ),

fetch(
  `/api/admin/raffles/affiliates/${id}/wallet`
)

])

const dashboardJson =
  await dashboardRes.json()

const summaryJson =
  await summaryRes.json()

const ledgerJson =
  await ledgerRes.json()

  const chartJson =
  await chartRes.json()

  const walletJson =
  await walletRes.json()

setDashboard(
  dashboardJson
)

setSummary(
  summaryJson
)

setLedger(
  ledgerJson.ledger || []
)

setChartData(
  chartJson.chart || []
)

setWallet(
  walletJson.wallet || null
)

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
    grid
    grid-cols-1
    md:grid-cols-2
    xl:grid-cols-4
    2xl:grid-cols-8
    gap-4
"
>

  <StatCard
    title="Comisión Confirmada"
    value={`$${Number(
      summary?.totalCommission || 0
    ).toLocaleString("es-CL")}`}
  />

  <StatCard
    title="Movimientos"
    value={
      summary?.transactions || 0
    }
  />

  <StatCard
    title="Registros Ledger"
    value={ledger.length}
  />

<StatCard
  title="Total Ledger"

  value={`$${filteredLedger
    .reduce(

      (sum:any,item:any)=>

        sum+
        Math.abs(
          Number(
            item.amount_clp||0
          )
        ),

      0

    )
    .toLocaleString("es-CL")}`}
/>

<StatCard
  title="Wallet Generado"
  value={`$${Number(
    wallet?.generated ?? 0
  ).toLocaleString("es-CL")}`}
/>

<StatCard
  title="Disponible"
  value={`$${Number(
    wallet?.available ?? 0
  ).toLocaleString("es-CL")}`}
/>

<StatCard
  title="Pagado"
  value={`$${Number(
    wallet?.paid ?? 0
  ).toLocaleString("es-CL")}`}
/>

<StatCard
  title="Pendiente"
  value={`$${Number(
    wallet?.pending ?? 0
  ).toLocaleString("es-CL")}`}
/>

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

  <h2 className="text-xl font-semibold mb-4">

    Evolución de Comisiones

  </h2>

  {

    chartData.length === 0

    ? (

      <div className="text-slate-500">

        Sin datos disponibles

      </div>

    )

    : (

      <div className="space-y-2">

        {

          chartData.slice(-10).map((item:any,index:number)=>(

            <div
              key={index}
              className="
                flex
                justify-between
                border-b
                border-slate-800
                py-2
              "
            >

              <span>

                {

                  item.date

                  ?

                  new Date(
                    item.date
                  ).toLocaleDateString("es-CL")

                  :

                  "-"

                }

              </span>

              <span className="font-semibold">

                $

                {Number(
                  item.amount || 0
                ).toLocaleString("es-CL")}

              </span>

            </div>

          ))

        }

      </div>

    )

  }

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

      <div
        className="
          bg-slate-900
          border
          border-slate-800
          rounded-3xl
          p-6
        "
      >

        <div className="flex items-center justify-between mb-4">

  <h2 className="text-xl font-semibold">
    Movimientos Ledger
  </h2>

  <button
    type="button"
    onClick={() =>
      setShowLedger(!showLedger)
    }
    className="
      px-3
      py-2
      rounded-xl
      bg-slate-800
      hover:bg-slate-700
      text-sm
    "
  >
    {
      showLedger
        ? "Ocultar"
        : "Mostrar"
    }
  </button>

</div>

<input

  value={searchLedger}

  onChange={(e) =>
    setSearchLedger(
      e.target.value
    )
  }

  placeholder="Buscar movimiento..."

  className="
    w-full
    mb-4
    bg-slate-950
    border
    border-slate-700
    rounded-2xl
    px-4
    py-3
  "

/>

        {

!showLedger

? (

<div className="text-slate-500">

Tabla oculta

</div>

)

:

ledger.length===0

? (

          <div className="text-slate-500">
            Sin movimientos registrados
          </div>

        ) : (

          <div className="overflow-x-auto">

            <table className="w-full">

              <thead>

                <tr className="border-b border-slate-800">

                  <th className="text-left py-2">
                    Tipo
                  </th>

                  <th className="text-left py-2">
                    Monto
                  </th>

                  <th className="text-left py-2">
                    Fecha
                  </th>

                </tr>

              </thead>

              <tbody>

                {filteredLedger.map((item: any) => (

                  <tr
                    key={item.id}
                    className="border-b border-slate-800"
                  >

                    <td className="py-3">
                      {item.type}
                    </td>

                    <td className="py-3">
                      $
                      {Number(
                        item.amount_clp ?? 0
                      ).toLocaleString("es-CL")}
                    </td>

                    <td className="py-3">
                      {item.created_at
                        ? new Date(
                            item.created_at
                          ).toLocaleString()
                        : "-"}
                    </td>

                  </tr>

                ))}

              </tbody>

            </table>

          </div>

        )}

      </div>

  </div>

  )

}

function StatCard({

  title,

  value

}: any) {

  return (

    <div
      className="
        bg-slate-900
        border
        border-slate-800
        rounded-3xl
        p-5
      "
    >

      <div className="text-slate-400 text-sm">
        {title}
      </div>

      <div className="text-3xl font-bold mt-3">
        {value}
      </div>

    </div>

  )

}