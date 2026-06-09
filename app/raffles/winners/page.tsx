"use client"

import {
  useEffect,
  useState
} from "react"

export default function WinnersPage() {

  const [loading, setLoading] =
    useState(true)

  const [winners, setWinners] =
    useState<any[]>([])

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

</div>

        <div
          className="
            space-y-6
          "
        >

          {winners.map(
            winner => (

              <div
                key={winner.id}
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
                    text-xl
                    font-bold
                    mb-4
                  "
                >
                  {winner.prize_title}
                </div>

                <div>
                  Ticket:
                  {" "}
                  {winner.ticket_code}
                </div>

                <div>
                  Ganador:
                  {" "}
                  {winner.winner_name}
                </div>

                <div>
                  Estado:
                  {" "}
                  {winner.delivery_status}
                </div>

                {(winner.evidence_images ?? []).length > 0 && (

                  <div
                    className="
                      mt-6
                      grid
                      grid-cols-2
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
                            rounded-2xl
                          "
                        />

                      )
                    )}

                  </div>

                )}

              </div>

            )
          )}

        </div>

      </div>

    </div>
  )
}