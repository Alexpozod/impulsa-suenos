"use client"

import { useEffect, useState } from "react"

type Raffle = {
  id: string
  title: string
  slug: string
  status: string
  revenue: number
  tickets_sold: number
}

export default function RaffleResultsPage() {

  const [loading, setLoading] =
    useState(true)

  const [raffles, setRaffles] =
    useState<Raffle[]>([])

  useEffect(() => {

    loadRaffles()

  }, [])

  async function loadRaffles() {

    try {

      const token =
        localStorage.getItem(
          "sb-access-token"
        )

      const response =
        await fetch(

          "/api/admin/raffles/list?page=1&limit=100&status=ended",

          {
            headers: {
              Authorization:
                `Bearer ${token}`
            }
          }
        )

      const json =
        await response.json()

      setRaffles(
        json.raffles || []
      )

    } catch (error) {

      console.error(error)

    } finally {

      setLoading(false)

    }
  }

  return (

    <div className="p-6">

      <h1 className="text-3xl font-bold">

        Resultados de Sorteos

      </h1>

      <p className="mt-2 text-gray-400">

        Registro manual de ganadores
      </p>

      <div className="mt-8">

        {loading && (

          <div>
            Cargando sorteos...
          </div>

        )}

        {!loading &&
          raffles.length === 0 && (

          <div>

            No existen sorteos finalizados.

          </div>

        )}

        {!loading &&
          raffles.length > 0 && (

          <div className="space-y-4">

            {raffles.map(
              raffle => (

              <div
                key={raffle.id}
                className="
                  border
                  border-gray-700
                  rounded-lg
                  p-4
                "
              >

                <div className="font-bold">

                  {raffle.title}

                </div>

                <div className="text-sm text-gray-400">

                  Tickets vendidos:

                  {" "}

                  {raffle.tickets_sold}

                </div>

                <div className="text-sm text-gray-400">

                  Revenue:

                  {" "}

                  $

                  {Number(
                    raffle.revenue
                  ).toLocaleString()}

                </div>

                <div className="mt-3">

                  <button

                    className="
                      px-4
                      py-2
                      rounded
                      bg-green-600
                    "

                    onClick={() => {

                      alert(
                        raffle.id
                      )

                    }}

                  >

                    Administrar Resultados

                  </button>

                </div>

              </div>

            ))}

          </div>

        )}

      </div>

    </div>

  )

}