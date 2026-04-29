"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/src/lib/supabase"

export default function BankPage() {

  const router = useRouter()

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const [accounts, setAccounts] = useState<any[]>([])
  const [editingId, setEditingId] = useState<string | null>(null)

  const [otp, setOtp] = useState("")
  const [otpSent, setOtpSent] = useState(false)
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null)

  const emptyForm = {
    holder_name: "",
    bank_name: "",
    account_number: "",
    account_type: "",
    country: "Chile",
    rut: "", // 🔥 se mantiene para compatibilidad
    document_type: "",
    document_number: "",
    swift: "",
    iban: "",
  }

  const [form, setForm] = useState<any>(emptyForm)

  const [message, setMessage] = useState("")
  const [error, setError] = useState("")

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    const { data } = await supabase.auth.getUser()

    if (!data.user) {
      router.push("/login")
      return
    }

    const email = data.user.email!.toLowerCase()

    const { data: banks } = await supabase
      .from("bank_accounts")
      .select("*")
      .eq("user_email", email)
      .order("created_at", { ascending: false })

    setAccounts(banks || [])
    setLoading(false)
  }

  const handleChange = (e: any) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    })
  }

  /* =========================
     🔐 VALIDACIONES PRO
  ========================= */
  const validate = () => {
    if (!form.holder_name) return "Nombre requerido"
    if (!form.bank_name) return "Banco requerido"
    if (!form.account_number) return "Número de cuenta requerido"
    if (!form.account_type) return "Tipo requerido"
    if (!form.document_type) return "Tipo de documento requerido"
    if (!form.document_number) return "Documento requerido"

    // Validación RUT solo si aplica
    if (form.document_type === "rut") {
      if (!validateRUT(form.document_number)) {
        return "RUT inválido"
      }
    }

    return null
  }

  /* =========================
     🇨🇱 VALIDAR RUT
  ========================= */
  function validateRUT(rut: string) {
    rut = rut.replace(/\./g, "").replace("-", "")

    const body = rut.slice(0, -1)
    const dv = rut.slice(-1).toUpperCase()

    let sum = 0
    let multiplier = 2

    for (let i = body.length - 1; i >= 0; i--) {
      sum += Number(body[i]) * multiplier
      multiplier = multiplier === 7 ? 2 : multiplier + 1
    }

    const expectedDV = 11 - (sum % 11)

    const dvCalc =
      expectedDV === 11 ? "0" :
      expectedDV === 10 ? "K" :
      String(expectedDV)

    return dvCalc === dv
  }

  /* =========================
     🔐 OTP
  ========================= */
  const sendOtp = async () => {
    const { data } = await supabase.auth.getUser()

    await fetch("/api/otp/send", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        email: data.user?.email,
        type: "bank"
      })
    })

    setOtpSent(true)
    setMessage("📩 Código enviado")
  }

  /* =========================
     💾 UPDATE
  ========================= */
  const handleSave = async () => {

    setError("")
    setMessage("")

    const validationError = validate()
    if (validationError) return setError(validationError)

    if (!otp) return setError("Debes ingresar el OTP")

    setSaving(true)

    try {
      const { data: sessionData } = await supabase.auth.getSession()
      const token = sessionData?.session?.access_token

      const res = await fetch("/api/bank/update", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          bank_id: editingId,
          ...form,
          otp_code: otp
        })
      })

      const data = await res.json()

      if (!res.ok) return setError(data.error)

      setMessage("✅ Cuenta actualizada")
      setEditingId(null)
      setForm(emptyForm)
      setOtp("")
      setOtpSent(false)

      await loadData()

    } catch {
      setError("Error guardando")
    }

    setSaving(false)
  }

  /* =========================
     ⭐ SET DEFAULT (UX PRO)
  ========================= */
  const setDefault = async (id: string) => {

    if (!otp) {
      setError("Primero envía e ingresa el código OTP")
      return
    }

    const { data: sessionData } = await supabase.auth.getSession()
    const token = sessionData?.session?.access_token

    const res = await fetch("/api/bank/update", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({
        bank_id: id,
        is_default: true,
        otp_code: otp
      })
    })

    const data = await res.json()

    if (!res.ok) {
      setError(data.error)
      return
    }

    setMessage("✅ Cuenta principal actualizada")
    setOtp("")
    setOtpSent(false)

    await loadData()
  }

  /* =========================
     🗑 DELETE
  ========================= */
  const handleDelete = async () => {

    if (!confirmDeleteId) return
    if (!otp) return setError("Debes ingresar OTP")

    const { data: sessionData } = await supabase.auth.getSession()
    const token = sessionData?.session?.access_token

    const res = await fetch("/api/bank/delete", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({
        bank_id: confirmDeleteId,
        otp_code: otp
      })
    })

    const data = await res.json()

    if (!res.ok) return setError(data.error)

    setConfirmDeleteId(null)
    setOtp("")
    await loadData()
  }

  const handleEdit = (acc: any) => {
    setEditingId(acc.id)

    setForm({
      holder_name: acc.holder_name || "",
      bank_name: acc.bank_name || "",
      account_number: acc.account_number || "",
      account_type: acc.account_type || "",
      country: acc.country || "Chile",
      rut: acc.rut || "",
      document_type: acc.document_type || "",
      document_number: acc.document_number || "",
      swift: acc.swift || "",
      iban: acc.iban || "",
    })

    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  if (loading) return <div className="p-6">Cargando...</div>

  return (
    <div className="min-h-screen bg-gray-50">

      <div className="max-w-5xl mx-auto p-6 space-y-6">

        <h1 className="text-2xl font-bold">🏦 Cuentas bancarias</h1>

        {otpSent && (
          <p className="text-green-600 text-sm">
            📩 Código enviado a tu email
          </p>
        )}

        {/* LIST */}
        <div className="space-y-4">

          {accounts.map((acc) => (
            <div key={acc.id} className="bg-white p-5 rounded-2xl border flex justify-between items-center">

              <div>
                <p className="font-semibold flex items-center gap-2">
                  {acc.bank_name}
                  {acc.is_default && (
                    <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">
                      Principal
                    </span>
                  )}
                </p>

                <p className="text-sm text-gray-500">
                  **** {acc.account_number?.slice(-4)}
                </p>

                <p className="text-xs text-gray-400">{acc.account_type}</p>
              </div>

              <div className="flex gap-2">

                <button
                  onClick={() => handleEdit(acc)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg"
                >
                  Editar
                </button>

                <button
                  onClick={() => setConfirmDeleteId(acc.id)}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg"
                >
                  Eliminar
                </button>

                {!acc.is_default && (
                  <button
                    onClick={() => setDefault(acc.id)}
                    className="text-xs underline text-gray-500"
                  >
                    Hacer principal
                  </button>
                )}

              </div>

            </div>
          ))}

        </div>

        {/* FORM */}
        {editingId && (
          <div className="bg-white p-6 rounded-2xl border space-y-4">

            <h2 className="font-semibold">Editar cuenta</h2>

            <input name="holder_name" placeholder="Titular" value={form.holder_name} onChange={handleChange} className="input" />

            {/* DOCUMENTO */}
            <select name="document_type" value={form.document_type} onChange={handleChange} className="input">
              <option value="">Tipo documento</option>
              <option value="rut">RUT</option>
              <option value="dni">DNI</option>
              <option value="passport">Pasaporte</option>
            </select>

            <input name="document_number" placeholder="Número documento" value={form.document_number} onChange={handleChange} className="input" />

            <input name="bank_name" placeholder="Banco" value={form.bank_name} onChange={handleChange} className="input" />

            <select name="account_type" value={form.account_type} onChange={handleChange} className="input">
              <option value="">Tipo de cuenta</option>
              <option value="corriente">Cuenta corriente</option>
              <option value="vista">Cuenta vista</option>
              <option value="ahorro">Cuenta ahorro</option>
              <option value="checking">Checking</option>
              <option value="savings">Savings</option>
              <option value="business">Business</option>
            </select>

            <input name="account_number" placeholder="Número cuenta" value={form.account_number} onChange={handleChange} className="input" />

            {/* OTP */}
            <div className="flex gap-2">
              <input
                placeholder="Código OTP"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                className="input flex-1"
              />
              <button onClick={sendOtp} className="px-4 bg-gray-200 rounded-lg">
                Enviar
              </button>
            </div>

            <button
              onClick={handleSave}
              disabled={saving}
              className="w-full bg-green-600 text-white py-3 rounded-lg"
            >
              Guardar cambios
            </button>

          </div>
        )}

        {/* DELETE MODAL */}
        {confirmDeleteId && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center">
            <div className="bg-white p-6 rounded-xl w-full max-w-sm space-y-4">

              <h3 className="font-semibold">Confirmar eliminación</h3>

              <input
                placeholder="Código OTP"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                className="input"
              />

              <button onClick={sendOtp} className="w-full bg-gray-200 py-2 rounded">
                Enviar código
              </button>

              <button onClick={handleDelete} className="w-full bg-red-600 text-white py-2 rounded">
                Confirmar eliminación
              </button>

              <button onClick={() => setConfirmDeleteId(null)} className="w-full text-gray-500">
                Cancelar
              </button>

            </div>
          </div>
        )}

        {error && <p className="text-red-500 text-sm">{error}</p>}
        {message && <p className="text-green-600 text-sm">{message}</p>}

      </div>

      <style jsx>{`
        .input {
          border: 1px solid #e5e7eb;
          padding: 10px;
          border-radius: 10px;
          width: 100%;
        }
      `}</style>

    </div>
  )
}