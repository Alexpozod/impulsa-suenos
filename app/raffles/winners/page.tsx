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

        <h1
          className="
            text-4xl
            font-black
            mb-10
          "
        >
          🏆 Ganadores
        </h1>

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