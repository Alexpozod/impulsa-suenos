'use client'

import { useEffect, useState } from "react"

export default function ReconcilePage() {

  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [lastUpdate, setLastUpdate] = useState("")

  useEffect(() => {

  load()

  const interval = setInterval(() => {
    load()
  }, 30000)

  return () => clearInterval(interval)

}, [])

  const load = async () => {
    try {
      const res = await fetch("/api/admin/reconcile")
      const json = await res.json()
      setData(json)
      setLastUpdate(
  new Date().toLocaleTimeString()
)
    } catch (error) {
      console.error("Error loading reconcile:", error)
      setData(null)
    } finally {
      setLoading(false)
    }
  }

    /* =========================
     🔁 REPROCESAR PAYMENT
  ========================= */
  const reprocessPayment = async (payment_id: string) => {
    try {
      const res = await fetch("/api/admin/reconcile/auto", {
        method: "POST",
        body: JSON.stringify({ payment_id })
      })

      if (res.ok) {
        alert("✅ Pago reprocesado")
        load()
      } else {
        alert("❌ Error reprocesando pago")
      }
    } catch (err) {
      console.error(err)
    }
  }

  if (loading) {
  return (

    <div className="
      min-h-screen
      bg-slate-950
      flex
      items-center
      justify-center
    ">

      <div className="text-center">

        <div
          className="
            w-16
            h-16
            border-4
            border-emerald-500/20
            border-t-emerald-400
            rounded-full
            animate-spin
            mx-auto
            mb-6
          "
        />

        <p className="
          text-slate-300
          text-lg
          font-medium
        ">
          Analizando consistencia financiera...
        </p>

      </div>

    </div>
  )
}

  return (
    <main className="min-h-screen bg-slate-950 text-white p-6">

      <div className="max-w-6xl mx-auto space-y-6">

        {/* HEADER */}
<div className="
  flex
  flex-col
  lg:flex-row
  lg:items-center
  lg:justify-between
  gap-6
">

  {/* LEFT */}
  <div>

    <h1 className="
      text-4xl
      font-black
      tracking-tight
      text-white
    ">
      🧠 Financial Recovery Center
    </h1>

    <p className="text-slate-400 mt-2">
      Supervisión y recuperación de inconsistencias financieras
    </p>

  </div>

  {/* RIGHT */}
  <div className="flex flex-wrap gap-3">

    <StatusBadge
      color="green"
      text="Reconcile Engine Active"
    />

    <StatusBadge
      color="yellow"
      text={`${data?.issues_found || 0} inconsistencias`}
    />

    <StatusBadge
      color="red"
      text={`${data?.issues?.filter((i: any) => i.payment_id).length || 0} pagos críticos`}
    />

<StatusBadge
  color="green"
  text={`Sync ${lastUpdate || "--:--"}`}
/>

  </div>

</div>

        {/* SUMMARY */}
<div className="
  grid
  md:grid-cols-2
  xl:grid-cols-4
  gap-4
">

  <SummaryCard
    title="Issues detectados"
    value={data?.issues_found || 0}
    color="red"
  />

  <SummaryCard
    title="Payments críticos"
    value={
      data?.issues?.filter((i: any) => i.payment_id).length || 0
    }
    color="yellow"
  />

  <SummaryCard
    title="Payouts inconsistentes"
    value={
      data?.issues?.filter((i: any) => i.payout_id).length || 0
    }
    color="blue"
  />

  <SummaryCard
    title="Wallet mismatch"
    value={
      data?.issues?.filter((i: any) => i.user_email).length || 0
    }
    color="green"
  />

</div>

        {/* OK */}
        {data?.issues_found === 0 && (

  <div
    className="
      bg-emerald-500/10
      border
      border-emerald-500/20
      rounded-2xl
      p-10
      text-center
      shadow-xl
    "
  >

    <div className="
      text-6xl
      mb-6
    ">
      ✅
    </div>

    <h2 className="
      text-2xl
      font-black
      text-white
      mb-2
    ">
      Sistema conciliado correctamente
    </h2>

    <p className="text-emerald-300">
      No existen inconsistencias financieras activas
    </p>

  </div>
)}

        {/* ISSUES */}
        <div className="
          space-y-4
          max-h-[900px]
          overflow-y-auto
          pr-2
        ">

           {data?.issues?.map((i: any, idx: number) => (

  <div
    key={idx}
    className="
      bg-slate-900/80
      border
      border-slate-800
      rounded-2xl
      p-5
      shadow-xl
      backdrop-blur-sm
      transition-all
      duration-300
      hover:scale-[1.01]
    "
  >

<div className="
  flex
  items-center
  justify-between
  mb-5
">

  <div className="flex items-center gap-3">

    <div className="text-2xl">

      {i.payment_id
        ? "💳"

        : i.payout_id
        ? "💸"

        : "🧠"}

    </div>

    <div>

      <p className="
        font-bold
        text-white
        text-lg
      ">

        {i.payment_id
          ? "Payment Incident"

          : i.payout_id
          ? "Payout Incident"

          : "Wallet Reconcile Issue"}

      </p>

      <p className="
        text-sm
        text-slate-400
      ">
        Financial consistency validation
      </p>

    </div>

  </div>

  <StatusBadge
    color={
      i.payment_id
        ? "red"

        : i.payout_id
        ? "yellow"

        : "green"
    }
    text={
      i.payment_id
        ? "CRITICAL"

        : i.payout_id
        ? "WARNING"

        : "MISMATCH"
    }
  />

</div>

              {/* 🧠 WALLET vs LEDGER */}
              {i.user_email && (
                <div className="
  bg-slate-950/70
  border
  border-slate-800
  rounded-xl
  p-4
">

  <p className="
    font-bold
    text-lg
    text-white
    break-all
  ">
    👤 {i.user_email}
  </p>

  <div className="
    grid
    md:grid-cols-3
    gap-3
    mt-4
  ">

    <div className="
      bg-slate-900
      border
      border-slate-800
      rounded-xl
      p-3
    ">
      <p className="text-xs text-slate-400">
        Ledger
      </p>

      <p className="font-bold text-white mt-1">
        ${Number(i.ledger_balance || 0).toLocaleString()}
      </p>
    </div>

    <div className="
      bg-slate-900
      border
      border-slate-800
      rounded-xl
      p-3
    ">
      <p className="text-xs text-slate-400">
        Wallet
      </p>

      <p className="font-bold text-white mt-1">
        ${Number(i.wallet_balance || 0).toLocaleString()}
      </p>
    </div>

    <div className="
      bg-red-500/10
      border
      border-red-500/20
      rounded-xl
      p-3
    ">
      <p className="text-xs text-red-300">
        Diferencia
      </p>

      <p className="font-bold text-red-300 mt-1">
        ${Number(i.diff || 0).toLocaleString()}
      </p>
    </div>

  </div>

</div>
                   
              )}

              {/* 💳 PAYMENT ISSUE */}
              {i.payment_id && (
                <div className="
                  bg-red-500/10
                  border
                  border-red-500/20
                  rounded-xl
                  p-4
                ">

                  <p className="font-semibold">
                    ⚠️ Payment inconsistente
                  </p>

                  <p className="text-sm">
                    ID: {i.payment_id}
                  </p>

                  <div className="
                    flex
                    flex-wrap
                    gap-2
                    mt-3
                  ">

                    <button
                      onClick={() => reprocessPayment(i.payment_id)}
                     className="
                      bg-yellow-500
                      hover:bg-yellow-400
                      text-black
                      px-4
                      py-2
                      rounded-xl
                      font-medium
                      transition-all
                      duration-300
                    "
                    >
                      🔁 Reprocesar
                    </button>

                    <a
                      href={`/admin/payments/${i.payment_id}`}
                      className="
                        bg-white
                        hover:bg-slate-200
                        text-black
                        px-4
                        py-2
                        rounded-xl
                        font-medium
                        transition-all
                        duration-300
                      "
                    >
                      🔍 Ver detalle
                    </a>

                  </div>

                </div>
              )}

              {/* 💸 PAYOUT ISSUE */}
              {i.payout_id && (
                <div className="
                  bg-yellow-500/10
                  border
                  border-yellow-500/20
                  rounded-xl
                  p-4
                ">
                  <p className="font-semibold">
                    ⚠️ Payout inconsistente
                  </p>

                  <p className="text-sm">
                    ID: {i.payout_id}
                  </p>
                </div>
              )}

            </div>
          ))}

        </div>

      </div>

    </main>
  )
}

