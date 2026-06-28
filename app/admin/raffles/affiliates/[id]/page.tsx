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

  const sales =
  dashboard?.sales ?? []

  const [searchSales, setSearchSales] =
  useState("")

  const lastSale =
  dashboard?.lastSale ?? null

  const paymentSummary =
  dashboard?.paymentSummary ?? {

    total: 0,

    successful: 0,

    pending: 0,

    failed: 0

  }

  const totalSalesAmount =
  sales.reduce(

    (sum:number,sale:any)=>

      sum+

      Number(
        sale.total ?? 0
      ),

    0

  )

  const averageTicket =

sales.length > 0

? Math.round(
    totalSalesAmount /
    sales.length
  )

: 0

const filteredSales =
  sales.filter((sale:any)=>{

    if(!searchSales.trim()){

      return true

    }

    return JSON.stringify(sale)
      .toLowerCase()
      .includes(
        searchSales.toLowerCase()
      )

  })

  function exportSalesCsv() {

  if (filteredSales.length === 0) {

    return

  }

  const rows = [

    [

      "Cliente",

      "Email",

      "Tickets",

      "Monto",

      "Estado Orden",

      "Estado Pago",

      "Proveedor",

      "Referencia",

      "Fecha"

    ],

    ...filteredSales.map((sale:any)=>[

      sale.buyerName ?? "",

      sale.buyerEmail ?? "",

      sale.quantity ?? "",

      sale.total ?? "",

      sale.orderStatus ?? "",

      sale.paymentStatus ?? "",

      sale.paymentProvider ?? "",

      sale.paymentReference ?? "",

      sale.paymentCreatedAt ??

      sale.createdAt ??

      ""

    ])

  ]

  const csv =
    rows
      .map(
        row =>
          row
            .map(value => `"${String(value ?? "").replace(/"/g,'""')}"`)
            .join(",")
      )
      .join("\n")

  const blob =
    new Blob(
      [csv],
      {
        type:
          "text/csv;charset=utf-8;"
      }
    )

  const url =
    URL.createObjectURL(blob)

  const link =
    document.createElement("a")

  link.href = url

  link.download =
    `affiliate-${dashboard?.affiliate?.code}-sales.csv`

  link.click()

  URL.revokeObjectURL(url)

}  

  const [requesting,setRequesting]=
useState(false)

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

<StatCard
  title="Ventas Totales"
  value={`$${totalSalesAmount.toLocaleString("es-CL")}`}
/>

<StatCard
  title="Ticket Promedio"
  value={`$${averageTicket.toLocaleString("es-CL")}`}
/>

<StatCard
  title="Pagos Exitosos"
  value={`${paymentSummary.successful}/${paymentSummary.total}`}
/>

<StatCard
  title="Pendientes"
  value={paymentSummary.pending}
/>

<StatCard
  title="Fallidos"
  value={paymentSummary.failed}
/>

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

Solicitar retiro

</h2>

<button

disabled={
requesting ||
Number(wallet?.available ?? 0)<=0
}

className={

`px-4 py-3 rounded-xl ${
requesting ||
Number(wallet?.available ?? 0)<=0
?
"bg-slate-700 cursor-not-allowed"
:
"bg-emerald-600"
}`

}

onClick={async()=>{

try{

setRequesting(true)

const response=

await fetch(

`/api/admin/raffles/affiliates/${id}/request-payout`,

{

method:"POST"

}

)

const json=

await response.json()

if(json.success){

alert(

"Solicitud enviada correctamente"

)

}

else{

alert(

json.error

??

"Error"

)

}

await load()

}

finally{

setRequesting(false)

}

}}

>

{

requesting

?

"Procesando..."

:

"💰 Solicitar retiro"

}

</button>

<div className="mt-3 text-sm text-slate-400">

Saldo disponible:

<strong>

{" "}

${Number(

wallet?.available??0

).toLocaleString("es-CL")}

</strong>

</div>

</div>

</div>

<div
  className="
    grid
    grid-cols-1
    xl:grid-cols-3
    gap-6
  "
