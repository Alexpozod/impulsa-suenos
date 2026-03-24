'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/src/lib/supabase'
import { useRouter } from 'next/navigation'

export default function AdminKYC() {

  const router = useRouter()

  const [kycList, setKycList] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const ADMIN_EMAIL = 'contacto@impulsasuenos.com'

  // 🔒 PROTEGER RUTA
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

  // 📥 CARGAR KYC
  const loadKYC = async () => {
    const { data, error } = await supabase
      .from('kyc')
      .select('*')
      .order('created_at', { ascending: false })

    if (!error) {
      setKycList(data || [])
    }

    setLoading(false)
  }

  // 🔄 ACTUALIZAR ESTADO (VÍA API SEGURA)
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
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-gray-500">Cargando panel...</p>
      </div>
    )
  }

  return (
    <main className="min-h-screen bg-gray-50 px-6 py-10">

      <div className="max-w-4xl mx-auto">

        <h1 className="text-2xl font-bold mb-6">
          🛡️ Panel Admin KYC
        </h1>

        {kycList.length === 0 && (
          <p className="text-gray-500">
            No hay solicitudes aún
          </p>
        )}

        <div className="space-y-6">

          {kycList.map((k) => (
            <div
              key={k.id}
              className="bg-white border rounded-xl p-6 shadow-sm"
            >

              <p className="font-bold text-lg">
                {k.full_name}
              </p>

              <p className="text-sm text-gray-500">
                {k.user_email}
              </p>

              <p className="text-sm text-gray-500">
                RUT: {k.rut}
              </p>

              <a
                href={k.document_url}
                target="_blank"
                className="text-blue-600 text-sm underline mt-2 inline-block"
              >
                📄 Ver documento
              </a>

              <p className="mt-3 text-sm">
                Estado:{" "}
                <strong
                  className={
                    k.status === 'approved'
                      ? 'text-green-600'
                      : k.status === 'pending'
                      ? 'text-yellow-600'
                      : 'text-red-500'
                  }
                >
                  {k.status}
                </strong>
              </p>

              <div className="flex gap-3 mt-4">

                <button
                  onClick={() => updateStatus(k.user_email, 'approved')}
                  className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-green-700"
                >
                  Aprobar
                </button>

                <button
                  onClick={() => updateStatus(k.user_email, 'rejected')}
                  className="bg-red-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-red-700"
                >
                  Rechazar
                </button>

              </div>

            </div>
          ))}

        </div>

      </div>

    </main>
  )
}
