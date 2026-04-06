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
      data.map(async (k) => ({
        ...k,
        document_url: k.document_url
          ? await getSignedUrl('kyc-documents', k.document_url)
          : null,
        document_back_url: k.document_back_url
          ? await getSignedUrl('kyc-documents', k.document_back_url)
          : null,
        selfie_url: k.selfie_url
          ? await getSignedUrl('kyc-documents', k.selfie_url)
          : null,
      }))
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
    <main className="min-h-screen bg-gray-50 px-6 py-10">

      <div className="max-w-5xl mx-auto">

        <h1 className="text-2xl font-bold mb-6">
          🛡️ Panel Admin KYC
        </h1>

        <div className="space-y-6">

          {kycList.map((k) => (
            <div key={k.id} className="bg-white border rounded-xl p-6 shadow-sm">

              <div className="flex justify-between items-center">
                <div>
                  <p className="font-bold text-lg">{k.full_name}</p>
                  <p className="text-sm text-gray-500">{k.user_email}</p>
                  <p className="text-sm text-gray-500">RUT: {k.rut}</p>
                </div>

                <span className={`text-sm px-3 py-1 rounded-full
                  ${k.status === 'approved' && 'bg-green-100 text-green-700'}
                  ${k.status === 'pending' && 'bg-yellow-100 text-yellow-700'}
                  ${k.status === 'rejected' && 'bg-red-100 text-red-700'}
                `}>
                  {k.status}
                </span>
              </div>

              {/* DOCUMENTOS */}
              <div className="flex gap-4 mt-4 flex-wrap">

                {k.document_url && (
                  <a href={k.document_url} target="_blank" className="text-blue-600 underline">
                    📄 Frente
                  </a>
                )}

                {k.document_back_url && (
                  <a href={k.document_back_url} target="_blank" className="text-blue-600 underline">
                    📄 Reverso
                  </a>
                )}

                {k.selfie_url && (
                  <a href={k.selfie_url} target="_blank" className="text-blue-600 underline">
                    🤳 Selfie
                  </a>
                )}

              </div>

              {/* ACCIONES */}
              <div className="flex gap-3 mt-5">

                <button
                  disabled={processing === k.user_email}
                  onClick={() => updateStatus(k.user_email, 'approved')}
                  className="bg-green-600 text-white px-4 py-2 rounded-lg disabled:opacity-50"
                >
                  Aprobar
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

      </div>

    </main>
  )
}