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

      <p
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
      </p>

      <div
        className="
          grid
          md:grid-cols-2
          gap-4
        "
      >

        <input
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
        disabled={saving}
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