"use client"

import {
  useEffect,
  useRef,
  useState
} from "react"

import { supabase }
from "@/src/lib/supabase"

const uncertainPayoutMessage =
  "No se pudo confirmar el retiro. Reintenta la misma solicitud para comprobar su resultado."

type Wallet = {
  available: number
  generated: number
  paid: number
  pending: number
}

type PayoutRequest = {
  id: string
  amount_clp: number
  status: string
  created_at: string
}

function payoutIntentStorageKey(userId: string) {
  return `raffles:payout-intent:${userId}`
}

function readPayoutIntent(storageKey: string): string | null {
  const stored = sessionStorage.getItem(storageKey)
  if (!stored) return null

  const intent = JSON.parse(stored)
  if (intent?.status !== "uncertain" || typeof intent.id !== "string") {
    throw new Error("Invalid payout intention")
  }

  return intent.id
}

export default function PayoutsPage() {

  const [loading, setLoading] =
    useState(true)

  const [requesting, setRequesting] =
    useState(false)

  const payoutInFlight = useRef(false)
  const [recoveryMessage, setRecoveryMessage] = useState<string | null>(null)

    const [sendingOtp, setSendingOtp] =
  useState(false)

const [validatingOtp, setValidatingOtp] =
  useState(false)

const [otpVerified, setOtpVerified] =
  useState(false)

const [otp, setOtp] =
  useState("")

  const [wallet, setWallet] =
    useState<Wallet | null>(null)

  const [requests, setRequests] =
    useState<PayoutRequest[]>([])

  useEffect(() => {

    void loadData(true)

  }, [])

  async function loadData(restoreIntent = false) {

    try {

      const {
        data: { session }
      } =
        await supabase.auth.getSession()

      if (restoreIntent && session?.user.id) {
        try {
          if (readPayoutIntent(payoutIntentStorageKey(session.user.id))) {
            setRecoveryMessage(uncertainPayoutMessage)
          }
        } catch {
          // Storage availability must not prevent the history from loading.
        }
      }

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

    const { data: { session } } = await supabase.auth.getSession()
    if (!session?.access_token) {
      alert("Inicia sesión para solicitar el código.")
      return
    }

    const res = await fetch(
      "/api/raffles/partners/otp/send",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`
        },
        body: JSON.stringify({})
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
  
  async function requestPayout(recover = false) {
    if (payoutInFlight.current) return

    if (!recover && !otpVerified) {
      alert("Debes validar OTP antes de solicitar un retiro.")
      return
    }

    if (!recover && !confirm("¿Solicitar retiro de saldo disponible?")) return

    payoutInFlight.current = true
    setRequesting(true)
    let submitted = false

    try {
      const { data: { session }, error } = await supabase.auth.getSession()
      if (error || !session?.access_token || !session.user.id) {
        alert("Inicia sesión para solicitar o recuperar un retiro.")
        return
      }

      const storageKey = payoutIntentStorageKey(session.user.id)
      const existingIntent = readPayoutIntent(storageKey)
      if (existingIntent && !recover) {
        setRecoveryMessage(uncertainPayoutMessage)
        return
      }
      if (recover && !existingIntent) {
        setRecoveryMessage(null)
        alert("No hay una solicitud por recuperar para esta cuenta.")
        return
      }

      const idempotencyKey = existingIntent ?? crypto.randomUUID()
      if (!existingIntent) {
        sessionStorage.setItem(storageKey, JSON.stringify({ id: idempotencyKey, status: "uncertain" }))
      }

      submitted = true
      const res = await fetch("/api/raffles/partners/payouts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
          "Idempotency-Key": idempotencyKey
        },
        body: JSON.stringify(otpVerified ? { otp: otp.trim() } : {})
      })
      const json = await res.json()

      if (!res.redirected && res.status === 200 && json?.ok === true &&
          typeof json.request?.id === "string" && json.request.id.length > 0) {
        sessionStorage.removeItem(storageKey)
        setRecoveryMessage(null)
        alert("Solicitud enviada correctamente.")
        setOtp("")
        setOtpVerified(false)
        await loadData()
        return
      }

      if (!res.redirected && res.status === 400 && json?.ok === false &&
          json.error === "invalid_otp") {
        setOtpVerified(false)
        if (recover) {
          setRecoveryMessage("Valida un OTP vigente y reintenta la misma solicitud.")
        } else {
          sessionStorage.removeItem(storageKey)
          alert("invalid_otp")
        }
        return
      }

      const confirmedRejection = json?.ok === false && !res.redirected && (
        (res.status === 400 &&
          ["minimum_not_reached", "pending_request_exists"].includes(json.error)) ||
        (res.status === 409 && ["payout_inconsistent", "payout_amount_not_representable"].includes(json.error)) ||
        (!recover && (
          (res.status === 400 && ["invalid_idempotency_key", "invalid_request"].includes(json.error)) ||
          (res.status === 404 && json.error === "affiliate_not_found")
        ))
      )

      if (confirmedRejection) {
        sessionStorage.removeItem(storageKey)
        setRecoveryMessage(null)
        if (json.error === "minimum_not_reached") {
          alert(`El monto mínimo para solicitar un retiro es de $15.000 CLP.

Todas las solicitudes de retiro son revisadas manualmente.

El tiempo estimado de procesamiento es de 24 a 72 horas hábiles.`)
        } else if (json.error === "pending_request_exists") {
          alert("Ya tienes una solicitud de retiro pendiente.")
          await loadData()
        } else {
          alert(json.error)
        }
        return
      }

      setRecoveryMessage(uncertainPayoutMessage)
    } catch {
      if (submitted) {
        setRecoveryMessage(uncertainPayoutMessage)
      } else {
        alert("No se pudo preparar la solicitud de retiro. Intenta nuevamente.")
      }
    } finally {
      payoutInFlight.current = false
      setRequesting(false)
    }
  }

  if (loading) {

    return (

      <div
        className="
          bg-[#EDE8FD]
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
          bg-[#EDE8FD]
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
            text-[#002314]
          "
        >
          💰 Retiros
        </h1>

        <p
          className="
            text-[#002314]
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
          bg-[#EDE8FD]
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

      bg-[#7048E8] text-white
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
    disabled={requesting || validatingOtp}
    onChange={(e) => {
      setOtp(e.target.value)
      setOtpVerified(false)
    }}
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
      requesting || validatingOtp ||
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
                text-[#002314]
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
            onClick={() => void requestPayout()}
            disabled={
              requesting || Boolean(recoveryMessage) ||
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

              bg-[#7048E8] text-white
            "
          >

            {
              requesting

              ? "Procesando..."

              : "Solicitar Retiro"
            }

          </button>

        </div>

        {recoveryMessage && (
          <div className="mt-4 space-y-2">
            <p role="alert" className="text-sm text-amber-800">{recoveryMessage}</p>
            <button
              type="button"
              onClick={() => void requestPayout(true)}
              disabled={requesting}
              className="rounded-2xl border px-5 py-3 font-semibold disabled:opacity-50"
            >
              Reintentar la misma solicitud
            </button>
          </div>
        )}

      </div>

      <div
        className="
          bg-[#EDE8FD]
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
                text-[#002314]
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
                      text-[#002314]
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

}: { title: string; value: string }) {

  return (

    <div
      className="
        bg-[#EDE8FD]
        border
        rounded-3xl
        p-6
      "
    >

      <div
        className="
          text-sm
          text-[#002314]
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

}: { status: string }) {

  if (
    status === "approved" || status === "paid"
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
        {status === "paid" ? "Pagado" : "Aprobado"}
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
