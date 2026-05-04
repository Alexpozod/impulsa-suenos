'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/src/lib/supabase'
import { useRouter } from 'next/navigation'
import ImageUploader from '@/app/components/ImageUploader'

export default function CreateCampaign() {

  const router = useRouter()

  const [loadingPage, setLoadingPage] = useState(true)
  const [bankWarning, setBankWarning] = useState(false)

  /* =========================
     FORM ORIGINAL (NO TOCAR)
  ========================= */
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [goal, setGoal] = useState('')
  const [category, setCategory] = useState('general')
  const [images, setImages] = useState<File[]>([])

  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  /* =========================
     🧠 WIZARD
  ========================= */
  const [step, setStep] = useState(1)

  const next = () => {
    if (!canContinue()) return
    setStep((s) => Math.min(s + 1, 4))
  }

  const prev = () => setStep((s) => Math.max(s - 1, 1))

  const canContinue = () => {
    if (step === 1) return title.length > 5
    if (step === 2) return description.length > 20
    if (step === 3) return Number(goal) > 0
    if (step === 4) return true
    return true
  }

  /* =========================
     🧠 NUEVO: KYC WARNING
  ========================= */
  const [kycWarning, setKycWarning] = useState(false)

  /* =========================
     🔐 ACCESS CONTROL (FIX)
  ========================= */
  useEffect(() => {
    const checkAccess = async () => {

      const { data } = await supabase.auth.getUser()

      if (!data.user) {
        router.push('/login')
        return
      }

      const email = data.user.email!.toLowerCase()

      const { data: kyc } = await supabase
        .from("kyc")
        .select("status")
        .eq("user_email", email)
        .maybeSingle()

      // 🔥 FIX: YA NO BLOQUEA
      if (!kyc || kyc.status !== "approved") {

        console.warn("⚠️ Usuario sin KYC creando campaña")

        setKycWarning(true)
      }

      const { data: banks } = await supabase
  .from("bank_accounts")
  .select("id")
  .eq("user_email", email)
  .limit(1)

// 🔓 NO BLOQUEA CREACIÓN
if (!banks || banks.length === 0) {

  console.warn("⚠️ Usuario sin cuenta bancaria")

  setBankWarning(true)

  // ❌ IMPORTANTE: NO redirigir
}

      setLoadingPage(false)
    }

    checkAccess()
  }, [router])

  /* =========================
     🚀 CREATE (IGUAL)
  ========================= */
  const createCampaign = async () => {

    setLoading(true)
    setMessage('')

    try {

      const { data: sessionData } = await supabase.auth.getSession()
      const token = sessionData?.session?.access_token

      if (!token) {
        setMessage('Debes iniciar sesión')
          setLoading(false) // 🔥 AGREGAR
        return
      }

      let imageUrls: string[] = []

      for (const img of images) {

        const cleanName = img.name.replace(/\s/g, "_")
        const fileName = `campaigns/${Date.now()}-${cleanName}`

        const upload = await supabase.storage
          .from('campaign-images')
          .upload(fileName, img)

        if (!upload.error) {
          const publicUrl = supabase.storage
            .from('campaign-images')
            .getPublicUrl(fileName)

          if (publicUrl.data.publicUrl) {
            imageUrls.push(publicUrl.data.publicUrl)
          }
        }
      }

      const res = await fetch('/api/campaign/create', {
        method: 'POST',
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          title,
          description,
          goal_amount: Number(goal),
          image_url: imageUrls[0] || null,
          images: imageUrls,
          category
        })
      })

      const data = await res.json()

      if (!res.ok) {
        setMessage(data.error || 'Error creando campaña')
        return
      }

      setMessage('✅ Campaña creada correctamente')

      setTimeout(() => {
        router.push('/dashboard')
      }, 1000)

    } catch (error) {
      console.error(error)
      setMessage('Error inesperado')
    }

    setLoading(false)
  }

  /* =========================
     ⏳ LOADING PAGE
  ========================= */
  if (loadingPage) {
    return <div className="p-10">Cargando...</div>
  }

  return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center px-4">

      <div className="w-full max-w-6xl grid md:grid-cols-2 gap-10">

        {/* =========================
           FORM (WIZARD)
        ========================= */}
        <div className="bg-white p-8 rounded-2xl shadow-md space-y-6">

          {/* ⚠️ KYC WARNING */}
          {kycWarning && (
            <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 p-3 rounded-lg text-sm">
              ⚠️ Puedes crear campañas sin verificación, pero necesitarás completar KYC para retirar dinero.
            </div>
          )}
{bankWarning && (
  <div className="bg-blue-50 border border-blue-200 text-blue-700 p-3 rounded-lg text-sm">
    ℹ️ Puedes crear campañas sin cuenta bancaria, pero necesitarás agregar una para retirar fondos.
  </div>
)}
          {/* PROGRESS */}
          <div>
            <div className="w-full h-2 bg-gray-200 rounded-full">
              <div
                className="h-2 bg-primary rounded-full transition-all"
                style={{ width: `${(step / 4) * 100}%` }}
              />
            </div>
            <p className="text-xs text-gray-400 mt-2">
              Paso {step} de 4
            </p>
          </div>

          {/* STEP 1 */}
          {step === 1 && (
            <>
              <h2 className="font-bold text-lg">Título</h2>
              <input
                className="w-full border p-3 rounded-lg"
                placeholder="Título"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </>
          )}

          {/* STEP 2 */}
          {step === 2 && (
            <>
              <h2 className="font-bold text-lg">Descripción</h2>
              <textarea
                className="w-full border p-3 rounded-lg"
                placeholder="Descripción"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </>
          )}

          {/* STEP 3 */}
          {step === 3 && (
            <>
              <h2 className="font-bold text-lg">Meta</h2>

              <select
                className="w-full border p-3 rounded-lg mb-3"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                <option value="general">General</option>
                <option value="salud">Salud</option>
                <option value="educacion">Educación</option>
                <option value="emergencia">Emergencia</option>
                <option value="animales">Animales</option>
              </select>

              <input
                type="number"
                placeholder="Meta ($)"
                className="w-full border p-3 rounded-lg"
                value={goal}
                onChange={(e) => setGoal(e.target.value)}
              />
            </>
          )}

          {/* STEP 4 */}
          {step === 4 && (
            <>
              <h2 className="font-bold text-lg">Imágenes</h2>
              <ImageUploader images={images} setImages={setImages} />
            </>
          )}

          {/* ACTIONS */}
          <div className="flex justify-between">

            {step > 1 ? (
              <button onClick={prev} className="text-gray-500">
                ← Volver
              </button>
            ) : <div />}

            {step < 4 ? (
              <button
                onClick={next}
                disabled={!canContinue()}
                className={`px-6 py-2 rounded-lg text-white ${
                  canContinue()
                    ? "bg-primary"
                    : "bg-gray-300"
                }`}
              >
                Continuar →
              </button>
            ) : (
              <button
  onClick={createCampaign}
  disabled={loading}
  className={`px-6 py-2 rounded-lg text-white transition ${
    loading
      ? "bg-gray-400 cursor-not-allowed"
      : "bg-primary hover:bg-primaryHover cursor-pointer"
  }`}
>
  {loading ? 'Creando...' : 'Crear campaña'}
</button>
            )}

          </div>

          {message && (
            <p className="text-center text-sm">{message}</p>
          )}

        </div>

        {/* =========================
           PREVIEW
        ========================= */}
        <div className="hidden md:block bg-white rounded-2xl shadow-md overflow-hidden">

          <img
            src={
              images[0]
                ? URL.createObjectURL(images[0])
                : "https://images.unsplash.com/photo-1593113630400-ea4288922497"
            }
            className="w-full h-56 object-cover"
          />

          <div className="p-6">
            <h3 className="font-bold text-lg">
              {title || "Título de tu campaña"}
            </h3>

            <p className="text-sm text-gray-500 mt-2">
              {description || "Aquí verás la descripción en tiempo real"}
            </p>

            <div className="mt-4">
              <div className="h-2 bg-gray-200 rounded-full">
                <div className="h-2 bg-primary w-[25%]" />
              </div>

              <p className="text-green-600 font-bold mt-2">
                ${Number(goal || 0).toLocaleString()}
              </p>
            </div>

          </div>

        </div>

      </div>

    </main>
  )
}