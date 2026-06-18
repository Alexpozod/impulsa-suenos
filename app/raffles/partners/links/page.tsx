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

      <div
        className="
          bg-white
          rounded-3xl
          border
          p-8
        "
      >
        Cargando...
      </div>

    )

  }

  return (

    <div className="space-y-6">

      <div
        className="
          bg-white
          rounded-3xl
          border
          p-8
          shadow-sm
        "
      >

        <h1
          className="
            text-4xl
            font-black
            text-slate-900
          "
        >
          🔗 Links de Afiliado
        </h1>

        <p
          className="
            text-slate-500
            mt-2
          "
        >
          Código:
          {" "}
          <span className="font-bold">
            {data?.affiliate?.code}
          </span>
        </p>

      </div>

      <div
        className="
          grid
          grid-cols-1
          xl:grid-cols-2
          gap-6
        "
      >

        {data?.raffles?.map(
          (raffle: any) => {

            const link =
`https://impulsasuenos.com/raffles/${raffle.slug}?aff=${data.affiliate.code}`

            return (

              <div
                key={raffle.id}
                className="
                  bg-white
                  rounded-3xl
                  border
                  overflow-hidden
                  shadow-sm
                "
              >

               <div
  className="
    h-40
    overflow-hidden
    bg-slate-100
  "
>

  <img
    src={
      raffle.cover_image ||
      "/placeholder-raffle.jpg"
    }
    alt={raffle.title}
    className="
      w-full
      h-full
      object-cover
    "
  />

</div>

                <div className="p-6">

                  <h3
                    className="
                      text-xl
                      font-black
                      text-slate-900
                      line-clamp-2
                    "
                  >
                    {raffle.title}
                  </h3>

                  <div
                    className="
                      mt-4
                      flex
                      items-center
                      gap-2
                    "
                  >

                    <span
                      className="
                        px-3
                        py-1
                        rounded-full
                        text-xs
                        font-semibold
                        bg-emerald-100
                        text-emerald-700
                      "
                    >
                      Activo
                    </span>

                    <span
                      className="
                        px-3
                        py-1
                        rounded-full
                        text-xs
                        font-semibold
                        bg-purple-100
                        text-purple-700
                      "
                    >
                      Afiliado
                    </span>

                  </div>

                  <div
                    className="
                      mt-4
                      bg-slate-50
                      border
                      rounded-2xl
                      p-3
                      text-xs
                      text-slate-500
                      break-all
                    "
                  >
                    {link}
                  </div>

                  <div
                    className="
                      mt-5
                      flex
                      flex-wrap
                      gap-3
                    "
                  >

                    <button

                      onClick={() =>
                        copy(link)
                      }

                      className="
                        px-5
                        py-3
                        rounded-xl
                        font-semibold
                        text-white

                        bg-gradient-to-r
                        from-blue-600
                        via-purple-600
                        to-cyan-500
                      "
                    >
                      Copiar Link
                    </button>

                    <a
                      href={link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="
                        px-5
                        py-3
                        rounded-xl
                        border
                        font-semibold
                        text-slate-700
                      "
                    >
                      Abrir Sorteo
                    </a>

                  </div>

                </div>

              </div>

            )

          }
        )}

      </div>

    </div>

  )

}