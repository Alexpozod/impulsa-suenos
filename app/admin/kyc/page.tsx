'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/src/lib/supabase'
import { useRouter } from 'next/navigation'
import { getSignedUrl } from '@/lib/storage/getSignedUrl'

export default function AdminKYC() {

  const router = useRouter()

  const [kycList, setKycList] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [authorized, setAuthorized] = useState(false)
  const [processing, setProcessing] = useState<string | null>(null)
  const [search, setSearch] = useState("")
  const [filter, setFilter] = useState("all")
  const [preview, setPreview] = useState<string | null>(null)
  const [page, setPage] = useState(1)

  const ITEMS_PER_PAGE = 10

  /* =========================
     🔐 AUTH + ROLE CHECK
  ========================= */
  useEffect(() => {
    const checkAccess = async () => {

      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        router.push('/login')
        return
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .maybeSingle()

      if (profile?.role !== 'admin') {
        router.push('/dashboard')
        return
      }

      setAuthorized(true)
      loadKYC()
    }

    checkAccess()
  }, [])

  /* =========================
     📊 LOAD KYC
  ========================= */
  const loadKYC = async () => {

    setLoading(true)

    const { data } = await supabase
      .from('kyc')
      .select('*')
      .order('created_at', { ascending: false })

    if (!data) {
      setKycList([])
      setLoading(false)
      return
    }

    const withSignedUrls = await Promise.all(
      data.map(async (k) => {

  console.log("KYC ORIGINAL:", {
    front: k.document_url,
    back: k.document_back_url,
    selfie: k.selfie_url
  })

  const front =
    k.document_url
      ? await getSignedUrl(
          'kyc-documents',
          k.document_url
        )
      : null

  const back =
    k.document_back_url
      ? await getSignedUrl(
          'kyc-documents',
          k.document_back_url
        )
      : null

  const selfie =
    k.selfie_url
      ? await getSignedUrl(
          'kyc-documents',
          k.selfie_url
        )
      : null

  console.log("KYC SIGNED:", {
    front,
    back,
    selfie
  })

  return {
    ...k,
    document_url: front,
    document_back_url: back,
    selfie_url: selfie,
  }

})
     )

    setKycList(withSignedUrls)
    setLoading(false)
  }

  /* =========================
     🔁 UPDATE STATUS (FIX PRO)
  ========================= */
  const updateStatus = async (user_email: string, status: string) => {
    try {

      setProcessing(user_email)

      const { data: { session } } = await supabase.auth.getSession()

      if (!session?.access_token) {
        alert("❌ Sesión inválida")
        return
      }

      const res = await fetch('/api/admin/kyc', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({
          user_email,
          status
        })
      })

      const json = await res.json()

      if (!res.ok) {
        console.error(json)
        alert(`❌ ${json.error || 'Error actualizando KYC'}`)
        return
      }

      alert(`✅ ${json.message || 'KYC actualizado'}`)

      await loadKYC()

    } catch (err) {
      console.error("UPDATE ERROR:", err)
      alert("❌ Error inesperado")
    } finally {
      setProcessing(null)
    }
  }

  /* =========================
     LOADING / BLOCK
  ========================= */
  if (loading || !authorized) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Verificando acceso...
      </div>
    )
  }

  return (
    <main className="min-h-screen bg-slate-950 text-white px-6 py-10">

      <div className="max-w-5xl mx-auto">

        <h1 className="text-2xl font-bold mb-6">
          🛡️ Panel Admin KYC
        </h1>

<div className="grid md:grid-cols-4 gap-4 mb-6">

  <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
    <p className="text-sm text-slate-400">Total</p>
    <p className="text-2xl font-bold">
      {kycList.length}
    </p>
  </div>

  <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
    <p className="text-sm text-slate-400">Pendientes</p>
    <p className="text-2xl font-bold text-yellow-300">
      {kycList.filter(k => k.status === "pending").length}
    </p>
  </div>

  <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
    <p className="text-sm text-slate-400">Aprobados</p>
    <p className="text-2xl font-bold text-green-400">
      {kycList.filter(k => k.status === "approved").length}
    </p>
  </div>

  <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
    <p className="text-sm text-slate-400">Rechazados</p>
    <p className="text-2xl font-bold text-red-400">
      {kycList.filter(k => k.status === "rejected").length}
    </p>
  </div>

</div>

<div className="mb-6">

  <input
    type="text"
    placeholder="Buscar email, nombre o RUT..."
    value={search}
    onChange={(e) => {
  setSearch(e.target.value)
  setPage(1)
}}
    className="
      w-full
      bg-slate-900
      border
      border-slate-800
      rounded-xl
      px-4
      py-3
      text-sm
      text-white
      outline-none
      focus:border-primary
    "
  />

</div>

<div className="flex gap-2 flex-wrap mb-6">

  {[
    "all",
    "pending",
    "approved",
    "rejected"
  ].map((f) => (

    <button
      key={f}
      onClick={() => {
  setFilter(f)
  setPage(1)
}}
      className={`px-4 py-2 rounded-xl text-sm border transition

        ${
          filter === f
            ? "bg-primary border-primary text-white"
            : "bg-slate-900 border-slate-700 text-slate-300"
        }

      `}
    >
      {
        f === "all"
          ? "Todos"
          : f === "pending"
          ? "Pendientes"
          : f === "approved"
          ? "Aprobados"
          : "Rechazados"
      }
    </button>

  ))}

</div>

        <div className="space-y-6">

          {kycList
  .filter((k) => {

    const q = search.toLowerCase()

    const matchesSearch =

      (k.full_name || "")
        .toLowerCase()
        .includes(q)

      ||

      (k.user_email || "")
        .toLowerCase()
        .includes(q)

      ||

      (k.rut || "")
        .toLowerCase()
        .includes(q)

    const matchesFilter =
      filter === "all"
        ? true
        : k.status === filter

    return matchesSearch && matchesFilter

  })

  .slice(
  (page - 1) * ITEMS_PER_PAGE,
  page * ITEMS_PER_PAGE
)

.map((k) => (

            <div
              key={k.id}
              className="
                bg-slate-900
                border
                border-slate-800
                rounded-2xl
                p-6
              "
            >

              <div className="flex justify-between items-center">
                <div>
                  <p className="font-bold text-lg">{k.full_name}</p>
                  <p className="text-sm text-slate-400">
                    {k.user_email}
                  </p>

                  <p className="text-sm text-slate-400">
                    RUT: {k.rut}
                  </p>
                  <p className="text-xs text-slate-500 mt-1">
  Enviado:
  {" "}
  {new Date(k.created_at).toLocaleString()}
</p>
                </div>

                <span
  className={`px-3 py-1 rounded-full text-xs font-medium border

    ${
      k.status === "approved"
        ? "bg-green-500/10 border-green-500/30 text-green-300"

      : k.status === "pending"
        ? "bg-yellow-500/10 border-yellow-500/30 text-yellow-300"

      : k.status === "rejected"
        ? "bg-red-500/10 border-red-500/30 text-red-300"

      : "bg-slate-700 border-slate-600 text-slate-300"
    }

  `}
>
  {
    k.status === "approved"
      ? "Aprobado"

      : k.status === "pending"
        ? "Pendiente"

      : k.status === "rejected"
        ? "Rechazado"

      : k.status
  }
</span>
              </div>

              {/* DOCUMENTOS */}
<div className="flex gap-4 mt-5 flex-wrap">

  {[
    {
      label: "Frente",
      url: k.document_url
    },
    {
      label: "Reverso",
      url: k.document_back_url
    },
    {
      label: "Selfie",
      url: k.selfie_url
    }
  ]

    .filter((d) => d.url)

    .map((d, i) => (

      <button
        key={i}
        onClick={() => setPreview(d.url)}
        className="
          group
          relative
          w-28
          h-28
          overflow-hidden
          rounded-xl
          border
          border-slate-700
          bg-slate-800
        "
      >

        <img
          src={d.url}
          alt={d.label}
          className="
            w-full
            h-full
            object-cover
            transition
            group-hover:scale-105
          "
        />

        <div
          className="
            absolute
            inset-0
            bg-black/40
            opacity-0
            group-hover:opacity-100
            transition
            flex
            items-center
            justify-center
            text-xs
            text-white
            font-medium
          "
        >
          Ver {d.label}
        </div>

      </button>

    ))}

</div>

              {/* ACCIONES */}
              <div className="flex gap-3 mt-5">

                <button
  disabled={processing === k.user_email}
  onClick={() => updateStatus(k.user_email, 'approved')}
  className="
    bg-primary
    text-white
    px-4
    py-2
    rounded-lg
    disabled:opacity-50
  "
>
  {
    processing === k.user_email
      ? "Procesando..."
      : "Aprobar"
  }
</button>

                <button
                  disabled={processing === k.user_email}
                  onClick={() => updateStatus(k.user_email, 'rejected')}
                  className="bg-red-600 text-white px-4 py-2 rounded-lg disabled:opacity-50"
                >
                  Rechazar
                </button>

                <button
                  disabled={processing === k.user_email}
                  onClick={() => updateStatus(k.user_email, 'pending')}
                  className="bg-gray-700 text-white px-4 py-2 rounded-lg disabled:opacity-50"
                >
                  Solicitar info
                </button>

              </div>

            </div>
          ))}

        </div>

<div className="flex justify-center gap-3 mt-8">

  <button
    disabled={page === 1}
    onClick={() => setPage(page - 1)}
    className="
      px-4
      py-2
      rounded-xl
      bg-slate-800
      border
      border-slate-700
      disabled:opacity-40
    "
  >
    Anterior
  </button>

  <div className="flex items-center text-sm text-slate-400">
    Página {page}
  </div>

  <button
    disabled={
      page * ITEMS_PER_PAGE >=
      kycList.filter((k) => {

        const q = search.toLowerCase()

        const matchesSearch =

          (k.full_name || "")
            .toLowerCase()
            .includes(q)

          ||

          (k.user_email || "")
            .toLowerCase()
            .includes(q)

          ||

          (k.rut || "")
            .toLowerCase()
            .includes(q)

        const matchesFilter =
          filter === "all"
            ? true
            : k.status === filter

        return matchesSearch && matchesFilter

      }).length
    }

    onClick={() => setPage(page + 1)}

    className="
      px-4
      py-2
      rounded-xl
      bg-slate-800
      border
      border-slate-700
      disabled:opacity-40
    "
  >
    Siguiente
  </button>

</div>

      </div>

{/* =========================
   🖼️ MODAL PREVIEW
========================= */}
{preview && (

  <div
    className="
      fixed
      inset-0
      bg-black/80
      z-50
      flex
      items-center
      justify-center
      p-6
    "
    onClick={() => setPreview(null)}
  >

    <div
  onClick={(e) => e.stopPropagation()}
  className="
    max-w-4xl
        max-h-[90vh]
        overflow-hidden
        rounded-2xl
        border
        border-slate-700
      "
    >

      <img
        src={preview}
        alt="Preview"
        className="
          max-h-[90vh]
          object-contain
        "
      />

    </div>

  </div>

)}

    </main>
  )
}