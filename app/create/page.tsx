'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/src/lib/supabase'
import { useRouter } from 'next/navigation'
import ImageUploader from '@/app/components/ImageUploader'

export default function CreateCampaign() {

  const router = useRouter()

  const [loadingPage, setLoadingPage] = useState(true)

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
     🔐 ACCESS CONTROL (IGUAL)
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

      if (!kyc || kyc.status !== "approved") {
        router.push('/kyc')
        return
      }

      const { data: banks } = await supabase
        .from("bank_accounts")
        .select("id")
        .eq("user_email", email)
        .limit(1)

      if (!banks || banks.length === 0) {
        router.push('/account/bank')
        return
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

          {/* PROGRESS */}
          <div>
            <div className="w-full h-2 bg-gray-200 rounded-full">
              <div
                className="h-2 bg-green-600 rounded-full transition-all"
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
                    ? "bg-green-600"
                    : "bg-gray-300"
                }`}
              >
                Continuar →
              </button>
            ) : (
              <button
                onClick={createCampaign}
                className="bg-green-600 text-white px-6 py-2 rounded-lg"
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
           PREVIEW (NUEVO)
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
                <div className="h-2 bg-green-600 w-[25%]" />
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