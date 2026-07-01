"use client"

import {
  useEffect,
  useState
} from "react"

import { supabase }
from "@/src/lib/supabase"

export default function PayoutsPage() {

  const [loading, setLoading] =
    useState(true)

  const [requesting, setRequesting] =
    useState(false)

    const [sendingOtp, setSendingOtp] =
  useState(false)

const [validatingOtp, setValidatingOtp] =
  useState(false)

const [otpVerified, setOtpVerified] =
  useState(false)

const [otp, setOtp] =
  useState("")

  const [wallet, setWallet] =
    useState<any>(null)

  const [requests, setRequests] =
    useState<any[]>([])

  useEffect(() => {

    loadData()

  }, [])

  async function loadData() {

    try {

      const {
        data: { session }
      } =
        await supabase.auth.getSession()

      const res =
        await fetch(
          "/api/raffles/partners/payouts",
          {
            headers: {
              Authorization:
                `Bearer ${session?.access_token}`
            }
          }
        )

      const json =
        await res.json()

      if (!json.ok) {

        return

      }

      setWallet(
        json.wallet
      )

      setRequests(
        json.requests || []
      )

    } catch (error) {

      console.error(error)

    } finally {

      setLoading(false)

    }

  }

async function sendOtp() {

  try {

    setSendingOtp(true)

    const {
      data: { user }
    } =
      await supabase.auth.getUser()

    const res =
      await fetch(
        "/api/otp/send",
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json"
          },

          body: JSON.stringify({

            email:
              user?.email

          })
        }
      )

    const json =
      await res.json()

    if (!res.ok) {

      alert(
        json?.error ||
        "No fue posible enviar OTP."
      )

      return

    }

    alert(
      "Código enviado a tu correo."
    )

  } catch {

    alert(
      "Error enviando OTP."
    )

  } finally {

    setSendingOtp(false)

  }

}

