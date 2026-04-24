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
      .ilike("user_email", email) // 🔥 FIX PRO
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

      console.log("💾 Saving bank account:", payload)

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

      console.log("✅ Bank account saved")

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

      <div className="max-w-4xl mx-auto p-6 space-y-8">

        <h1 className="text-2xl font-bold">
          🏦 Cuentas bancarias
        </h1>

        {accounts.length >= 2 && !editingId && (
          <p className="text-red-500 text-sm">
            Ya tienes el máximo de 2 cuentas bancarias
          </p>
        )}

        <div className="space-y-4">

          {accounts.map((acc) => (
            <div key={acc.id} className="bg-white p-4 rounded-xl border flex justify-between">

              <div>
                <p className="font-bold">{acc.bank_name}</p>
                <p className="text-sm text-gray-500">{acc.account_number}</p>
                <p className="text-sm text-gray-400">{acc.account_type}</p>
                <p className="text-xs text-gray-400">{acc.country}</p>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => handleEdit(acc)}
                  className="px-3 py-1 bg-blue-600 text-white rounded"
                >
                  Editar
                </button>

                <button
                  onClick={() => handleDelete(acc.id)}
                  className="px-3 py-1 bg-red-600 text-white rounded"
                >
                  Eliminar
                </button>
              </div>

            </div>
          ))}

        </div>

        {(accounts.length < 2 || editingId) && (
          <div className="bg-white p-6 rounded-xl border space-y-3">

            <h2 className="font-semibold">
              {editingId ? "Editar cuenta" : "Nueva cuenta"}
            </h2>

            <input name="holder_name" placeholder="Titular" value={form.holder_name} onChange={handleChange} className="border p-2 w-full rounded" />
            <input name="rut" placeholder="RUT / ID" value={form.rut} onChange={handleChange} className="border p-2 w-full rounded" />
            <input name="bank_name" placeholder="Banco" value={form.bank_name} onChange={handleChange} className="border p-2 w-full rounded" />

            <select name="account_type" value={form.account_type} onChange={handleChange} className="border p-2 w-full rounded">
              <option value="">Tipo de cuenta</option>
              <option value="corriente">Cuenta corriente</option>
              <option value="vista">Cuenta vista</option>
            </select>

            <input name="account_number" placeholder="Número de cuenta" value={form.account_number} onChange={handleChange} className="border p-2 w-full rounded" />

            <input name="country" placeholder="País" value={form.country} onChange={handleChange} className="border p-2 w-full rounded" />

            <input name="swift" placeholder="SWIFT (internacional)" value={form.swift} onChange={handleChange} className="border p-2 w-full rounded" />
            <input name="iban" placeholder="IBAN (internacional)" value={form.iban} onChange={handleChange} className="border p-2 w-full rounded" />

            <button
              onClick={handleSave}
              disabled={saving}
              className="bg-green-600 text-white px-4 py-2 rounded"
            >
              {saving ? "Guardando..." : editingId ? "Actualizar" : "Guardar"}
            </button>

            {error && <p className="text-red-500 text-sm">{error}</p>}
            {message && <p className="text-green-600 text-sm">{message}</p>}

          </div>
        )}

      </div>

    </div>
  )
}