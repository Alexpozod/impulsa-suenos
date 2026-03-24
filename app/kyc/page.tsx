'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/src/lib/supabase'
import { useRouter } from 'next/navigation'

export default function KYCPage() {

  const router = useRouter()

  const [user, setUser] = useState<any>(null)
  const [fullName, setFullName] = useState('')
  const [rut, setRut] = useState('')
  const [file, setFile] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    const getUser = async () => {
      const { data } = await supabase.auth.getUser()

      if (!data.user) {
        router.push('/login')
      } else {
        setUser(data.user)
      }
    }

    getUser()
  }, [])

  const handleSubmit = async () => {

    if (!fullName || !rut || !file) {
      setMessage('Completa todos los campos')
      return
    }

    setLoading(true)

    // 📤 subir archivo
    const fileName = `${Date.now()}-${file.name}`

    const { data: uploadData, error: uploadError } = await supabase
      .storage
      .from('kyc-documents')
      .upload(fileName, file)

    if (uploadError) {
      setMessage('Error subiendo documento')
      setLoading(false)
      return
    }

    const fileUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/kyc-documents/${fileName}`

    // 💾 guardar KYC
    const { error } = await supabase
      .from('kyc')
      .insert({
        user_email: user.email,
        full_name: fullName,
        rut,
        document_url: fileUrl,
        status: 'pending'
      })

    if (error) {
      setMessage('Error guardando datos')
    } else {
      setMessage('✅ Verificación enviada. En revisión.')
      setTimeout(() => router.push('/dashboard'), 1500)
    }

    setLoading(false)
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-50 px-4">

      <div className="bg-white p-8 rounded-2xl shadow-md w-full max-w-md">

        <h1 className="text-xl font-bold mb-2 text-center">
          Verificación de identidad
        </h1>

        <p className="text-sm text-gray-500 text-center mb-6">
          Necesaria para crear campañas
        </p>

        <input
          placeholder="Nombre completo"
          className="w-full border p-3 rounded mb-3"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
        />

        <input
          placeholder="RUT"
          className="w-full border p-3 rounded mb-3"
          value={rut}
          onChange={(e) => setRut(e.target.value)}
        />

        <input
          type="file"
          className="w-full mb-4"
          onChange={(e) => setFile(e.target.files?.[0])}
        />

        <button
          onClick={handleSubmit}
          disabled={loading}
          className="w-full bg-green-600 text-white py-3 rounded font-semibold"
        >
          {loading ? 'Enviando...' : 'Enviar verificación'}
        </button>

        {message && (
          <p className="text-sm text-center mt-4 text-gray-600">
            {message}
          </p>
        )}

      </div>

    </main>
  )
}
