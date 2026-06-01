"use client"

import {
  useEffect,
  useState
} from "react"
import { useParams } from "next/navigation"

import { supabase }
from "@/src/lib/supabase"

export default function RaffleResultDetailPage() {

  const params = useParams()

  const raffleId =
    params.id as string

  const [ticketCode, setTicketCode] =
    useState("")

  const [prizeTitle, setPrizeTitle] =
    useState("")

  const [prizePosition, setPrizePosition] =
    useState(1)

  const [visibilityMode, setVisibilityMode] =
    useState("public")

  const [loading, setLoading] =
    useState(false)

const [results, setResults] =
  useState<any[]>([])

const [loadingResults, setLoadingResults] =
  useState(true)

  useEffect(() => {

  loadResults()

}, [])
 
async function loadResults() {

  try {

    setLoadingResults(true)

    const {
      data: { session }
    } =
      await supabase.auth.getSession()

    const response =
      await fetch(

        `/api/admin/raffles/results?raffle_id=${raffleId}`,

        {
          headers: {

            Authorization:
              `Bearer ${session?.access_token}`

          }
        }
      )

    const json =
      await response.json()

    setResults(
      json.results || []
    )

  } catch (error) {

    console.error(error)

  } finally {

    setLoadingResults(false)

  }
}

async function updateVisibility(
  resultId: string,
  mode: "public" | "hidden"
) {

  try {

    const {
      data: { session }
    } =
      await supabase.auth.getSession()

    const response =
      await fetch(
        `/api/admin/raffles/results/${resultId}`,
        {
          method: "PATCH",

          headers: {

            "Content-Type":
              "application/json",

            Authorization:
              `Bearer ${session?.access_token}`

          },

          body: JSON.stringify({

            visibility_mode: mode

          })

        }
      )

    if (!response.ok) {

      alert(
        "Error actualizando visibilidad"
      )

      return
    }

    await loadResults()

  } catch (error) {

    console.error(error)

  }
}

async function deleteWinner(
  resultId: string
) {

  const confirmed =
    window.confirm(
      "¿Eliminar ganador?"
    )

  if (!confirmed) {
    return
  }

  try {

    const {
      data: { session }
    } =
      await supabase.auth.getSession()

    const response =
      await fetch(
        `/api/admin/raffles/results/${resultId}`,
        {
          method: "DELETE",

          headers: {

            Authorization:
              `Bearer ${session?.access_token}`

          }
        }
      )

    if (!response.ok) {

      alert(
        "Error eliminando ganador"
      )

      return
    }

    await loadResults()

  } catch (error) {

    console.error(error)

  }
}

async function registerWinner() {

  try {

    setLoading(true)

    const {
      data: { session }
    } =
      await supabase.auth.getSession()

    const response =
      await fetch(
        "/api/admin/raffles/results",
        {
          method: "POST",

          headers: {

            "Content-Type":
              "application/json",

            Authorization:
              `Bearer ${session?.access_token}`

          },

          body: JSON.stringify({

            raffle_id:
              raffleId,

            ticket_code:
              ticketCode,

            prize_position:
              Number(
                prizePosition
              ),

            prize_title:
              prizeTitle,

            visibility_mode:
              visibilityMode

          })
        }
      )

    const json =
      await response.json()

    if (!response.ok) {

      alert(
        json.error ||
        "Error"
      )

      return
    }

    alert(
      "Ganador registrado correctamente"
    )

    await loadResults()

    setTicketCode("")
    setPrizeTitle("")
    setPrizePosition(1)

  } catch (error) {

    console.error(error)

    alert(
      "Error inesperado"
    )

  } finally {

    setLoading(false)

  }
}

  return (

    <div className="p-6 space-y-6">

      <div>

        <h1 className="text-3xl font-bold">

          Registro de Ganadores

        </h1>

        <p className="text-slate-400 mt-2">

          Sorteo:
          {" "}
          {raffleId}

        </p>

      </div>

      <div
        className="
          bg-slate-900
          border
          border-slate-800
          rounded-2xl
          p-6
          space-y-4
        "
      >

        <div>

          <label>

            Ticket ganador

          </label>

          <input

            value={ticketCode}

            onChange={e =>
              setTicketCode(
                e.target.value
              )
            }

            className="
              w-full
              mt-2
              px-4
              py-3
              rounded-xl
              bg-slate-950
              border
              border-slate-700
            "

            placeholder="desdecero/00115"
          />

        </div>

        <div>

          <label>

            Premio

          </label>

          <input

            value={prizeTitle}

            onChange={e =>
              setPrizeTitle(
                e.target.value
              )
            }

            className="
              w-full
              mt-2
              px-4
              py-3
              rounded-xl
              bg-slate-950
              border
              border-slate-700
            "

            placeholder="Primer Premio"
          />

        </div>

        <div>

          <label>

            Posición

          </label>

          <input

            type="number"

            min={1}

            value={prizePosition}

            onChange={e =>
              setPrizePosition(
                Number(
                  e.target.value
                )
              )
            }

            className="
              w-full
              mt-2
              px-4
              py-3
              rounded-xl
              bg-slate-950
              border
              border-slate-700
            "
          />

        </div>

        <div>

          <label>

            Visibilidad

          </label>

          <select

            value={visibilityMode}

            onChange={e =>
              setVisibilityMode(
                e.target.value
              )
            }

            className="
              w-full
              mt-2
              px-4
              py-3
              rounded-xl
              bg-slate-950
              border
              border-slate-700
            "
          >

            <option value="public">

              Publico

            </option>

            <option value="hidden">

              Oculto

            </option>

          </select>

        </div>

        <button

          disabled={loading}

          onClick={registerWinner}

          className="
            bg-green-600
            hover:bg-green-500
            px-5
            py-3
            rounded-xl
            disabled:opacity-50
          "
        >

          {loading
            ? "Guardando..."
            : "Registrar Ganador"}

        </button>

      </div>

      <div
        className="
          bg-slate-900
          border
          border-slate-800
          rounded-2xl
          p-6
        "
      >

        <h2
          className="
            text-xl
            font-bold
            mb-4
          "
        >
          Ganadores Registrados
        </h2>

        {loadingResults && (

          <p>
            Cargando...
          </p>

        )}

        {!loadingResults &&
          results.length === 0 && (

          <p>
            Sin ganadores registrados
          </p>

        )}

        {!loadingResults &&
          results.map(result => (

            <div
              key={result.id}
              className="
                border-b
                border-slate-800
                py-4
              "
            >

              <div>

                <strong>
                  {result.prize_title}
                </strong>

              </div>

              <div>

                Ticket:
                {" "}
                {result.ticket_code}

              </div>

              <div>

                Posición:
                {" "}
                {result.prize_position}

              </div>

              <div>

                Ganador:
                {" "}
                {result.winner_name}

              </div>

              <div>

                Visibilidad:
                {" "}
                {result.visibility_mode}

              </div>

<div>

  Entrega:
  {" "}
  {result.delivery_status || "pending"}

</div>

<div>

  Notas:
  {" "}
  {result.delivery_notes || "-"}

</div>
                
              <div
  className="
    flex
    gap-2
    mt-3
  "
>

  {result.visibility_mode === "hidden" ? (

    <button

      onClick={() =>
        updateVisibility(
          result.id,
          "public"
        )
      }

      className="
        bg-green-600
        hover:bg-green-500
        px-3
        py-2
        rounded-lg
      "
    >

      Hacer Público

    </button>

  ) : (

    <button

      onClick={() =>
        updateVisibility(
          result.id,
          "hidden"
        )
      }

      className="
        bg-yellow-600
        hover:bg-yellow-500
        px-3
        py-2
        rounded-lg
      "
    >

      Ocultar

    </button>

  )}

  <button

    onClick={() =>
      deleteWinner(
        result.id
      )
    }

    className="
      bg-red-600
      hover:bg-red-500
      px-3
      py-2
      rounded-lg
    "
  >

    Eliminar

  </button>

</div>

            </div>

          ))}

            </div>

    </div>

  )

}