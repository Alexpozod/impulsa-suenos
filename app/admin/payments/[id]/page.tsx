'use client'

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"

export default function PaymentDetailPage() {

  const params = useParams()

  const id =
    Array.isArray(params.id)
      ? params.id[0]
      : params.id

  const [data, setData] = useState<any>(null)

  const [loading, setLoading] = useState(true)

  useEffect(() => {
    load()
  }, [])

  const load = async () => {

    try {

      const res = await fetch(
        `/api/admin/payments?id=${id}`
      )

      const json = await res.json()

      setData(json)

    } catch (err) {

      console.error(err)

    } finally {

      setLoading(false)

    }
  }

  if (loading) {
    return (
      <div className="p-10 text-white">
        Cargando...
      </div>
    )
  }

  if (!data) {
    return (
      <div className="p-10 text-white">
        No encontrado
      </div>
    )
  }

  const rows = Object
    .values(data)
    .filter((v: any) =>
      typeof v === "object"
    )

  const payment: any =
  rows.find(
    (r: any) => r.type === "payment"
  )

  const creatorNet: any =
    rows.find(
      (r: any) => r.type === "creator_net"
    )

  const tip: any =
    rows.find(
      (r: any) => r.type === "tip"
    )

  const feeMp: any =
    rows.find(
      (r: any) => r.type === "fee_mp"
    )

  const feePlatform: any =
    rows.find(
      (r: any) => r.type === "fee_platform"
    )

  const iva: any =
    rows.find(
      (r: any) => r.type === "fee_platform_iva"
    )

  return (

    <main className="
      min-h-screen
      bg-slate-950
      text-white
      p-10
    ">

      <div className="
        max-w-7xl
        mx-auto
        space-y-8
      ">

        <div>

          <h1 className="
            text-4xl
            font-bold
          ">
            💳 Detalle del pago
          </h1>

          <p className="
            text-slate-400
            mt-2
          ">
            Payment ID: {id}
          </p>

        </div>

        {/* RESUMEN */}

        <div className="
          grid
          md:grid-cols-2
          lg:grid-cols-6
          gap-4
        ">

          <Card
            title="Pago"
            value={payment?.amount}
          />

          <Card
            title="Tip"
            value={tip?.amount}
          />

          <Card
            title="Fee MP"
            value={feeMp?.amount}
          />

          <Card
            title="Fee Plataforma"
            value={feePlatform?.amount}
          />

          <Card
            title="IVA"
            value={iva?.amount}
          />

          <Card
            title="Neto Creador"
            value={creatorNet?.amount}
          />

        </div>

        {/* MOVIMIENTOS */}

        <div className="
          bg-slate-900
          border
          border-slate-800
          rounded-2xl
          overflow-hidden
        ">

          <div className="
            px-6
            py-4
            border-b
            border-slate-800
          ">

            <h2 className="
              text-xl
              font-semibold
            ">
              Ledger Movements
            </h2>

          </div>

          <div className="
            divide-y
            divide-slate-800
          ">

            {rows.map((row: any) => (

              <div
                key={row.id}
                className="
                  grid
                  grid-cols-5
                  gap-4
                  px-6
                  py-4
                  items-center
                "
              >

                <div className="font-medium">
                  {row.type}
                </div>

                <div>
                  ${Number(
                    row.amount || 0
                  ).toLocaleString()}
                </div>

                <div className="
                  text-slate-400
                ">
                  {row.status}
                </div>

                <div className="
                  text-slate-400
                ">
                  {row.user_email || "-"}
                </div>

                <div className="
                  text-slate-400
                  text-sm
                ">
                  {new Date(
                    row.created_at
                  ).toLocaleString()}
                </div>

              </div>

            ))}

          </div>

        </div>

        {/* RAW JSON */}

        <div className="
          bg-black
          rounded-2xl
          p-6
          overflow-auto
          border
          border-slate-800
        ">

          <pre className="
            text-xs
            text-emerald-400
          ">
            {JSON.stringify(data, null, 2)}
          </pre>

        </div>

      </div>

    </main>
  )
}

function Card({
  title,
  value
}: any) {

  return (

    <div className="
      bg-slate-900
      border
      border-slate-800
      rounded-2xl
      p-5
    ">

      <p className="
        text-slate-400
        text-sm
      ">
        {title}
      </p>

      <p className="
        text-2xl
        font-bold
        mt-2
      ">
        ${Number(
          value || 0
        ).toLocaleString()}
      </p>

    </div>
  )
}