function StatusBadge({
  color,
  text
}: any) {

  const styles: any = {

    red:
      "bg-red-500/10 border-red-500/20 text-red-300",

    yellow:
      "bg-yellow-500/10 border-yellow-500/20 text-yellow-300",

    green:
      "bg-emerald-500/10 border-emerald-500/20 text-emerald-300"

  }

  return (

    <div
      className={`
        px-4
        py-2
        rounded-xl
        border
        text-sm
        font-medium
        ${styles[color]}
      `}
    >
      {text}
    </div>
  )
}

function SummaryCard({
  title,
  value,
  color
}: any) {

  const styles: any = {

    red:
      "from-red-500/20 border-red-500/20 text-red-300",

    yellow:
      "from-yellow-500/20 border-yellow-500/20 text-yellow-300",

    blue:
      "from-blue-500/20 border-blue-500/20 text-blue-300",

    green:
      "from-emerald-500/20 border-emerald-500/20 text-emerald-300"

  }

  return (

    <div
      className={`
        bg-gradient-to-br
        to-slate-900
        ${styles[color]}
        border
        rounded-2xl
        p-5
        shadow-xl
      `}
    >

      <p className="text-sm text-slate-400">
        {title}
      </p>

      <p className="
        text-3xl
        font-black
        mt-2
      ">
        {value}
      </p>

    </div>
  )
}