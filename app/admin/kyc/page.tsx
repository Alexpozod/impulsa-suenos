'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/src/lib/supabase'
import { useRouter } from 'next/navigation'

export default function AdminKYC() {

  const router = useRouter()

  const [kycList, setKycList] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const ADMIN_EMAIL = 'contacto@impulsasuenos.com'

  useEffect(() => {
    const checkAdmin = async () => {
      const { data } = await supabase.auth.getUser()

      if (!data.user || data.user.email !== ADMIN_EMAIL) {
        router.push('/')
        return
      }

      loadKYC()
    }

    checkAdmin()
  }, [])

  const loadKYC = async () => {
    const { data } = await supabase
      .from('kyc')
      .select('*')
      .order('created_at', { ascending: false })

    setKycList(data || [])
    setLoading(false)
  }

  const updateStatus = async (user_email: string, status: string) => {
    await fetch('/api/admin/kyc', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        user_email,
        status,
        admin_email: ADMIN_EMAIL
      })
    })

    loadKYC()
  }

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Cargando...</div>
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
                  onClick={() => updateStatus(k.user_email, 'approved')}
                  className="bg-green-600 text-white px-4 py-2 rounded-lg"
                >
                  Aprobar
                </button>

                <button
                  onClick={() => updateStatus(k.user_email, 'rejected')}
                  className="bg-red-600 text-white px-4 py-2 rounded-lg"
                >
                  Rechazar
                </button>

                <button
                  onClick={() => updateStatus(k.user_email, 'pending')}
                  className="bg-gray-700 text-white px-4 py-2 rounded-lg"
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