"use client"

import { useEffect, useState } from "react"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default function BankPage() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const [form, setForm] = useState({
    bank_name: "",
    account_number: "",
    account_type: "",
    holder_name: "",
    country: "",
    swift: "",
    iban: "",
  })

  const [message, setMessage] = useState("")

  /* =========================
     🔐 GET USER + DATA
  ========================= */
  useEffect(() => {
    const loadData = async () => {
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        setLoading(false)
        return
      }

      const email = user.email!

      const { data } = await supabase
        .from("bank_accounts")
        .select("*")
        .eq("user_email", email)
        .maybeSingle()

      if (data) {
        setForm({
          bank_name: data.bank_name || "",
          account_number: data.account_number || "",
          account_type: data.account_type || "",
          holder_name: data.holder_name || "",
          country: data.country || "",
          swift: data.swift || "",
          iban: data.iban || "",
        })
      }

      setLoading(false)
    }

    loadData()
  }, [])

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
     💾 SAVE DATA
  ========================= */
  const handleSave = async () => {
    setSaving(true)
    setMessage("")

    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      setMessage("No autenticado")
      setSaving(false)
      return
    }

    const email = user.email!

    // check existing
    const { data: existing } = await supabase
      .from("bank_accounts")
      .select("id")
      .eq("user_email", email)
      .maybeSingle()

    if (existing) {
      await supabase
        .from("bank_accounts")
        .update({
          ...form,
        })
        .eq("user_email", email)
    } else {
      await supabase.from("bank_accounts").insert({
        user_email: email,
        ...form,
      })
    }

    setMessage("✅ Datos guardados correctamente")
    setSaving(false)
  }

  if (loading) {
    return <div className="p-6">Cargando...</div>
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto p-6">

        <h1 className="text-2xl font-bold mb-6">
          🏦 Datos Bancarios
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
            name="bank_name"
            placeholder="Banco"
            value={form.bank_name}
            onChange={handleChange}
            className="border p-3 rounded-xl"
          />

          <input
            name="account_number"
            placeholder="Número de cuenta"
            value={form.account_number}
            onChange={handleChange}
            className="border p-3 rounded-xl"
          />

          <input
            name="account_type"
            placeholder="Tipo de cuenta (corriente, ahorro)"
            value={form.account_type}
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
            className="bg-black text-white p-3 rounded-xl hover:opacity-90"
          >
            {saving ? "Guardando..." : "Guardar datos"}
          </button>

          {message && (
            <p className="text-green-600 text-sm">{message}</p>
          )}

        </div>

      </div>
    </div>
  )
}