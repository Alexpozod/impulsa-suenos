"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"

export default function ReferralDetailPage() {

  const params = useParams()

  const id = String(params.id)

  const [loading,setLoading] =
    useState(true)

  const [referral,setReferral] =
    useState<any>(null)

const [summary,setSummary] =
  useState<any>(null)

  const [ledger,setLedger] =
  useState<any[]>([])

  useEffect(()=>{

    load()

  },[])

  async function load(){

    try{

      setLoading(true)

      const [

  referralRes,

  summaryRes,

  ledgerRes

] = await Promise.all([

  fetch(
    `/api/admin/raffles/referrals/${id}`
  ),

  fetch(
    `/api/admin/raffles/referrals/${id}/summary`
  ),

  fetch(
    `/api/admin/raffles/referrals/${id}/ledger`
  )

])

const referralJson =
  await referralRes.json()

const summaryJson =
  await summaryRes.json()

const ledgerJson =
  await ledgerRes.json()

setReferral(
  referralJson.referral ?? null
)

setSummary(
  summaryJson
)

setLedger(
  ledgerJson.ledger ?? []
)

    }

    finally{

      setLoading(false)

    }

  }

  if(loading){

    return(

      <div className="space-y-6">

        <h1 className="text-3xl font-bold">

          🎁 Detalle Referido

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

  return(

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
  grid
  md:grid-cols-2
  gap-4
  "
>

  <div
    className="
    bg-slate-900
    border
    border-slate-800
    rounded-3xl
    p-6
    "
  >

    <div className="text-slate-400">

      Total Ganado

    </div>

    <div className="text-3xl font-bold mt-2">

      $

      {Number(
        summary?.totalEarned ?? 0
      ).toLocaleString("es-CL")}

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

    <div className="text-slate-400">

      Conversiones

    </div>

    <div className="text-3xl font-bold mt-2">

      {summary?.conversions ?? 0}

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
        space-y-3
        "
      >

        <div>

          <strong>Código:</strong>{" "}

          {referral?.code}

        </div>

        <div>

          <strong>Email:</strong>{" "}

          {referral?.owner_email}

        </div>

        <div>

          <strong>Reward:</strong>{" "}

          {referral?.reward_value}

          {

            referral?.reward_type ===
            "percentage"

            ? "%"

            : " CLP"

          }

        </div>

        <div>

  <strong>Estado:</strong>{" "}

  {

    referral?.active

    ? "🟢 Activo"

    : "🔴 Inactivo"

  }

</div>

</div>

<div
  className="
  bg-slate-900
  border
  border-slate-800
  rounded-3xl
  overflow-hidden
  "
>

  <div className="p-6 border-b border-slate-800">

    <h2 className="text-xl font-semibold">

      Historial de Recompensas

    </h2>

  </div>

  <table className="w-full">

    <thead>

      <tr>

        <th className="p-4 text-left">

  Fecha

</th>

<th className="p-4 text-left">

  Tipo

</th>

<th className="p-4 text-left">

  Monto

</th>

<th className="p-4 text-left">

  Metadata

</th>

      </tr>

    </thead>

    <tbody>

      {

        ledger.length === 0

        ? (

          <tr>

            <td
              colSpan={4}
              className="
              p-6
              text-center
              text-slate-500
              "
            >

              Sin movimientos

            </td>

          </tr>

        )

        : (

          ledger.map(

            (item:any)=>(

              <tr
                key={item.id}
                className="
                border-t
                border-slate-800
                "
              >

                <td className="p-4">

                  {

                    item.created_at

                    ?

                    new Date(
                      item.created_at
                    ).toLocaleString("es-CL")

                    :

                    "-"

                  }

                </td>

                <td className="p-4">

                  {item.type}

                </td>

                <td className="p-4 font-semibold">

                  $

                  {Math.abs(

                    Number(
                      item.amount_clp || 0
                    )

                  ).toLocaleString("es-CL")}

                </td>

<td className="p-4 text-xs">

  <pre
    className="
    whitespace-pre-wrap
    break-all
    text-slate-400
    "
  >

    {

      JSON.stringify(

        item.metadata ?? {},

        null,

        2

      )

    }

  </pre>

</td>

              </tr>

            )

          )

        )

      }

    </tbody>

  </table>

</div>

</div>

)

}