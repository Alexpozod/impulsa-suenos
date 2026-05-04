'use client'

import { useState } from "react"

export default function ImageUploader({
  images,
  setImages
}: {
  images: File[]
  setImages: (files: File[]) => void
}) {

  const [progress, setProgress] = useState(0)

  /* =========================
     🧠 COMPRESIÓN
  ========================= */
  const compressImage = (file: File): Promise<File> => {
    return new Promise((resolve) => {
      const reader = new FileReader()

      reader.onload = (event) => {
        const img = new Image()
        img.src = event.target?.result as string

        img.onload = () => {
          const canvas = document.createElement('canvas')
          const ctx = canvas.getContext('2d')

          const MAX_WIDTH = 1200

          let width = img.width
          let height = img.height

          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width
            width = MAX_WIDTH
          }

          canvas.width = width
          canvas.height = height

          ctx?.drawImage(img, 0, 0, width, height)

          canvas.toBlob((blob) => {
            if (blob) {
              resolve(new File([blob], file.name, { type: 'image/jpeg' }))
            }
          }, 'image/jpeg', 0.7)
        }
      }

      reader.readAsDataURL(file)
    })
  }

  /* =========================
     📥 MANEJO ARCHIVOS
  ========================= */
  const handleFiles = async (files: FileList | null) => {
    if (!files) return

    const newFiles = Array.from(files)

    // 🔒 límite inteligente
    if (images.length + newFiles.length > 6) {
      alert("Máximo 6 imágenes")
      return
    }

    setProgress(10)

    // 💣 compresión paralela
    const compressed = await Promise.all(
      newFiles.map(file => compressImage(file))
    )

    setProgress(60)

    // 🔥 aquí podrías meter moderación IA (futuro)

    setImages([...images, ...compressed])

    setProgress(100)

    setTimeout(() => setProgress(0), 800)
  }

  /* =========================
     ❌ ELIMINAR
  ========================= */
  const removeImage = (index: number) => {
    const updated = [...images]
    updated.splice(index, 1)
    setImages(updated)
  }

  /* =========================
     ⭐ PORTADA
  ========================= */
  const setCover = (index: number) => {
    const updated = [...images]
    const [selected] = updated.splice(index, 1)
    updated.unshift(selected)
    setImages(updated)
  }

  return (
    <div className="space-y-4">

      {/* DROPZONE */}
      <label className="border-2 border-dashed border-gray-300 p-6 rounded-xl text-center cursor-pointer hover:border-green-500 transition block">
        <p className="text-gray-500">
          📸 Subir imágenes (máx 6)
        </p>

        <input
          type="file"
          multiple
          accept="image/*"
          onChange={(e) => handleFiles(e.target.files)}
          className="hidden"
        />
      </label>

      {/* PROGRESS */}
      {progress > 0 && (
        <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden">
          <div
            className="bg-primary h-2 transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>
      )}

      {/* GRID */}
      <div className="grid grid-cols-3 gap-3">

        {images.map((img, i) => {
          const preview = URL.createObjectURL(img)

          return (
            <div key={i} className="relative group">

              <img
                src={preview}
                className="h-28 w-full object-cover rounded-lg"
              />

              {i === 0 && (
                <span className="absolute top-1 left-1 bg-primary text-white text-xs px-2 py-1 rounded">
                  Portada
                </span>
              )}

              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex flex-col justify-center items-center gap-2 transition">

                <button
                  onClick={() => setCover(i)}
                  className="bg-white text-black px-2 py-1 text-xs rounded"
                >
                  Portada
                </button>

                <button
                  onClick={() => removeImage(i)}
                  className="bg-red-600 text-white px-2 py-1 text-xs rounded"
                >
                  Eliminar
                </button>

              </div>

            </div>
          )
        })}

      </div>

    </div>
  )
}