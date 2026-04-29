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

  const emptyForm = {
    holder_name: "",
    bank_name: "",
    account_number: "",
    account_type: "",
    country: "Chile",
    rut: "",
    swift: "",
    iban: "",
  }

  const [form, setForm] = useState(emptyForm)

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

    const { data: banks, error } = await supabase
      .from("bank_accounts")
      .select("*")
      .ilike("user_email", email)
      .order("created_at", { ascending: false })

    if (error) {
      console.error("❌ Error loading bank accounts:", error)
    }

    setAccounts(banks || [])
    setLoading(false)
  }

  const handleChange = (e: any) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    })
  }

  const validate = () => {
    if (!form.holder_name) return "Nombre requerido"
    if (!form.bank_name) return "Banco requerido"
    if (!form.account_number) return "Número de cuenta requerido"
    if (!form.account_type) return "Tipo de cuenta requerido"
    if (!form.rut) return "RUT requerido"
    return null
  }

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
      const email = data.user?.email?.toLowerCase()

      if (!email) throw new Error("No autenticado")

      if (!editingId && accounts.length >= 2) {
        setError("Solo puedes tener 2 cuentas. Edita o elimina una.")
        setSaving(false)
        return
      }

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

      let errorDb = null

      if (editingId) {
        const { error } = await supabase
          .from("bank_accounts")
          .update(payload)
          .eq("id", editingId)

        errorDb = error
      } else {
        const { error } = await supabase
          .from("bank_accounts")
          .insert(payload)

        errorDb = error
      }

      if (errorDb) throw errorDb

      setMessage("✅ Cuenta bancaria guardada correctamente")
      setForm(emptyForm)
      setEditingId(null)

      await loadData()

    } catch (err: any) {
      console.error("❌ Save error:", err)
      setError(err.message || "Error guardando datos")
    }

    setSaving(false)
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
      swift: acc.swift || "",
      iban: acc.iban || "",
    })

    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  const handleDelete = async (id: string) => {

    if (!confirm("¿Eliminar cuenta bancaria?")) return

    const { error } = await supabase
      .from("bank_accounts")
      .delete()
      .eq("id", id)

    if (error) {
      console.error("❌ Delete error:", error)
      return
    }

    await loadData()
  }

  if (loading) return <div className="p-6">Cargando...</div>

  return (
    <div className="min-h-screen bg-gray-50">

      <div className="max-w-5xl mx-auto p-6 space-y-8">

        {/* HEADER PRO */}
        <div className="bg-white p-6 rounded-2xl border shadow-sm">
          <h1 className="text-2xl font-bold">🏦 Cuentas bancarias</h1>
          <p className="text-sm text-gray-500 mt-1">
            Administra tus cuentas para retiros de fondos
          </p>
        </div>

        {/* ALERTA LIMITE */}
        {accounts.length >= 2 && !editingId && (
          <div className="bg-red-50 border border-red-200 text-red-600 p-3 rounded-lg text-sm">
            Ya tienes el máximo de 2 cuentas bancarias
          </div>
        )}

        {/* LISTADO */}
        <div className="grid gap-4">

          {accounts.map((acc) => (
            <div
              key={acc.id}
              className="bg-white p-5 rounded-2xl border shadow-sm flex justify-between items-center"
            >

              <div>
                <p className="font-semibold text-lg">{acc.bank_name}</p>
                <p className="text-sm text-gray-600">
                  **** {acc.account_number?.slice(-4)}
                </p>
                <p className="text-xs text-gray-400">
                  {acc.account_type} • {acc.country}
                </p>
              </div>

              <div className="flex gap-2">

                <button
                  onClick={() => handleEdit(acc)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 transition"
                >
                  Editar
                </button>

                <button
                  onClick={() => handleDelete(acc.id)}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm hover:bg-red-700 transition"
                >
                  Eliminar
                </button>

              </div>

            </div>
          ))}

        </div>

        {/* FORMULARIO PRO */}
        {(accounts.length < 2 || editingId) && (
          <div className="bg-white p-6 rounded-2xl border shadow-sm space-y-4">

            <h2 className="text-lg font-semibold">
              {editingId ? "✏️ Editar cuenta" : "➕ Nueva cuenta"}
            </h2>

            <div className="grid md:grid-cols-2 gap-4">

              <input name="holder_name" placeholder="Titular" value={form.holder_name} onChange={handleChange} className="input" />
              <input name="rut" placeholder="RUT / ID" value={form.rut} onChange={handleChange} className="input" />

              <input name="bank_name" placeholder="Banco" value={form.bank_name} onChange={handleChange} className="input" />

              <select name="account_type" value={form.account_type} onChange={handleChange} className="input">
                <option value="">Tipo de cuenta</option>
                <option value="corriente">Cuenta corriente</option>
                <option value="vista">Cuenta vista</option>
              </select>

              <input name="account_number" placeholder="Número de cuenta" value={form.account_number} onChange={handleChange} className="input" />

              <input name="country" placeholder="País" value={form.country} onChange={handleChange} className="input" />

              <input name="swift" placeholder="SWIFT (internacional)" value={form.swift} onChange={handleChange} className="input" />
              <input name="iban" placeholder="IBAN (internacional)" value={form.iban} onChange={handleChange} className="input" />

            </div>

            <button
              onClick={handleSave}
              disabled={saving}
              className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 transition"
            >
              {saving ? "Guardando..." : editingId ? "Actualizar cuenta" : "Guardar cuenta"}
            </button>

            {error && <p className="text-red-500 text-sm">{error}</p>}
            {message && <p className="text-green-600 text-sm">{message}</p>}

          </div>
        )}

      </div>

      {/* 🔥 ESTILO GLOBAL INPUT PRO */}
      <style jsx>{`
        .input {
          border: 1px solid #e5e7eb;
          padding: 10px;
          border-radius: 10px;
          width: 100%;
          font-size: 14px;
        }
        .input:focus {
          outline: none;
          border-color: #16a34a;
          box-shadow: 0 0 0 2px rgba(22,163,74,0.2);
        }
      `}</style>

    </div>
  )
}