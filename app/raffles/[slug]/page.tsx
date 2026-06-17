"use client"

import {
  useEffect,
  useMemo,
  useState
} from "react"

import {
  useParams
} from "next/navigation"

import Link from "next/link"

type RaffleData = {
  id: string
  slug: string
  title: string
  description: string
  short_description?: string

  prize_title: string
  prize_description?: string

  cover_image: string

gallery?: string[]

promo_video?: string

ticket_price_clp: number

  currency: string

  generated_ticket_count: number

  sold_ticket_count: number
  reserved_ticket_count: number

  sold_tickets: number
  reserved_tickets: number
  available_tickets: number

  total_tickets: number

  progress: number

  revenue: number

  end_date?: string

  status: string
}

type Winner = {
  id: string
  ticket_code: string
  prize_title: string
  prize_position: number
  winner_name: string
  delivery_status: string
  evidence_images: string[]
  evidence_videos?: string[]
}

type ApiResponse = {
  ok: boolean
  raffle: RaffleData
  winners?: Winner[]
}

export default function RafflePage() {

  const params = useParams()

  const [data, setData] =
    useState<ApiResponse | null>(null)

  const [loading, setLoading] =
    useState(true)
  
const [selectedQty, setSelectedQty] =
  useState(3)    

  useEffect(() => {

  loadRaffle()

}, [])

  async function loadRaffle() {

    try {

      const res =
        await fetch(
          `/api/raffles/${params.slug}`
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
  
    const raffle =
  data?.raffle

  const winners =
  data?.winners || []
    
  const countdown =
    useMemo(() => {

      if (!raffle?.end_date) {
        return null
      }

      const end =
        new Date(
          raffle.end_date
        ).getTime()

      const now =
        Date.now()

      const diff =
        end - now

      if (diff <= 0) {

        return "Finalizado"
      }

      const days =
        Math.floor(
          diff / (
            1000 * 60 * 60 * 24
          )
        )

      const hours =
        Math.floor(
          (
            diff % (
              1000 * 60 * 60 * 24
            )
          ) / (
            1000 * 60 * 60
          )
        )

      return `${days}d ${hours}h`

    }, [raffle])

  if (loading) {

    return (

      <div
        className="
          min-h-screen
          bg-slate-950
          text-white
          flex
          items-center
          justify-center
        "
      >
        Cargando sorteo...
      </div>
    )
  }

  if (!raffle) {

    return (

      <div
        className="
          min-h-screen
          bg-slate-950
          text-white
          flex
          items-center
          justify-center
        "
      >
        Sorteo no encontrado
      </div>
    )
  }

  return (

    <div
      className="
        min-h-screen
        bg-slate-950
        text-white
      "
    >

      <div
        className="
          max-w-7xl
          mx-auto
          px-4
          py-10
        "
      >

        <div
          className="
            grid
            grid-cols-1
            lg:grid-cols-2
            gap-10
          "
        >

          <div>

           <img
            src={
                raffle.cover_image ||
                "/placeholder.jpg"
            }
              alt={raffle.title}
              className="
                w-full
                rounded-3xl
                border
                border-slate-800
              "
            />

{raffle.promo_video && (

  <div className="mt-4">

    <video
      controls
      className="
        w-full
        rounded-3xl
        border
        border-slate-800
      "
    >
      <source
        src={raffle.promo_video}
      />
    </video>

  </div>

)}

{Array.isArray(raffle.gallery) &&
  raffle.gallery.length > 0 && (

  <div
    className="
      mt-4
      grid
      grid-cols-2
      md:grid-cols-3
      gap-3
    "
  >

    {raffle.gallery.map(
      (
        image:string,
        index:number
      ) => (

        <img
          key={index}
          src={image}
          alt=""
          className="
            h-32
            w-full
            object-cover
            rounded-xl
            border
            border-slate-800
          "
        />

      )
    )}

  </div>

)}

<div
  className="
    mt-6
    bg-slate-900
    border
    border-slate-800
    rounded-3xl
    p-6
  "
>
  <div
    className="
      text-yellow-400
      text-sm
      uppercase
      tracking-wider
      font-semibold
      mb-3
    "
  >
    🏆 Premio Principal
  </div>

  <h2
  className="
    text-3xl
    md:text-4xl
    font-black
    leading-tight
    mb-3
  "
>
    {raffle.prize_title}
  </h2>
  
</div>

<div
  className="
    mt-6
    bg-slate-900
    border
    border-slate-800
    rounded-2xl
p-5
  "
>

  <div
  className="
    flex
    flex-col
    gap-3
  "
>

  <div>
    <div
      className="
        font-bold
        text-lg
      "
    >
      📜 Bases legales
    </div>

    <div
      className="
        text-slate-300
        text-sm
      "
    >
      Protocolizado ante notario para este sorteo.
    </div>
  </div>

  <Link
    href={`/raffles/${raffle.slug}/bases`}
    className="
      inline-flex
      items-center
      justify-center
      px-5
      py-3
      rounded-xl
      bg-blue-600
      hover:bg-blue-500
      text-white
      transition
      font-semibold
      w-fit
    "
  >
    Ver bases legales
  </Link>

</div>

</div>

          </div>

          <div
            className="
              space-y-6
            "
          >

            <div>

              <div
  className="
    inline-flex
    items-center
    px-4
    py-2
    rounded-full
    bg-emerald-500/20
    text-emerald-300
    text-sm
    border
    border-emerald-500/30
    mb-4
  "
>
  {
  raffle.status === "active"
    ? "🎟️ Sorteo activo"

  : raffle.status === "paused"
    ? "⏸️ Sorteo pausado"

  : raffle.status === "ended"
    ? "🏁 Sorteo finalizado"

  : raffle.status === "completed"
    ? "🏆 Resultado publicado"

  : "🎟️ Sorteo"
}

</div>

              <h1
  className="
    text-3xl
    md:text-4xl
    lg:text-4xl
    font-black
    leading-tight
  "
>
  Participa por este premio
</h1>

             <p
  className="
    mt-6
    text-slate-300
    text-lg
    leading-relaxed
    max-w-xl
  "
>
  {raffle.prize_description || raffle.description}

  {raffle.end_date && (

  <div
    className="
      mt-4
      text-sm
      text-slate-400
    "
  >
    📅 Fecha del sorteo:
    {" "}
    {
      new Date(
        raffle.end_date
      ).toLocaleDateString(
        "es-CL"
      )
    }
  </div>

)}
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

  <h3
  className="
    text-2xl
    font-black
    mb-4
  "
>
{
  raffle.status === "ended" ||
  raffle.status === "completed"

    ? "Resultado oficial del sorteo"

    : "Participa en este sorteo"
}
</h3>

<div
  className="
    bg-slate-950
    border
    border-slate-800
    rounded-2xl
    p-4
    mb-6
  "
>

  <div className="text-slate-400 text-sm">
    Valor Ticket
  </div>

  <div className="text-3xl font-black mt-1">
    $
    {Number(
      raffle.ticket_price_clp
    ).toLocaleString("es-CL")}
  </div>

</div>

<h4
  className="
    font-bold
    mb-4
  "
>
  Selecciona tu participación
</h4>

<div
  className="
    grid
    grid-cols-2
    gap-3
    mb-6
  "
>

  <button
    type="button"
    onClick={() => setSelectedQty(1)}
    className={`rounded-xl py-2 px-3 border transition ${
      selectedQty === 1
        ? "bg-blue-600 border-blue-500"
        : "bg-slate-950 border-slate-800"
    }`}
  >
    <div className="text-sm font-semibold">
      Básico
    </div>

    <div className="text-[11px] text-slate-400 mt-0.5">
      1 participación
    </div>

    <div className="mt-0.5 font-bold text-sm">
      $
      {Number(
        raffle.ticket_price_clp
      ).toLocaleString("es-CL")}
    </div>
  </button>

  <button
    type="button"
    onClick={() => setSelectedQty(3)}
    className={`rounded-xl py-2 px-3 border transition ${
      selectedQty === 3
        ? "bg-blue-600 border-blue-500"
        : "bg-slate-950 border-slate-800"
    }`}
  >
    <div className="text-sm font-semibold">
      Popular ⭐
    </div>

    <div className="text-[11px] text-slate-400 mt-0.5">
      3 participaciones
    </div>

    <div className="mt-0.5 font-bold text-sm">
      $
      {Number(
        raffle.ticket_price_clp * 3
      ).toLocaleString("es-CL")}
    </div>
  </button>

  <button
    type="button"
    onClick={() => setSelectedQty(5)}
    className={`rounded-xl py-2 px-3 border transition ${
      selectedQty === 5
        ? "bg-blue-600 border-blue-500"
        : "bg-slate-950 border-slate-800"
    }`}
  >
    <div className="text-sm font-semibold">
      Recomendado 🔥
    </div>

    <div className="text-[11px] text-slate-400 mt-0.5">
      5 participaciones
    </div>

    <div className="mt-0.5 font-bold text-sm">
      $
      {Number(
        raffle.ticket_price_clp * 5
      ).toLocaleString("es-CL")}
    </div>
  </button>

  <button
    type="button"
    onClick={() => setSelectedQty(10)}
    className={`rounded-xl py-2 px-3 border transition ${
      selectedQty === 10
        ? "bg-blue-600 border-blue-500"
        : "bg-slate-950 border-slate-800"
    }`}
  >
    <div className="text-sm font-semibold">
      Premium 👑
    </div>

    <div className="text-[11px] text-slate-400 mt-0.5">
      10 participaciones
    </div>

    <div className="mt-0.5 font-bold text-sm">
      $
      {Number(
        raffle.ticket_price_clp * 10
      ).toLocaleString("es-CL")}
    </div>
  </button>

</div>

{
raffle.status === "active" ? (

<Link
  href={`/raffles/${raffle.slug}/checkout?qty=${selectedQty}`}
  className="
    w-full
    block
    text-center
    py-5
    rounded-2xl
    bg-blue-600
    hover:bg-blue-500
    text-white
    transition
    font-black
    text-lg
  "
>
  Participar ahora
</Link>

) : (

<div
  className="
    w-full
    text-center
    py-5
    rounded-2xl
    bg-emerald-600/20
    border
    border-emerald-500/30
    text-emerald-300
    font-black
    text-lg
  "
>
{
  raffle.status === "paused"
    ? "⏸️ Sorteo temporalmente pausado"

  : raffle.status === "ended"
    ? "🏁 Sorteo finalizado"

  : raffle.status === "completed"
    ? "🏆 Resultado publicado"

  : "No disponible"
}
</div>

)
}

<div
  className="
    mt-5
    grid
    grid-cols-2
    gap-3
  "
>

  <div
    className="
      bg-slate-950
      rounded-xl
      py-2 px-3
      text-xs
    "
  >
    🔒 Pago seguro mediante Flow
  </div>

  <div
    className="
      bg-slate-950
      rounded-xl
      py-2 px-3
      text-xs
    "
  >
    🎟 Asignación automática
  </div>

  <div
    className="
      bg-slate-950
      rounded-xl
      py-2 px-3
      text-xs
    "
  >
    🛡️ Sorteo verificable
  </div>

  <div
    className="
      bg-slate-950
      rounded-xl
      py-2 px-3
      text-xs
    "
  >
    🏆 Ganador publicado
  </div>

</div>

</div>

{winners.length > 0 && (

  <div
    className="
      mt-10
      bg-slate-900
      border
      border-slate-800
      rounded-3xl
      p-6
    "
  >

    <h2
      className="
        text-2xl
        font-black
        mb-6
      "
    >
      Ganadores
    </h2>

    <div className="space-y-6">

      {winners.map(winner => (

        <div
          key={winner.id}
          className="
            border
            border-slate-800
            rounded-2xl
            p-4
          "
        >

          <div
  className="
    flex
    items-start
    justify-between
    gap-4
    flex-wrap
  "
>

  <div>

    <div
      className="
        text-yellow-400
        text-xs
        uppercase
        tracking-wider
        font-semibold
        mb-1
      "
    >
      🏆 Premio
    </div>

    <h3
      className="
        text-xl
        font-black
        mb-3
      "
    >
      {winner.prize_title}
    </h3>

    <div className="text-slate-300">
      👤 Ganador:
      {" "}
      {winner.winner_name}
    </div>

    <div className="text-slate-300 mt-1">
      🎟 Ticket:
      {" "}
      {winner.ticket_code}
    </div>

  </div>

  <div>

    <div
      className={`
        px-4
        py-2
        rounded-full
        text-sm
        font-semibold

        ${
          winner.delivery_status === "delivered"
            ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
            : "bg-yellow-500/20 text-yellow-300 border border-yellow-500/30"
        }
      `}
    >
      {
        winner.delivery_status === "delivered"
          ? "🟢 Premio entregado"
          : "🟡 Entrega en coordinación"
      }
    </div>

  </div>

</div>

          {(winner.evidence_images ?? []).length > 0 && (

            <div
              className="
                mt-4
                grid
                grid-cols-2
                gap-3
              "
            >

              {(winner.evidence_images ?? []).map(
  (image, index) => (

                  <img
                    key={index}
                    src={image}
                    alt="evidencia"
                    className="
                      rounded-xl
                      border
                      border-slate-700
                    "
                  />

                )
              )}

            </div>

          )}

{(winner.evidence_videos ?? []).length > 0 && (

  <div
    className="
      mt-4
      flex
      flex-wrap
      gap-4
    "
  >

    {(winner.evidence_videos ?? []).map(
      (
        video,
        index
      ) => (

        <video
          key={index}
          controls
          className="
            w-full
            max-w-sm
            rounded-xl
            border
            border-slate-700
          "
        >
          <source src={video} />
        </video>

      )
    )}

  </div>

)}

        </div>

      ))}

    </div>

  </div>

)}

          </div>

                </div>

      </div>

    </div>
  )
}