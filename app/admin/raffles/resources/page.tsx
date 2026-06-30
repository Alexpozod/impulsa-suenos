"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/src/lib/supabase"

export default function ResourcesPage() {

  const [loading, setLoading] = useState(true)

  const [resources, setResources] = useState<any[]>([])

  const [title, setTitle] = useState("")

  const [description, setDescription] = useState("")

  const [category, setCategory] = useState("Logos")

  const [uploading, setUploading] = useState(false)

  const [storagePath, setStoragePath] = useState("")

  const [fileName, setFileName] = useState("")

  const [mimeType, setMimeType] = useState("")

  const [fileSize, setFileSize] = useState(0)

  const [saving, setSaving] = useState(false)

  useEffect(() => {

    loadResources()

  }, [])

  async function loadResources() {

    try {

      const {
        data: { session }
      } =
        await supabase.auth.getSession()

      const res =
        await fetch(
          "/api/admin/raffles/resources",
          {
            headers: {
              Authorization:
                `Bearer ${session?.access_token}`
            }
          }
        )

      const json =
        await res.json()

      setResources(
        json.resources || []
      )

    } catch (error) {

      console.error(error)

    } finally {

      setLoading(false)

    }

  }

  async function saveResource() {

  if (!storagePath) {

    alert("Primero sube un archivo")

    return

  }

  try {

    setSaving(true)

    const {
      data: { session }
    } =
      await supabase.auth.getSession()

    const res =
      await fetch(
        "/api/admin/raffles/resources",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization:
              `Bearer ${session?.access_token}`
          },
          body: JSON.stringify({

            title,

            description,

            category,

            storage_path: storagePath,

            file_name: fileName,

            mime_type: mimeType,

            file_size: fileSize

          })
        }
      )

    const json =
      await res.json()

    if (!json.ok) {

      throw new Error()

    }

    setTitle("")
    setDescription("")
    setStoragePath("")
    setFileName("")
    setMimeType("")
    setFileSize(0)

    await loadResources()

    alert("Recurso creado")

  } catch (error) {

    console.error(error)

    alert("Error al guardar")

  } finally {

    setSaving(false)

  }

}

  async function uploadFile(
    file: File
  ) {

    setUploading(true)

    try {

      const {
        data: { session }
      } =
        await supabase.auth.getSession()

      const form =
        new FormData()

      form.append(
        "file",
        file
      )

      form.append(
        "category",
        category
      )

      const res =
        await fetch(
          "/api/admin/raffles/resources/upload",
          {
            method: "POST",
            headers: {
              Authorization:
                `Bearer ${session?.access_token}`
            },
            body: form
          }
        )

      const json =
        await res.json()

      setStoragePath(
        json.storage_path
      )

      setFileName(
        json.file_name
      )

      setMimeType(
        json.mime_type
      )

      setFileSize(
        json.file_size
      )

    } catch (error) {

      console.error(error)

    } finally {

      setUploading(false)

    }

  }

  return (

    <div className="p-8 space-y-8">

      <div>

        <h1 className="text-4xl font-bold text-white">

          📦 Recursos

        </h1>

        <p className="text-slate-400 mt-2">

          Material para Partners.

        </p>

      </div>

      <div
        className="
          rounded-3xl
          border
          border-slate-800
          bg-slate-900
          p-6
          space-y-4
        "
      >

        <input
          placeholder="Título"
          value={title}
          onChange={(e)=>
            setTitle(e.target.value)
          }
          className="
            w-full
            bg-slate-950
            border
            border-slate-700
            rounded-xl
            p-3
          "
        />

        <textarea
          placeholder="Descripción"
          value={description}
          onChange={(e)=>
            setDescription(e.target.value)
          }
          className="
            w-full
            bg-slate-950
            border
            border-slate-700
            rounded-xl
            p-3
            h-28
          "
        />

        <select
          value={category}
          onChange={(e)=>
            setCategory(
              e.target.value
            )
          }
          className="
            bg-slate-950
            border
            border-slate-700
            rounded-xl
            p-3
          "
        >

          <option>Logos</option>

          <option>Videos</option>

          <option>Instagram</option>

          <option>TikTok</option>

          <option>Facebook</option>

          <option>Documentos</option>

        </select>

        <input

          type="file"

          onChange={(e)=>{

            const file =
              e.target.files?.[0]

            if(file){

              uploadFile(file)

            }

          }}

        />

        <button

  type="button"

  disabled={
    uploading ||
    saving
  }

  onClick={saveResource}

  className="
    px-6
    py-3
    rounded-xl
    bg-cyan-500
    text-slate-950
    font-bold
  "

>

{
  saving
    ? "Guardando..."
    : "Guardar Recurso"
}

</button>

      </div>

    </div>

  )

}