>

  <div
    className="
      bg-emerald-950/40
      border
      border-emerald-700
      rounded-3xl
      p-6
    "
  >

    <h2 className="text-xl font-semibold mb-4">
      Última venta registrada
    </h2>

    {

      lastSale

      ? (

        <div className="space-y-2">

          <div>

            <strong>Cliente:</strong>{" "}
            {lastSale.buyerName}

          </div>

          <div>

            <strong>Email:</strong>{" "}
            {lastSale.buyerEmail}

          </div>

          <div>

            <strong>Monto:</strong>{" "}
            ${Number(
              lastSale.total ?? 0
            ).toLocaleString("es-CL")}

          </div>

          <div>

            <strong>Fecha:</strong>{" "}

            {

              lastSale.paymentCreatedAt

              ? new Date(
                  lastSale.paymentCreatedAt
                ).toLocaleString("es-CL")

              : new Date(
                  lastSale.createdAt
                ).toLocaleString("es-CL")

            }

          </div>

        </div>

      )

      :

      (

        <div className="text-slate-400">

          Sin ventas registradas

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

                    ? new Date(
                        item.date
                      ).toLocaleDateString("es-CL")

                    : "-"

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

        <div
  className="
    grid
    grid-cols-1
    xl:grid-cols-2
    gap-6
    items-start
  "
>

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

    Sorteo asignado

  </span>

  <div>

    {

      dashboard?.affiliate?.raffle

      ?

      dashboard.affiliate.raffle.title

      :

      "Todos"

    }

  </div>

</div>

{

dashboard?.affiliate?.raffle && (

<div>

<span className="text-slate-400">

Slug

</span>

<div className="font-mono text-sm">

/raffles/

{dashboard.affiliate.raffle.slug}

</div>

</div>

)
}

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

<hr className="my-4 border-slate-800" />

<div>

  <span className="text-slate-400">

    Enlace del Influencer

  </span>

  <div className="mt-2 break-all text-sm">

    {`${window.location.origin}/raffles?aff=${dashboard?.affiliate?.code ?? ""}`}

  </div>

</div>

<div className="flex flex-wrap gap-2 mt-3">

  <button

    onClick={() => {

      navigator.clipboard.writeText(

        dashboard?.affiliate?.code ?? ""

      )

    }}

    className="px-3 py-2 rounded-lg bg-slate-800"

  >

    📋 Copiar código

  </button>

  <button

    onClick={() => {

      navigator.clipboard.writeText(

`${window.location.origin}/raffles?aff=${dashboard?.affiliate?.code ?? ""}`

)

    }}

    className="px-3 py-2 rounded-lg bg-slate-800"

  >

    🔗 Copiar enlace

  </button>

  <button

    onClick={() => {

      window.open(

`${window.location.origin}/raffles?aff=${dashboard?.affiliate?.code ?? ""}`,

"_blank"

)

    }}

    className="px-3 py-2 rounded-lg bg-emerald-600"

  >

    🚀 Abrir enlace

  </button>

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

  Conversión:
  {" "}

  {

    Number(
      dashboard?.stats?.clicks || 0
    ) > 0

      ? (

          (
            Number(
              dashboard?.stats?.paidOrders || 0
            ) /

            Number(
              dashboard?.stats?.clicks || 1
            )

          ) * 100

        ).toFixed(2)

      : "0"

  }

  %

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
    overflow-hidden
  "
>

  <div
    className="
      flex
      flex-col
      md:flex-row
      md:justify-between
      md:items-center
      gap-4
      mb-5
    "
  >

    <h2 className="text-xl font-semibold">
      Ventas atribuidas
    </h2>

    <button
      type="button"
      onClick={exportSalesCsv}
      disabled={filteredSales.length===0}
      className="
        px-4
        py-2
        rounded-xl
        bg-emerald-600
        disabled:bg-slate-700
      "
    >

      Exportar CSV

    </button>

  </div>

  <input

    value={searchSales}

    onChange={(e)=>
      setSearchSales(
        e.target.value
      )
    }

    placeholder="Buscar cliente, email o referencia..."

    className="
      w-full
      mb-5
      bg-slate-950
      border
      border-slate-700
      rounded-2xl
      px-4
      py-3
    "

  />

  <div className="overflow-x-auto">

    <table className="min-w-full text-sm">

      <thead>

        <tr className="border-b border-slate-800">

          <th className="text-left py-3">Cliente</th>

          <th className="text-left">Email</th>

          <th>Tickets</th>

          <th>Monto</th>

          <th>Estado Pago</th>

          <th>Proveedor</th>

          <th>Referencia</th>

          <th>Estado Orden</th>

          <th>Fecha</th>

          <th>Acciones</th>

        </tr>

      </thead>

      <tbody>

        {

          filteredSales.length===0

          &&

          <tr>

            <td
              colSpan={10}
              className="py-8 text-center text-slate-500"
            >

              Sin ventas todavía

            </td>

          </tr>

        }

        {

          filteredSales.map((sale:any)=>(

            <tr
              key={sale.id}
              className="border-b border-slate-800"
            >

              <td className="py-3 whitespace-nowrap">

                {sale.buyerName ?? "-"}

              </td>

              <td className="whitespace-nowrap">

                {sale.buyerEmail ?? "-"}

              </td>

              <td className="text-center">

                {sale.quantity}

              </td>

              <td className="text-right whitespace-nowrap">

                $

                {Number(
                  sale.total
                ).toLocaleString("es-CL")}

              </td>

              <td className="text-center">

                {sale.paymentStatus ?? "-"}

              </td>

              <td className="text-center">

                {sale.paymentProvider ?? "-"}

              </td>

              <td
                className="
                  font-mono
                  text-xs
                  max-w-[180px]
                  truncate
                "
                title={sale.paymentReference ?? ""}
              >

                {sale.paymentReference ?? "-"}

              </td>

              <td className="text-center">

                {sale.orderStatus}

              </td>

              <td className="whitespace-nowrap">

                {

                  sale.paymentCreatedAt

                  ?

                  new Date(
                    sale.paymentCreatedAt
                  ).toLocaleString("es-CL")

                  :

                  sale.createdAt

                  ?

                  new Date(
                    sale.createdAt
                  ).toLocaleString("es-CL")

                  :

                  "-"

                }

              </td>

              <td className="text-center">

                <button

                  type="button"

                  onClick={() => {

                    navigator.clipboard.writeText(
                      sale.id
                    )

                    alert(
                      "ID de orden copiado"
                    )

                  }}

                  className="
                    px-3
                    py-1
                    rounded-lg
                    bg-slate-800
                    hover:bg-slate-700
                    text-xs
                  "

                >

                  Copiar ID

                </button>

              </td>

            </tr>

          ))

        }

      </tbody>

    </table>

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