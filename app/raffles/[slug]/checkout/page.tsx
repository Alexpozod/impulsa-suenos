"use client"

import {
  useEffect,
  useState
} from "react"

import {
  useParams
} from "next/navigation"

type RaffleData = {
  id: string
  slug: string
  title: string
  prize_title: string
  cover_image: string
  ticket_price_clp: number
}

export default function CheckoutPage() {

  const params = useParams()

  const [raffle, setRaffle] =
    useState<RaffleData | null>(null)

  const [loading, setLoading] =
    useState(true)

  const [quantity, setQuantity] =
    useState(1)

  const [buyerName, setBuyerName] =
    useState("")

  const [buyerEmail, setBuyerEmail] =
    useState("")

  const [buyerPhone, setBuyerPhone] =
    useState("")

    const [processing, setProcessing] =
  useState(false)

    const [acceptTerms, setAcceptTerms] =
  useState(false)

const [marketingConsent, setMarketingConsent] =
  useState(false)

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

      setRaffle(
        json?.raffle || null
      )

    } catch (error) {

      console.error(error)

    } finally {

      setLoading(false)

    }

  }

async function buyTickets() {

    console.log("BOTON PRESIONADO")

  if (!raffle?.id) {
    return
  }

  if (!buyerName.trim()) {

    alert("Ingresa tu nombre")

    return
  }

  if (!buyerEmail.trim()) {

    alert("Ingresa tu correo")

    return
  }

  if (!buyerPhone.trim()) {

    alert(
      "Ingresa tu teléfono"
    )

    return
  }

  if (!acceptTerms) {

  alert(
    "Debes aceptar las bases del sorteo"
  )

  return
}

try {

  setProcessing(true)

  const res =
    await fetch(
      "/api/raffles/create-payment",
      {
        method: "POST",

        headers: {
          "Content-Type":
            "application/json"
        },

        body: JSON.stringify({

          raffle_id:
            raffle.id,

          quantity,

          buyer_name:
            buyerName,

          buyer_email:
            buyerEmail,

          buyer_phone:
            buyerPhone,

          source:
            "web"

        })
      }
    )

  const json =
  await res.json()

console.log(
  "CHECKOUT RESPONSE",
  json
)

if (json?.url) {

  localStorage.setItem(
    "last_raffle_order_id",
    json.order_id
  )

  window.location.href =
    `${json.url}?token=${json.token}`

  return
}

if (!res.ok) {

  if (
    json?.error ===
    "pending_order_exists"
  ) {

    alert(
      "Ya tienes una compra pendiente asociada a este correo."
    )

    return
  }

  if (
    json?.error ===
    "rate_limit"
  ) {

    alert(
      "Demasiadas solicitudes. Intenta nuevamente en unos minutos."
    )

    return
  }

  alert(
    "No fue posible iniciar el pago."
  )

  return
}

} catch (error) {

  console.error(error)

} finally {

  setProcessing(false)

}

}

  if (loading) {

    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center">
        Cargando checkout...
      </div>
    )

  }

  if (!raffle) {

    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center">
        Sorteo no encontrado
      </div>
    )

  }

  return (

    <div className="min-h-screen bg-slate-950 text-white py-12 px-4">

      <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-8">

        <div>

          <img
            src={raffle.cover_image}
            alt={raffle.title}
            className="
              w-full
              rounded-3xl
              border
              border-slate-800
            "
          />

        </div>

        <div
  className="
    bg-slate-900
    border
    border-slate-800
    rounded-3xl
    p-6
    max-w-xl
  "
>

          <p className="text-blue-400 font-semibold mb-2">
            Checkout Seguro
          </p>

          <h1 className="text-3xl lg:text-4xl font-black mb-4">
            {raffle.title}
          </h1>

          <p className="text-slate-300 mb-6">
            {raffle.prize_title}
          </p>

          <div
            className="
              bg-slate-950
              border
              border-slate-800
              rounded-2xl
              p-4
            "
          >

            <div className="text-slate-400 text-sm">
              Valor Ticket
            </div>

            <div className="text-3xl font-black mt-2 mb-6">
              $
              {Number(
                raffle.ticket_price_clp
              ).toLocaleString("es-CL")}
            </div>

            <div className="grid grid-cols-2 gap-2">

              {[1, 3, 5, 10].map((value) => {

                const active =
                  quantity === value

                return (

                  <button
                    key={value}
                    type="button"
                    onClick={() =>
                      setQuantity(value)
                    }
                    className={`
                      py-3
                      rounded-2xl
                      border
                      font-bold

                      ${
                        active
                          ? "bg-blue-600 border-blue-500 text-white"
                          : "bg-slate-900 border-slate-700 text-slate-300"
                      }
                    `}
                  >

  <>
  <div className="text-sm">

    {
      value === 1
        ? "Básico"

        : value === 3
        ? "Popular ⭐"

        : value === 5
        ? "Recomendado 🔥"

        : "Premium 👑"
    }

  </div>

  <div className="text-xs opacity-70 mt-1">

    {value} ticket{value > 1 ? "s" : ""}

  </div>

</>

</button>

                )

              })}

            </div>

            <div
              className="
                mt-6
                border
                border-slate-800
                rounded-2xl
                p-4
              "
            >

<div className="flex justify-between text-slate-400 mb-2">

  <span>
    Valor ticket
  </span>

  <span>

    $
    {Number(
      raffle.ticket_price_clp
    ).toLocaleString("es-CL")}

  </span>

</div>

              <div className="flex justify-between text-slate-400">

                <span>
                  Cantidad
                </span>

                <span>
                  {quantity}
                </span>

              </div>

              <div className="flex justify-between text-xl font-black mt-2">

                <span>
                  Total
                </span>

                <span>

                  $
                  {(
                    Number(
                      raffle.ticket_price_clp
                    ) * quantity
                  ).toLocaleString("es-CL")}

                </span>

              </div>

            </div>

          </div>

<div
  className="
    mt-6
    bg-slate-950
    border
    border-slate-800
    rounded-2xl
    p-4
    space-y-3
  "
>

  <div>
    ✓ Pago seguro mediante Flow
  </div>

  <div>
    ✓ Tickets asignados automáticamente
  </div>

  <div>
    ✓ Confirmación enviada por correo
  </div>

  <div>
    ✓ Ganadores públicos y verificables
  </div>

</div>

          <div
            className="
              mt-8
              bg-slate-950
              border
              border-slate-800
              rounded-2xl
              p-4
              space-y-3
            "
          >

            <h3 className="text-lg font-bold">
              Datos del Participante
            </h3>

            <input
              type="text"
              placeholder="Nombre completo"
              value={buyerName}
              onChange={(e) =>
                setBuyerName(
                  e.target.value
                )
              }
              className="
                w-full
                bg-slate-900
                border
                border-slate-700
                rounded-2xl
                px-4
                py-3
              "
            />

            <input
              type="email"
              placeholder="Correo electrónico"
              value={buyerEmail}
              onChange={(e) =>
                setBuyerEmail(
                  e.target.value
                )
              }
              className="
                w-full
                bg-slate-900
                border
                border-slate-700
                rounded-2xl
                px-4
                py-3
              "
            />

            <input
              type="tel"
              placeholder="Teléfono móvil"
              value={buyerPhone}
              onChange={(e) =>
                setBuyerPhone(
                  e.target.value
                )
              }
              className="
                w-full
                bg-slate-900
                border
                border-slate-700
                rounded-2xl
                px-4
                py-3
              "
            />

            <div
  className="
    pt-4
    border-t
    border-slate-800
    space-y-3
  "
>

  <label
    className="
      flex
      gap-3
      items-start
      text-sm
      text-slate-300
    "
  >

    <input
      type="checkbox"
      checked={acceptTerms}
      onChange={(e) =>
        setAcceptTerms(
          e.target.checked
        )
      }
    />

    <span>
      He leído y acepto las bases,
      términos y condiciones del sorteo.
    </span>

  </label>

  <label
    className="
      flex
      gap-3
      items-start
      text-sm
      text-slate-400
    "
  >

    <input
      type="checkbox"
      checked={marketingConsent}
      onChange={(e) =>
        setMarketingConsent(
          e.target.checked
        )
      }
    />

    <span>
      Deseo recibir novedades
      y futuros sorteos.
    </span>

  </label>

<button
  type="button"
  onClick={buyTickets}
  className="
    w-full
    mt-4
    py-4
    rounded-2xl
    bg-blue-600
    hover:bg-blue-500
    transition
    font-black
    text-lg
  "
>

  Participar Ahora

</button>

</div>

          </div>

        </div>

      </div>

    </div>

  )

}