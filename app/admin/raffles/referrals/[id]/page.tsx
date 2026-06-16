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

  useEffect(()=>{

    load()

  },[])

  async function load(){

    try{

      setLoading(true)

      const [

  referralRes,

  summaryRes

] = await Promise.all([

  fetch(
    `/api/admin/raffles/referrals/${id}`
  ),

  fetch(
    `/api/admin/raffles/referrals/${id}/summary`
  )

])

const referralJson =
  await referralRes.json()

const summaryJson =
  await summaryRes.json()

setReferral(
  referralJson.referral ?? null
)

setSummary(
  summaryJson
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

    </div>

  )

}