async function validateOtp() {

  if (!otp.trim()) {

    alert(
      "Ingresa el OTP."
    )

    return

  }

  try {

    setValidatingOtp(true)

    const {
      data: { session }
    } =
      await supabase.auth.getSession()

    const res =
      await fetch(
        "/api/otp/verify",
        {
          method: "POST",

          headers: {

            "Content-Type":
              "application/json",

            Authorization:
              `Bearer ${session?.access_token}`

          },

          body: JSON.stringify({

            code: otp

          })

        }
      )

    const json =
      await res.json()

    if (!res.ok) {

      alert(
        json?.error ||
        "OTP inválido."
      )

      return

    }

    setOtpVerified(true)

    alert(
      "OTP validado correctamente."
    )

  } catch {

    alert(
      "Error validando OTP."
    )

  } finally {

    setValidatingOtp(false)

  }

}
  
  async function requestPayout() {

    console.log("REQUEST_PAYOUT_CLICK")

if (!otpVerified) {

  alert(
    "Debes validar OTP antes de solicitar un retiro."
  )

  return

}

    const confirmAction =
      confirm(
        "¿Solicitar retiro de saldo disponible?"
      )

    if (!confirmAction) {

      return

    }

    try {

      setRequesting(true)

      const {
        data: { session }
      } =
        await supabase.auth.getSession()

      const res =
        await fetch(
  "/api/raffles/partners/payouts",
  {
    method:"POST",

    headers:{

      "Content-Type":
        "application/json",

      Authorization:
        `Bearer ${session?.access_token}`

    },

    body: JSON.stringify({

      otp

    })

  }
)

      const json =
        await res.json()

        console.log(
  "PAYOUT_RESPONSE",
  json
)

      if (!json.ok) {

  if (json.error === "minimum_not_reached") {

    alert(
`El monto mínimo para solicitar un retiro es de $15.000 CLP.

Todas las solicitudes de retiro son revisadas manualmente.

El tiempo estimado de procesamiento es de 24 a 72 horas hábiles.`
    )

    return

  }

  alert(
    json.error ||
    "No fue posible crear la solicitud."
  )

  return

}

      alert(
        "Solicitud enviada correctamente."
      )

      setOtp("")
setOtpVerified(false)

      await loadData()

    } catch (error) {

      console.error(error)

      alert(
        "Error procesando solicitud."
      )

    } finally {

      setRequesting(false)

    }

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
          💰 Retiros
        </h1>

        <p
          className="
            text-slate-500
            mt-2
          "
        >
          Gestiona tus comisiones y solicitudes de pago.
        </p>

      </div>

      <div
        className="
          grid
          md:grid-cols-4
          gap-4
        "
      >

        <Card
          title="Disponible"
          value={`$${Number(
            wallet?.available || 0
          ).toLocaleString("es-CL")}`}
        />

        <Card
          title="Generado"
          value={`$${Number(
            wallet?.generated || 0
          ).toLocaleString("es-CL")}`}
        />

        <Card
          title="Pagado"
          value={`$${Number(
            wallet?.paid || 0
          ).toLocaleString("es-CL")}`}
        />

        <Card
          title="Pendiente"
          value={`$${Number(
            wallet?.pending || 0
          ).toLocaleString("es-CL")}`}
        />

      </div>

      <div
        className="
          bg-white
          rounded-3xl
          border
          p-6
        "
      >

        <div
          className="
            flex
            items-center
            justify-between
          "
        >

          <div>

            <h2
              className="
                text-xl
                font-black
              "
            >
<div
  className="
    mb-6
    flex
    flex-wrap
    gap-3
    items-center
  "
>

  <button
    type="button"
    onClick={sendOtp}
    disabled={sendingOtp}
    className="
      px-5
      py-3
      rounded-2xl
      text-white
      font-semibold

      bg-gradient-to-r
      from-blue-600
      via-purple-600
      to-cyan-500
    "
  >

    {
      sendingOtp

      ? "Enviando..."

      : "Solicitar OTP"
    }

  </button>

  <input
    type="text"
    maxLength={6}
    placeholder="Código OTP"
    value={otp}
    onChange={(e)=>
      setOtp(
        e.target.value
      )
    }
    className="
      border
      rounded-2xl
      px-4
      py-3
    "
  />

  <button
    type="button"
    onClick={validateOtp}
    disabled={
      validatingOtp ||
      otp.length !== 6
    }
    className="
      px-5
      py-3
      rounded-2xl
      border
      font-semibold
    "
  >

    {
      validatingOtp

      ? "Validando..."

      : "Validar OTP"
    }

  </button>

  {

    otpVerified && (

      <span
        className="
          text-emerald-600
          font-semibold
        "
      >
        ✅ OTP Validado
      </span>

    )

  }

</div>

              Solicitar Retiro
            </h2>

            <p
              className="
                text-sm
                text-slate-500
                mt-1
              "
            >
              Disponible:
              {" "}
              ${Number(
                wallet?.available || 0
              ).toLocaleString("es-CL")}
            </p>

            <div
  className="
    mt-5
    rounded-2xl
    border
    border-amber-200
    bg-amber-50
    p-4
  "
>

  <div className="font-semibold text-amber-900">
    Información importante
  </div>

  <div
    className="
      mt-2
      text-sm
      text-amber-800
      space-y-1
    "
  >

    <div>
      • El monto mínimo para solicitar un retiro es de <strong>$15.000 CLP</strong>.
    </div>

    <div>
      • Todas las solicitudes de retiro son revisadas manualmente.
    </div>

    <div>
      • El plazo estimado de procesamiento es de <strong>24 a 72 horas hábiles</strong>.
    </div>

  </div>

</div>

          </div>

          <button
            onClick={requestPayout}
            disabled={
              requesting ||
              Number(
                wallet?.available || 0
              ) <= 0
            }
            className="
              px-6
              py-3
              rounded-2xl
              text-white
              font-bold

              bg-gradient-to-r
              from-blue-600
              via-purple-600
              to-cyan-500
            "
          >

            {
              requesting

              ? "Procesando..."

              : "Solicitar Retiro"
            }

          </button>

        </div>

      </div>

      <div
        className="
          bg-white
          rounded-3xl
          border
          overflow-hidden
        "
      >

        <div
          className="
            p-6
            border-b
          "
        >

          <h2
            className="
              text-xl
              font-black
            "
          >
            Historial
          </h2>

        </div>

        {

          requests.length === 0 && (

            <div
              className="
                p-8
                text-center
                text-slate-500
              "
            >
              No existen solicitudes.
            </div>

          )

        }

        {

          requests.map(
            (item) => (

              <div
                key={item.id}
                className="
                  p-5
                  border-b
                  flex
                  justify-between
                  items-center
                "
              >

                <div>

                  <div
                    className="
                      font-bold
                    "
                  >
                    $
                    {Number(
                      item.amount_clp || 0
                    ).toLocaleString("es-CL")}
                  </div>

                  <div
                    className="
                      text-xs
                      text-slate-500
                    "
                  >
                    {
                      new Date(
                        item.created_at
                      ).toLocaleString(
                        "es-CL"
                      )
                    }
                  </div>

                </div>

                <StatusBadge
                  status={
                    item.status
                  }
                />

              </div>

            )
          )

        }

      </div>

    </div>

  )

}

function Card({

  title,

  value

}: any) {

  return (

    <div
      className="
        bg-white
        border
        rounded-3xl
        p-6
      "
    >

      <div
        className="
          text-sm
          text-slate-500
        "
      >
        {title}
      </div>

      <div
        className="
          mt-2
          text-2xl
          font-black
        "
      >
        {value}
      </div>

    </div>

  )

}

function StatusBadge({

  status

}: any) {

  if (
    status === "approved"
  ) {

    return (

      <span
        className="
          px-3
          py-1
          rounded-full
          bg-emerald-100
          text-emerald-700
          text-xs
          font-semibold
        "
      >
        Aprobado
      </span>

    )

  }

  if (
    status === "rejected"
  ) {

    return (

      <span
        className="
          px-3
          py-1
          rounded-full
          bg-red-100
          text-red-700
          text-xs
          font-semibold
        "
      >
        Rechazado
      </span>

    )

  }

  return (

    <span
      className="
        px-3
        py-1
        rounded-full
        bg-amber-100
        text-amber-700
        text-xs
        font-semibold
      "
    >
      Pendiente
    </span>

  )

}