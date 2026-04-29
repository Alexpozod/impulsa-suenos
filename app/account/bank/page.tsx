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
  const [otpTimer, setOtpTimer] = useState(0)

  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null)

  const emptyForm = {
    holder_name: "",
    bank_name: "",
    account_number: "",
    account_type: "",
    country: "Chile",
    rut: "",
    document_type: "rut",
    swift: "",
    iban: "",
  }

  const [form, setForm] = useState(emptyForm)

  const [message, setMessage] = useState("")
  const [error, setError] = useState("")

  /* =========================
     ⏱ OTP TIMER
  ========================= */
  useEffect(() => {
    if (otpTimer <= 0) return
    const interval = setInterval(() => {
      setOtpTimer((prev) => prev - 1)
    }, 1000)
    return () => clearInterval(interval)
  }, [otpTimer])

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
     VALIDACIÓN
  ========================= */
  const validate = () => {
    if (!form.holder_name) return "Nombre requerido"
    if (!form.bank_name) return "Banco requerido"
    if (!form.account_number) return "Número de cuenta requerido"
    if (!form.account_type) return "Tipo requerido"
    if (!form.rut) return "Documento requerido"

    // Validación básica internacional (UX, backend valida fuerte)
    if (form.iban && form.iban.length < 10) return "IBAN inválido"
    if (form.swift && form.swift.length < 6) return "SWIFT inválido"

    return null
  }

  /* =========================
     🔐 OTP
  ========================= */
  const sendOtp = async () => {

    if (otpTimer > 0) return

    const { data } = await supabase.auth.getUser()

    await fetch("/api/otp/send", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: data.user?.email,
        type: "bank"
      })
    })

    setOtpSent(true)
    setOtpTimer(60)
    setMessage("📩 Código enviado a tu correo")
  }

  /* =========================
     💾 SAVE (CREATE + UPDATE)
  ========================= */
  const handleSave = async () => {

    setError("")
    setMessage("")

    const validationError = validate()
    if (validationError) return setError(validationError)

    if (!otp) {
      await sendOtp()
      return setError("Te enviamos un OTP, ingrésalo para continuar")
    }

    setSaving(true)

    try {

      const { data: sessionData } = await supabase.auth.getSession()
      const token = sessionData?.session?.access_token

      const res = await fetch("/api/bank/update", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          bank_id: editingId || null,
          ...form,
          document_number: form.rut, // 🔥 FIX importante backend
          otp_code: otp
        })
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error)
        setSaving(false)
        return
      }

      setMessage("✅ Cuenta guardada correctamente")
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
     ⭐ DEFAULT
  ========================= */
  const setDefault = async (id: string) => {

    setError("")
    setMessage("")

    if (!otp) {
      await sendOtp()
      return setError("Confirma con OTP")
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
    if (!res.ok) return setError(data.error)

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

    if (!otp) {
      await sendOtp()
      return setError("Ingresa el OTP enviado")
    }

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
    setOtpSent(false)

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
      rut: acc.rut || acc.document_number || "",
      document_type: acc.document_type || "rut",
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

        {/* OTP */}
        <div className="flex gap-2">
          <input
            placeholder="Código OTP"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            className="input max-w-xs"
          />
          <button onClick={sendOtp} className="btn-gray">
            {otpTimer > 0 ? `Reenviar (${otpTimer}s)` : "Enviar código"}
          </button>
        </div>

        {/* LISTADO */}
        {accounts.map(acc => (
          <div key={acc.id} className="card">
            <div>
              <b>{acc.bank_name}</b>
              <p>**** {acc.account_number?.slice(-4)}</p>
              <small>{acc.account_type}</small>
            </div>

            <div className="flex gap-2">
              <button onClick={() => handleEdit(acc)} className="btn-blue">Editar</button>
              <button onClick={() => setConfirmDeleteId(acc.id)} className="btn-red">Eliminar</button>
              {!acc.is_default && (
                <button onClick={() => setDefault(acc.id)} className="link">
                  Hacer principal
                </button>
              )}
            </div>
          </div>
        ))}

        {/* FORM */}
        <div className="card space-y-3">

          <h2>{editingId ? "Editar cuenta" : "Nueva cuenta"}</h2>

          <input name="holder_name" placeholder="Titular" value={form.holder_name} onChange={handleChange} className="input" />
          <input name="bank_name" placeholder="Banco" value={form.bank_name} onChange={handleChange} className="input" />

          <select name="account_type" value={form.account_type} onChange={handleChange} className="input">
            <option value="">Tipo de cuenta</option>
            <option value="corriente">Cuenta corriente</option>
            <option value="vista">Cuenta vista</option>
            <option value="ahorro">Cuenta ahorro</option>
            <option value="checking">Checking (US)</option>
            <option value="savings">Savings (US)</option>
          </select>

          <input name="account_number" placeholder="Número de cuenta" value={form.account_number} onChange={handleChange} className="input" />

          <select name="document_type" value={form.document_type} onChange={handleChange} className="input">
            <option value="rut">RUT</option>
            <option value="dni">DNI</option>
            <option value="passport">Pasaporte</option>
          </select>

          <input name="rut" placeholder="Documento" value={form.rut} onChange={handleChange} className="input" />

          <input name="swift" placeholder="SWIFT (internacional)" value={form.swift} onChange={handleChange} className="input" />
          <input name="iban" placeholder="IBAN (internacional)" value={form.iban} onChange={handleChange} className="input" />

          <button onClick={handleSave} className="btn-green">
            Guardar
          </button>

        </div>

        {error && <p className="text-red-500">{error}</p>}
        {message && <p className="text-green-600">{message}</p>}

      </div>

      <style jsx>{`
        .input { border:1px solid #ddd;padding:10px;border-radius:10px;width:100% }
        .card { background:white;padding:16px;border-radius:16px;border:1px solid #eee;display:flex;justify-content:space-between;flex-direction:column;gap:10px }
        .btn-blue { background:#2563eb;color:white;padding:8px 12px;border-radius:8px }
        .btn-red { background:#dc2626;color:white;padding:8px 12px;border-radius:8px }
        .btn-green { background:#16a34a;color:white;padding:10px;border-radius:10px;width:100% }
        .btn-gray { background:#eee;padding:8px;border-radius:8px }
        .link { font-size:12px;color:#555;text-decoration:underline }
      `}</style>

    </div>
  )
}