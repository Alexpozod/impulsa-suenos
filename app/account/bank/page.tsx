"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/src/lib/supabase"

export default function BankPage() {

  const router = useRouter()

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const [form, setForm] = useState({
    holder_name: "",
    bank_name: "",
    account_number: "",
    account_type: "",
    country: "Chile",
    rut: "",
    swift: "",
    iban: "",
  })

  const [message, setMessage] = useState("")
  const [error, setError] = useState("")

  /* =========================
     🔐 LOAD USER + DATA
  ========================= */
  useEffect(() => {
    const loadData = async () => {

      const { data } = await supabase.auth.getUser()

      if (!data.user) {
        router.push("/login")
        return
      }

      const email = data.user.email!

      const { data: bank } = await supabase
        .from("bank_accounts")
        .select("*")
        .eq("user_email", email)
        .maybeSingle()

      if (bank) {
        setForm({
          holder_name: bank.holder_name || "",
          bank_name: bank.bank_name || "",
          account_number: bank.account_number || "",
          account_type: bank.account_type || "",
          country: bank.country || "Chile",
          rut: bank.rut || "",
          swift: bank.swift || "",
          iban: bank.iban || "",
        })
      }

      setLoading(false)
    }

    loadData()
  }, [router])

  /* =========================
     ✏️ HANDLE CHANGE
  ========================= */
  const handleChange = (e: any) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    })
  }

  /* =========================
     🎯 VALIDACIÓN
  ========================= */
  const validate = () => {
    if (!form.holder_name) return "Nombre requerido"
    if (!form.bank_name) return "Banco requerido"
    if (!form.account_number) return "Número de cuenta requerido"
    if (!form.account_type) return "Tipo de cuenta requerido"
    if (!form.rut) return "RUT requerido"
    return null
  }

  /* =========================
     💾 SAVE DATA
  ========================= */
  const handleSave = async () => {

    setError("")
    setMessage("")

    const validationError = validate()

    if (validationError) {
      setError(validationError)
      return
    }

    setSaving(true)

    try {

      const { data } = await supabase.auth.getUser()

      if (!data.user) {
        setError("No autenticado")
        setSaving(false)
        return
      }

      const email = data.user.email!

      const payload = {
        user_email: email,
        holder_name: form.holder_name.trim(),
        bank_name: form.bank_name.trim(),
        account_number: form.account_number.trim(),
        account_type: form.account_type,
        country: form.country,
        rut: form.rut.trim(),
        swift: form.swift || null,
        iban: form.iban || null,
      }

      const { data: existing } = await supabase
        .from("bank_accounts")
        .select("id")
        .eq("user_email", email)
        .maybeSingle()

      let errorDb = null

      if (existing) {
        const { error } = await supabase
          .from("bank_accounts")
          .update(payload)
          .eq("user_email", email)

        errorDb = error
      } else {
        const { error } = await supabase
          .from("bank_accounts")
          .insert(payload)

        errorDb = error
      }

      if (errorDb) throw errorDb

      setMessage("✅ Cuenta bancaria guardada correctamente")

    } catch (err: any) {
      console.error(err)
      setError(err.message || "Error guardando datos")
    }

    setSaving(false)
  }

  /* =========================
     ⏳ LOADING
  ========================= */
  if (loading) {
    return <div className="p-6">Cargando...</div>
  }

  /* =========================
     UI
  ========================= */
  return (
    <div className="min-h-screen bg-gray-50">

      <div className="max-w-3xl mx-auto p-6">

        <h1 className="text-2xl font-bold mb-6">
          🏦 Cuenta bancaria
        </h1>

        <div className="bg-white p-6 rounded-2xl shadow-sm border flex flex-col gap-4">

          <input
            name="holder_name"
            placeholder="Nombre del titular"
            value={form.holder_name}
            onChange={handleChange}
            className="border p-3 rounded-xl"
          />

          <input
            name="rut"
            placeholder="RUT"
            value={form.rut}
            onChange={handleChange}
            className="border p-3 rounded-xl"
          />

          <input
            name="bank_name"
            placeholder="Banco"
            value={form.bank_name}
            onChange={handleChange}
            className="border p-3 rounded-xl"
          />

          <select
            name="account_type"
            value={form.account_type}
            onChange={handleChange}
            className="border p-3 rounded-xl"
          >
            <option value="">Tipo de cuenta</option>
            <option value="corriente">Cuenta corriente</option>
            <option value="vista">Cuenta vista</option>
          </select>

          <input
            name="account_number"
            placeholder="Número de cuenta"
            value={form.account_number}
            onChange={handleChange}
            className="border p-3 rounded-xl"
          />

          <input
            name="country"
            placeholder="País"
            value={form.country}
            onChange={handleChange}
            className="border p-3 rounded-xl"
          />

          <input
            name="swift"
            placeholder="SWIFT (opcional)"
            value={form.swift}
            onChange={handleChange}
            className="border p-3 rounded-xl"
          />

          <input
            name="iban"
            placeholder="IBAN (opcional)"
            value={form.iban}
            onChange={handleChange}
            className="border p-3 rounded-xl"
          />

          <button
            onClick={handleSave}
            disabled={saving}
            className="bg-green-600 text-white p-3 rounded-xl hover:bg-green-700"
          >
            {saving ? "Guardando..." : "Guardar cuenta"}
          </button>

          {error && (
            <p className="text-red-500 text-sm">{error}</p>
          )}

          {message && (
            <p className="text-green-600 text-sm">{message}</p>
          )}

        </div>

      </div>

    </div>
  )
}