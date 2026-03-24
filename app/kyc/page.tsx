'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/src/lib/supabase'
import { useRouter } from 'next/navigation'

export default function KYCPage() {

  const router = useRouter()

  const [user, setUser] = useState<any>(null)
  const [fullName, setFullName] = useState('')
  const [rut, setRut] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  // 🔐 Obtener usuario
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
  }, [router])

  const handleSubmit = async () => {

    if (!fullName || !rut || !file) {
      setMessage('⚠️ Completa todos los campos')
      return
    }

    if (!user) {
      setMessage('❌ Usuario no autenticado')
      return
    }

    setLoading(true)
    setMessage('')

    // 📂 Ruta organizada por usuario
    const filePath = `${user.id}/${Date.now()}-${file.name}`

    // 📤 Subir archivo
    const { error: uploadError } = await supabase
      .storage
      .from('kyc-documents')
      .upload(filePath, file)

    if (uploadError) {
      setMessage('❌ Error subiendo documento')
      setLoading(false)
      return
    }

    // 🔗 Obtener URL correcta
    const { data: publicUrlData } = supabase
      .storage
      .from('kyc-documents')
      .getPublicUrl(filePath)

    const documentUrl = publicUrlData.publicUrl

    // 🔥 UPSERT (evita duplicados)
    const { error } = await supabase
      .from('kyc')
      .upsert({
        id: user.id, // 🔑 CLAVE
        user_email: user.email,
        full_name: fullName,
        rut: rut,
        document_url: documentUrl,
        status: 'pending'
      })

    if (error) {
      console.error(error)
      setMessage('❌ Error guardando datos')
      setLoading(false)
      return
    }

    setMessage('✅ Verificación enviada. En revisión.')

    setTimeout(() => {
      router.push('/dashboard')
    }, 1500)

    setLoading(false)
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-50 px-4">

      <div className="bg-white p-8 rounded-2xl shadow-xl border w-full max-w-md">

        <h1 className="text-2xl font-bold mb-2 text-center text-green-600">
          Verificación de identidad
        </h1>

        <p className="text-sm text-gray-500 text-center mb-6">
          Necesaria para crear campañas y retirar fondos
        </p>

        <input
          placeholder="Nombre completo"
          className="w-full border p-3 rounded-lg mb-3 focus:outline-none focus:ring-2 focus:ring-green-500"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
        />

        <input
          placeholder="RUT"
          className="w-full border p-3 rounded-lg mb-3 focus:outline-none focus:ring-2 focus:ring-green-500"
          value={rut}
          onChange={(e) => setRut(e.target.value)}
        />

        <input
          type="file"
          className="w-full mb-4 border p-2 rounded-lg"
          onChange={(e) => setFile(e.target.files?.[0] || null)}
        />

        <button
          onClick={handleSubmit}
          disabled={loading}
          className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 transition"
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
