"use client"

import {
  useEffect,
  useState
} from "react"

import { supabase }
from "@/src/lib/supabase"

export default function PartnerLinksPage() {

  const [data, setData] =
    useState<any>(null)

  const [loading, setLoading] =
    useState(true)

  useEffect(() => {

    load()

  }, [])

  async function load() {

    try {

      const {
        data: { session }
      } =
        await supabase.auth.getSession()

      const res =
        await fetch(
          "/api/raffles/partners/links",
          {
            headers: {
              Authorization:
                `Bearer ${session?.access_token}`
            }
          }
        )

      const json =
        await res.json()

      setData(json)

    } catch (error) {

      console.error(error)

    } finally {

      setLoading(false)

    }

  }

  async function copy(
    value: string
  ) {

    await navigator.clipboard.writeText(
      value
    )

    alert(
      "Link copiado"
    )

  }

  if (loading) {

    return (
      <div className="p-8">
        Cargando...
      </div>
    )

  }

  return (

    <div className="p-8 space-y-6">

      <div>

        <h1 className="text-4xl font-bold">
          🔗 Affiliate Links
        </h1>

        <p className="text-slate-400 mt-2">

          Código:

          {" "}

          {data?.affiliate?.code}

        </p>

      </div>

      {data?.raffles?.map(
        (raffle: any) => {

          const link =
`https://impulsasuenos.com/raffles/${raffle.slug}?aff=${data.affiliate.code}`

          return (

            <div
              key={raffle.id}
              className="
              border
              border-slate-800
              rounded-3xl
              p-5
            "
            >

              <h3
                className="
                font-bold
                text-xl
              "
              >
                {raffle.title}
              </h3>

              <div
                className="
                mt-4
                break-all
                text-sm
              "
              >

                {link}

              </div>

              <button

                onClick={() =>
                  copy(link)
                }

                className="
                mt-4
                px-4
                py-2
                rounded-xl
                bg-blue-600
                text-white
              "
              >

                Copiar Link

              </button>

            </div>

          )

        }
      )}

    </div>

  )

}