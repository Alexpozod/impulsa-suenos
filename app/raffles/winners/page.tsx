"use client"

import {
  useEffect,
  useState
} from "react"

function maskWinnerName(
  name?: string
) {

  if (!name) {
    return "Ganador verificado"
  }

  const parts =
    name
      .trim()
      .split(/\s+/)

  if (parts.length === 1) {
    return parts[0]
  }

  const firstName =
    parts[0]

  const initials =
    parts
      .slice(1)
      .map(
        part =>
          `${part.charAt(0).toUpperCase()}.`
      )
      .join(" ")

  return `${firstName} ${initials}`
}

export default function WinnersPage() {

  const [loading, setLoading] =
    useState(true)

  const [winners, setWinners] =
    useState<any[]>([])

    const [expandedWinners, setExpandedWinners] =
  useState<Record<string, boolean>>({})

  useEffect(() => {

    loadWinners()

  }, [])

  async function loadWinners() {

    try {

      const res =
        await fetch(
          "/api/raffles/winners"
        )

      const data =
        await res.json()

      setWinners(
        data || []
      )

    } catch (error) {

      console.error(error)

    } finally {

      setLoading(false)
    }
  }

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
        Cargando...
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
          max-w-5xl
          mx-auto
          px-4
          py-12
        "
      >

        <div
  className="
    mb-10
  "
>

  <div
    className="
      inline-flex
      items-center
      px-4
      py-2
      rounded-full
      bg-emerald-500/10
      border
      border-emerald-500/30
      text-emerald-400
      text-sm
      font-semibold
      mb-4
    "
  >
    🏆 Resultados públicos
  </div>

  <h1
    className="
      text-4xl
      lg:text-5xl
      font-black
      leading-tight
      mb-4
    "
  >
    Ganadores verificados
  </h1>

  <p
    className="
      text-slate-400
      max-w-3xl
      leading-relaxed
    "
  >
    Todos los ganadores publicados corresponden a sorteos
    finalizados y son exhibidos de forma pública para
    garantizar la transparencia del proceso. Cuando exista
    evidencia de entrega, será mostrada junto al resultado.
  </p>

<div
  className="
    grid
    grid-cols-2
    lg:grid-cols-4
    gap-4
    mt-6
    mb-10
  "
>

  <div
    className="
      bg-slate-900
      border
      border-slate-800
      rounded-2xl
      p-4
    "
  >
    <div className="text-2xl mb-2">
      🔒
    </div>

    <div className="font-bold">
      Transparencia
    </div>

    <div className="text-xs text-slate-400 mt-1">
      Resultados públicos
    </div>
  </div>

  <div
    className="
      bg-slate-900
      border
      border-slate-800
      rounded-2xl
      p-4
    "
  >
    <div className="text-2xl mb-2">
      🏆
    </div>

    <div className="font-bold">
      Verificados
    </div>

    <div className="text-xs text-slate-400 mt-1">
      Ganadores oficiales
    </div>
  </div>

  <div
    className="
      bg-slate-900
      border
      border-slate-800
      rounded-2xl
      p-4
    "
  >
    <div className="text-2xl mb-2">
      📸
    </div>

    <div className="font-bold">
      Evidencias
    </div>

    <div className="text-xs text-slate-400 mt-1">
      Entregas publicadas
    </div>
  </div>

  <div
    className="
      bg-slate-900
      border
      border-slate-800
      rounded-2xl
      p-4
    "
  >
    <div className="text-2xl mb-2">
      ✅
    </div>

    <div className="font-bold">
      Sorteos
    </div>

    <div className="text-xs text-slate-400 mt-1">
      Procesos auditables
    </div>
  </div>

</div>

</div>

        <div
          className="
            space-y-6
          "
        >

          {winners.map(
  winner => {

    const deliveryStatus =
      winner.delivery_status === "pending"
        ? "🟡 Entrega en coordinación"
        : winner.delivery_status === "delivered"
        ? "🟢 Premio entregado"
        : winner.delivery_status === "published"
        ? "🔵 Resultado publicado"
        : "🏆 Ganador verificado"

const hasEvidence =
  (winner.evidence_images ?? []).length > 0 ||
  (winner.evidence_videos ?? []).length > 0

const isExpanded =
  expandedWinners[winner.id] || false

    return (

  <div
    key={winner.id}
    className="
      bg-slate-900
      border
      border-slate-800
      rounded-3xl
      p-5
    "
  >

    <div
      className="
        flex
        flex-col
        lg:flex-row
        gap-6
      "
    >

      <img
        src={
          winner.raffle?.cover_image ||
          "/placeholder.jpg"
        }
        alt=""
        className="
          w-44
          h-44
          object-cover
          rounded-2xl
          border
          border-slate-800
          shrink-0
        "
      />

      <div
        className="
          flex-1
        "
      >

        <div
          className="
            text-yellow-400
            text-sm
            font-semibold
            uppercase
            tracking-wide
            mb-2
          "
        >
          🏆 Premio
        </div>

        <h2
          className="
            text-2xl
            font-black
            mb-4
          "
        >
          {winner.prize_title}
        </h2>

        <div className="text-slate-300 mb-2">
  📦 <strong>Sorteo:</strong>{" "}
  {winner.raffle?.title || "Sorteo"}
</div>

<div className="text-slate-300 mb-2">
  📅 <strong>Publicado:</strong>{" "}
  {
    winner.created_at
      ? new Date(
          winner.created_at
        ).toLocaleDateString("es-CL")
      : "-"
  }
</div>

            <div className="text-slate-300 mb-2">
            👤 <strong>Ganador:</strong>{" "}
            {maskWinnerName(
              winner.winner_name
            )}
            </div>

            <div className="text-slate-300 mb-4">
            🎟️ <strong>Ticket:</strong>{" "}
            {winner.ticket_code}
            </div>

        <div
          className="
            inline-flex
            px-4
            py-2
            rounded-full
            bg-emerald-500/20
            border
            border-emerald-500/30
            text-emerald-300
            font-semibold
          "
        >
          {deliveryStatus}
        </div>

        <div className="mt-5">

  <a
    href={`/raffles/${winner.raffle?.slug}`}
    className="
      inline-flex
      items-center
      gap-2
      text-blue-400
      hover:text-blue-300
      font-semibold
      transition
    "
  >
    Ver detalle del sorteo →
  </a>

</div>

{hasEvidence && (

  <button
    onClick={() =>
      setExpandedWinners(prev => ({
        ...prev,
        [winner.id]: !prev[winner.id]
      }))
    }
    className="
      mt-4
      text-cyan-400
      hover:text-cyan-300
      font-semibold
      transition
    "
  >
    {isExpanded
      ? "Ocultar evidencias ▲"
      : "Ver evidencias ▼"}
  </button>

)}

      </div>

    </div>

                {isExpanded &&
 (winner.evidence_images ?? []).length > 0 && (

  <div
    className="
      mt-6
    "
  >

    <div
      className="
        text-lg
        font-bold
        mb-4
      "
    >
      📸 Evidencias de entrega
    </div>

    <div
      className="
        grid
        grid-cols-2
        lg:grid-cols-3
        gap-4
      "
    >

      {winner.evidence_images.map(
        (
          image: string,
          index: number
        ) => (

          <img
  key={index}
  src={image}
  alt="evidencia"
  className="
    w-full
    aspect-video
    object-cover
    rounded-2xl
    border
    border-slate-800
  "
/>

        )
      )}

    </div>

  </div>

)}

{isExpanded &&
 (winner.evidence_videos ?? []).length > 0 && (

  <div className="mt-4">

    <div
      className="
        text-lg
        font-bold
        mb-4
      "
    >
      🎥 Videos de entrega
    </div>

    <div
      className="
        grid
        grid-cols-1
        md:grid-cols-2
        lg:grid-cols-3
        gap-4
      "
    >

      {winner.evidence_videos.map(
        (
          video:string,
          index:number
        ) => (

          <video
            key={index}
            controls
            className="
              w-full
              aspect-video
              object-cover
              rounded-2xl
              border
              border-slate-800
            "
          >
            <source src={video} />
          </video>

        )
      )}

    </div>

  </div>

)}

                            </div>

            )

          }
)}

        </div>

      </div>

    </div>
  )
}