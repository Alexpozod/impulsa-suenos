'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/src/lib/supabase'
import { useRouter } from 'next/navigation'

export default function KYCPage() {

  const router = useRouter()

  const [user, setUser] = useState<any>(null)

  const [fullName, setFullName] = useState('')
  const [rut, setRut] = useState('')
  const [documentType, setDocumentType] = useState('')

  const [fileFront, setFileFront] = useState<File | null>(null)
  const [fileBack, setFileBack] = useState<File | null>(null)
  const [selfie, setSelfie] = useState<File | null>(null)

  const [previewFront, setPreviewFront] = useState<string | null>(null)
  const [previewBack, setPreviewBack] = useState<string | null>(null)
  const [previewSelfie, setPreviewSelfie] = useState<string | null>(null)

  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  /* =========================
     🔐 GET USER + KYC STATUS
  ========================= */
  useEffect(() => {
    const init = async () => {
      const { data } = await supabase.auth.getUser()

      if (!data.user) {
        router.push('/login')
        return
      }

      setUser(data.user)

      // 🔍 revisar si ya tiene KYC
      const { data: kyc } = await supabase
        .from('kyc')
        .select('status')
        .eq('user_email', data.user.email)
        .maybeSingle()

      if (kyc?.status === 'pending') {
        setMessage('⏳ Tu verificación está en revisión')
      }

      if (kyc?.status === 'approved') {
        router.push('/dashboard')
      }
    }

    init()
  }, [router])

  /* =========================
     📤 UPLOAD FILE
  ========================= */
  const uploadFile = async (file: File, name: string) => {
    if (!user) throw new Error('Usuario no autenticado')

    const filePath = `${user.id}/${Date.now()}-${name}`

    const formData = new FormData()
    formData.append("file", file)
    formData.append("bucket", "kyc-documents")
    formData.append("path", filePath)

    const res = await fetch("/api/upload", {
      method: "POST",
      body: formData,
    })

    const data = await res.json()

    if (!res.ok) {
      throw new Error(data.error || "Error subiendo archivo")
    }

    return filePath
  }

  /* =========================
     🎯 VALIDACIONES
  ========================= */
  const validate = () => {
    if (!fullName) return 'Ingresa tu nombre completo'
    if (!rut) return 'Ingresa tu documento'
    if (!documentType) return 'Selecciona tipo de documento'
    if (!fileFront) return 'Sube el documento frontal'
    return null
  }

  /* =========================
     🚀 SUBMIT
  ========================= */
  const handleSubmit = async () => {

    const errorMsg = validate()
    if (errorMsg) {
      setMessage('⚠️ ' + errorMsg)
      return
    }

    if (!user) {
      setMessage('❌ Usuario no autenticado')
      return
    }

    setLoading(true)
    setMessage('')

    try {

      let frontPath = ''
      let backPath = ''
      let selfiePath = ''

      if (fileFront) frontPath = await uploadFile(fileFront, 'front')
      if (fileBack) backPath = await uploadFile(fileBack, 'back')
      if (selfie) selfiePath = await uploadFile(selfie, 'selfie')

      const { error } = await supabase
        .from('kyc')
        .upsert({
          id: user.id,
          user_email: user.email,
          full_name: fullName,
          rut,
          document_type: documentType,
          document_url: frontPath,
          document_back_url: backPath,
          selfie_url: selfiePath,
          status: 'pending',
          created_at: new Date().toISOString()
        })

      if (error) throw error

      setMessage('✅ Verificación enviada. En revisión.')

      setTimeout(() => {
        router.push('/dashboard')
      }, 1500)

    } catch (err) {
      console.error(err)
      setMessage('❌ Error en KYC')
    }

    setLoading(false)
  }

  /* =========================
     🎨 FILE HANDLERS
  ========================= */
  const handleFile = (file: File | null, type: string) => {
    if (!file) return

    const url = URL.createObjectURL(file)

    if (type === 'front') {
      setFileFront(file)
      setPreviewFront(url)
    }

    if (type === 'back') {
      setFileBack(file)
      setPreviewBack(url)
    }

    if (type === 'selfie') {
      setSelfie(file)
      setPreviewSelfie(url)
    }
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
          className="w-full border p-3 rounded-lg mb-3"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
        />

        <input
          placeholder="RUT / DNI / Pasaporte"
          className="w-full border p-3 rounded-lg mb-3"
          value={rut}
          onChange={(e) => setRut(e.target.value)}
        />

        <select
          className="w-full border p-3 rounded-lg mb-4"
          value={documentType}
          onChange={(e) => setDocumentType(e.target.value)}
        >
          <option value="">Tipo de documento</option>
          <option value="dni">DNI</option>
          <option value="passport">Pasaporte</option>
        </select>

        {/* FRONT */}
        <label className="text-sm font-medium">Documento (frente)</label>
        <input
          type="file"
          className="w-full mb-2 border p-2 rounded-lg"
          onChange={(e) => handleFile(e.target.files?.[0] || null, 'front')}
        />
        {previewFront && <img src={previewFront} className="mb-3 rounded-lg" />}

        {/* BACK */}
        <label className="text-sm font-medium">Documento (reverso)</label>
        <input
          type="file"
          className="w-full mb-2 border p-2 rounded-lg"
          onChange={(e) => handleFile(e.target.files?.[0] || null, 'back')}
        />
        {previewBack && <img src={previewBack} className="mb-3 rounded-lg" />}

        {/* SELFIE */}
        <label className="text-sm font-medium">Selfie con documento</label>
        <input
          type="file"
          className="w-full mb-2 border p-2 rounded-lg"
          onChange={(e) => handleFile(e.target.files?.[0] || null, 'selfie')}
        />
        {previewSelfie && <img src={previewSelfie} className="mb-3 rounded-lg" />}

        <button
          onClick={handleSubmit}
          disabled={loading}
          className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700"
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