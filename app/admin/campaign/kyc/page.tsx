'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/src/lib/supabase'

export default function AdminKYC() {

  const [kycList, setKycList] = useState<any[]>([])

  useEffect(() => {
    loadKYC()
  }, [])

  const loadKYC = async () => {
    const { data } = await supabase
      .from('kyc')
      .select('*')
      .order('created_at', { ascending: false })

    setKycList(data || [])
  }

  const updateStatus = async (id: string, status: string) => {
    await supabase
      .from('kyc')
      .update({ status })
      .eq('id', id)

    loadKYC()
  }

  return (
    <main className="p-6">

      <h1 className="text-2xl font-bold mb-6">
        Panel KYC (Admin)
      </h1>

      <div className="space-y-4">

        {kycList.map((k) => (
          <div key={k.id} className="border p-4 rounded-xl">

            <p><strong>Email:</strong> {k.user_email}</p>
            <p><strong>Nombre:</strong> {k.full_name}</p>
            <p><strong>RUT:</strong> {k.rut}</p>

            <a
              href={k.document_url}
              target="_blank"
              className="text-blue-600 underline"
            >
              Ver documento
            </a>

            <p className="mt-2">
              Estado: <strong>{k.status}</strong>
            </p>

            <div className="flex gap-2 mt-3">

              <button
                onClick={() => updateStatus(k.id, 'approved')}
                className="bg-green-600 text-white px-3 py-1 rounded"
              >
                Aprobar
              </button>

              <button
                onClick={() => updateStatus(k.id, 'rejected')}
                className="bg-red-600 text-white px-3 py-1 rounded"
              >
                Rechazar
              </button>

            </div>

          </div>
        ))}

      </div>

    </main>
  )
}
