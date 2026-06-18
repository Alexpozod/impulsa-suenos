"use client"

import {
  useEffect,
  useState
} from "react"

import { supabase }
from "@/src/lib/supabase"

export default function ProfilePage() {

  const [loading, setLoading] =
    useState(true)

  const [saving, setSaving] =
    useState(false)

  const [sendingOtp, setSendingOtp] =
    useState(false)

  const [validatingOtp, setValidatingOtp] =
    useState(false)

  const [profileLocked, setProfileLocked] =
    useState(true)

  const [otpVerified, setOtpVerified] =
    useState(false)

  const [unlockUntil, setUnlockUntil] =
    useState("")

  const [otp, setOtp] =
    useState("")

  const [affiliateType, setAffiliateType] =
    useState("person")

  const [companyName, setCompanyName] =
    useState("")

  const [companyRut, setCompanyRut] =
    useState("")

  const [companyBusiness, setCompanyBusiness] =
    useState("")

  const [legalRepresentative,
  setLegalRepresentative] =
    useState("")

  const [companyEmail,
  setCompanyEmail] =
    useState("")

  const [firstName, setFirstName] =
    useState("")

  const [lastName, setLastName] =
    useState("")

  const [phone, setPhone] =
    useState("")

  const [rut, setRut] =
    useState("")

  const [bankName, setBankName] =
    useState("")

  const [accountType, setAccountType] =
    useState("")

  const [accountNumber, setAccountNumber] =
    useState("")

  const [accountHolder, setAccountHolder] =
    useState("")

  useEffect(() => {

    loadProfile()

  }, [])

  useEffect(() => {

  if (
    !unlockUntil ||
    profileLocked
  ) {
    return
  }

  const expiresAt =
    new Date(
      unlockUntil
    ).getTime()

  const now =
    Date.now()

  const ms =
    expiresAt - now

  if (ms <= 0) {

    setProfileLocked(true)

    return
  }

  const timer =
    setTimeout(() => {

      setProfileLocked(true)

      setOtp("")
      setOtpVerified(false)
      setUnlockUntil("")

    }, ms)

  return () =>
    clearTimeout(timer)

}, [
  unlockUntil,
  profileLocked
])

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

async function unlockProfile() {

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

    const verifyRes =
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

    const verifyJson =
      await verifyRes.json()

    if (!verifyRes.ok) {

      alert(
        verifyJson?.error ||
        "OTP inválido."
      )

      return

    }

    const unlockRes =
      await fetch(
        "/api/raffles/partners/profile/unlock",
        {
          method: "POST",

          headers: {

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

    const unlockJson =
      await unlockRes.json()

    if (!unlockJson.ok) {

      alert(
        unlockJson?.error ||
        "No fue posible desbloquear."
      )

      return

    }

    setProfileLocked(false)

    setOtpVerified(true)

    setUnlockUntil(
      unlockJson.unlockUntil
    )

    alert(
      "Perfil desbloqueado por 15 minutos."
    )

  } catch {

    alert(
      "Error validando OTP."
    )

  } finally {

    setValidatingOtp(false)

  }

}

  async function loadProfile() {

    try {

      const {
        data: { session }
      } =
        await supabase.auth.getSession()

      const res =
        await fetch(
          "/api/raffles/partners/profile",
          {
            headers: {
              Authorization:
                `Bearer ${session?.access_token}`
            }
          }
        )

      const json =
        await res.json()

      const profile =
        json?.profile

        setProfileLocked(
  profile?.profile_locked ??
  true
)

setUnlockUntil(
  profile?.edit_window_until ||
  ""
)

      if (!profile) {

        return

      }

      setAffiliateType(
  profile.affiliate_type ||
  "person"
)

setCompanyName(
  profile.company_name || ""
)

setCompanyRut(
  profile.company_rut || ""
)

setCompanyBusiness(
  profile.company_business || ""
)

setLegalRepresentative(
  profile.legal_representative || ""
)

setCompanyEmail(
  profile.company_email || ""
)

      setFirstName(
        profile.first_name || ""
      )

      setLastName(
        profile.last_name || ""
      )

      setPhone(
        profile.phone || ""
      )

      setRut(
        profile.rut || ""
      )

      setBankName(
        profile.bank_name || ""
      )

      setAccountType(
        profile.account_type || ""
      )

      setAccountNumber(
        profile.account_number || ""
      )

      setAccountHolder(
        profile.account_holder || ""
      )

    } catch (error) {

      console.error(error)

    } finally {

      setLoading(false)

    }

  }

  async function saveProfile() {

    if (profileLocked) {

  alert(
    "Debes validar OTP antes de modificar datos."
  )

  return

}

try {

  setSaving(true)

      const {
        data: { session }
      } =
        await supabase.auth.getSession()

      const res =
        await fetch(
          "/api/raffles/partners/profile",
          {
            method: "POST",

            headers: {

              "Content-Type":
                "application/json",

              Authorization:
                `Bearer ${session?.access_token}`

            },

            body: JSON.stringify({

affiliate_type:
  affiliateType,

company_name:
  companyName,

company_rut:
  companyRut,

company_business:
  companyBusiness,

legal_representative:
  legalRepresentative,

company_email:
  companyEmail,

              first_name:
                firstName,

              last_name:
                lastName,

              phone,

              rut,

              bank_name:
                bankName,

              account_type:
                accountType,

              account_number:
                accountNumber,

              account_holder:
                accountHolder

            })

          }
        )

      const json =
        await res.json()

      if (!json.ok) {

        alert(
          "No fue posible guardar los datos."
        )

        return

      }

      alert(
  "Datos guardados correctamente."
)

await loadProfile()

setProfileLocked(true)

setOtp("")

setOtpVerified(false)

setUnlockUntil("")

    } catch (error) {

      console.error(error)

      alert(
        "Error al guardar."
      )

    } finally {

      setSaving(false)

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

    <div
      className="
        bg-white
        rounded-3xl
        border
        shadow-sm
        p-8
      "
    >

      <h1
        className="
          text-4xl
          font-black
          text-slate-900
        "
      >
        👤 Perfil de Afiliado
      </h1>

      <div
  className="
    text-slate-500
    mt-2
    mb-8
  "
>
  Completa los datos necesarios para recibir tus comisiones.

  <div
  className="
    mt-6
    mb-8
    flex
    gap-3
  "
>

  <button
    disabled={profileLocked}
    type="button"
    onClick={() =>
      setAffiliateType(
        "person"
      )
    }
    className={`
      px-5
      py-3
      rounded-2xl
      font-semibold

      ${
        affiliateType === "person"

        ? "bg-gradient-to-r from-blue-600 via-purple-600 to-cyan-500 text-white"

        : "border"
      }
    `}
  >
    Persona Natural
  </button>

 <button
    disabled={profileLocked}
    type="button"
    onClick={() =>
      setAffiliateType(
        "company"
      )
    }
    className={`
      px-5
      py-3
      rounded-2xl
      font-semibold

      ${
        affiliateType === "company"

        ? "bg-gradient-to-r from-blue-600 via-purple-600 to-cyan-500 text-white"

        : "border"
      }
    `}
  >
    Empresa
  </button>

</div>

<div
  className="
    mb-8
    rounded-3xl
    border
    bg-slate-50
    p-5
  "
>

  <div
    className="
      flex
      items-center
      justify-between
      flex-wrap
      gap-4
    "
  >

    <div>

      <div className="font-black">

        {
          profileLocked

          ? "🔒 Perfil Protegido"

          : "✅ Perfil Desbloqueado"
        }

      </div>

      <div
        className="
          text-sm
          text-slate-500
          mt-1
        "
      >

        {
          profileLocked

          ? "Debes validar OTP para modificar tus datos."

          : "Puedes editar tus datos durante 15 minutos."
        }

      </div>

      {

        unlockUntil && !profileLocked && (

          <div
            className="
              text-xs
              text-emerald-600
              mt-2
            "
          >

            Disponible hasta:

            {" "}

            {new Date(
              unlockUntil
            ).toLocaleString("es-CL")}

          </div>

        )

      }

    </div>

    {

      profileLocked && (

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

      )

    }

  </div>

  {

    profileLocked && (

      <div
        className="
          mt-5
          flex
          gap-3
          flex-wrap
        "
      >

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
            min-w-[220px]
          "
        />

        <button
          type="button"
          onClick={unlockProfile}
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

      </div>

    )

  }

</div>

      <div
        className="
          grid
          md:grid-cols-2
          gap-4
        "
      >

        <input
          disabled={profileLocked}
          type="text"
          placeholder="Nombre"
          value={firstName}
          onChange={(e)=>
            setFirstName(
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

        <input
          disabled={profileLocked}
          type="text"
          placeholder="Apellido"
          value={lastName}
          onChange={(e)=>
            setLastName(
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

        <input
          disabled={profileLocked}
          type="text"
          placeholder="Teléfono"
          value={phone}
          onChange={(e)=>
            setPhone(
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

        <input
          disabled={profileLocked}
          type="text"
          placeholder="RUT"
          value={rut}
          onChange={(e)=>
            setRut(
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

      </div>

      <div
        className="
          mt-8
        "
      >

{
affiliateType === "company" && (

<div
  className="
    mb-8
  "
>

  <h2
    className="
      text-2xl
      font-black
      mb-4
    "
  >
    🏢 Datos Empresa
  </h2>

  <div
    className="
      grid
      md:grid-cols-2
      gap-4
    "
  >

    <input
    disabled={profileLocked}
      type="text"
      placeholder="Razón Social"
      value={companyName}
      onChange={(e)=>
        setCompanyName(
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

   <input
      disabled={profileLocked}
      type="text"
      placeholder="RUT Empresa"
      value={companyRut}
      onChange={(e)=>
        setCompanyRut(
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

    <input
      disabled={profileLocked}
      type="text"
      placeholder="Giro"
      value={companyBusiness}
      onChange={(e)=>
        setCompanyBusiness(
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

    <input
      disabled={profileLocked}
      type="email"
      placeholder="Correo Empresa"
      value={companyEmail}
      onChange={(e)=>
        setCompanyEmail(
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

    <input
      disabled={profileLocked}
      type="text"
      placeholder="Representante Legal"
      value={
        legalRepresentative
      }
      onChange={(e)=>
        setLegalRepresentative(
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

  </div>

</div>

)
}

        <h2
          className="
            text-2xl
            font-black
            mb-4
          "
        >
          💰 Datos Bancarios
        </h2>

        <div
          className="
            grid
            md:grid-cols-2
            gap-4
          "
        >

          <input
            disabled={profileLocked}
            type="text"
            placeholder="Banco"
            value={bankName}
            onChange={(e)=>
              setBankName(
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

          <input
            disabled={profileLocked}
            type="text"
            placeholder="Tipo de Cuenta"
            value={accountType}
            onChange={(e)=>
              setAccountType(
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

          <input
            disabled={profileLocked}
            type="text"
            placeholder="Número de Cuenta"
            value={accountNumber}
            onChange={(e)=>
              setAccountNumber(
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

          <input
            disabled={profileLocked}
            type="text"
            placeholder="Titular de la Cuenta"
            value={accountHolder}
            onChange={(e)=>
              setAccountHolder(
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

        </div>

      </div>

      <button
        type="button"
        onClick={saveProfile}
        disabled={
  saving ||
  profileLocked
}
        className="
          mt-8
          px-8
          py-4
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
          saving
            ? "Guardando..."
            : "Guardar Datos"
        }
      </button>

    </div>

  )

}