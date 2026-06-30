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

  const [editingId, setEditingId] = useState("")

  const [filterCategory, setFilterCategory] = useState("Todas")

  const [search, setSearch] = useState("")

  const [sortOrder, setSortOrder] = useState(0)

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
          method: editingId ? "PUT" : "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization:
              `Bearer ${session?.access_token}`
          },
          body: JSON.stringify({

            id: editingId || undefined,

            title,

            description,

            category,

            storage_path: storagePath,

            file_name: fileName,

            mime_type: mimeType,

            file_size: fileSize,

            sort_order: sortOrder

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
    setSortOrder(0)
    setEditingId("")

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

        type="number"

        placeholder="Orden"

        value={sortOrder}

        onChange={(e)=>
        setSortOrder(
        Number(e.target.value)
        )
        }

        className="
        bg-slate-950
        border
        border-slate-700
        rounded-xl
        p-3
        w-full
        "
        />

        <div

            onDragOver={(e)=>{

            e.preventDefault()

            }}

            onDrop={(e)=>{

            e.preventDefault()

            const file=
            e.dataTransfer.files?.[0]

            if(file){

            uploadFile(file)

            }

            }}

            className="
            border-2
            border-dashed
            border-slate-700
            rounded-2xl
            p-8
            text-center
            hover:border-cyan-500
            transition
            "

            >

            <p className="text-slate-400 mb-4">

            Arrastra un archivo aquí

            </p>

            <p className="text-slate-500 text-sm mb-4">

            o selecciónalo manualmente

            </p>

            <input

            type="file"

            onChange={(e)=>{

            const file=
            e.target.files?.[0]

            if(file){

            uploadFile(file)

            }

            }}

            />

            </div>

            {

            storagePath && (

            <div
            className="
            rounded-xl
            bg-emerald-950
            border
            border-emerald-800
            p-4
            text-emerald-300
            "
            >

            ✅ Archivo cargado correctamente

            <br/>

            <span className="text-sm">

            {fileName}

            </span>

            </div>

            )

            }

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
    : editingId

? "Guardar Cambios"

: "Guardar Recurso"
}

</button>

            </div>

      <div
        className="
          rounded-3xl
          border
          border-slate-800
          bg-slate-900
          overflow-hidden
        "
      >

        <div
          className="
            px-6
            py-5
            border-b
            border-slate-800
          "
        >

          <h2
            className="
                text-xl
                font-semibold
                text-white
            "
            >
            Recursos ({

                resources.filter(resource =>

                filterCategory === "Todas"

                    ? true

                    : resource.category === filterCategory

                ).length

                })
            </h2>

        </div>

        <div
            className="
            px-6
            pt-5
            "
            >

            <input

            type="text"

            placeholder="Buscar recurso..."

            value={search}

            onChange={(e)=>
            setSearch(
            e.target.value
            )
            }

            className="
            w-full
            bg-slate-950
            border
            border-slate-700
            rounded-xl
            px-4
            py-3
            "

            />

            </div>

            <div
            className="
                px-6
                py-4
                border-b
                border-slate-800
                flex
                gap-3
                flex-wrap
            "
            >

            {[
                "Todas",
                "Logos",
                "Videos",
                "Instagram",
                "TikTok",
                "Facebook",
                "Documentos"
            ].map(category => (

                <button

                key={category}

                type="button"

                onClick={() =>
                    setFilterCategory(category)
                }

                className={`
                    px-4
                    py-2
                    rounded-xl
                    text-sm
                    font-medium

                    ${
                    filterCategory === category

                        ? "bg-cyan-500 text-slate-950"

                        : "bg-slate-950 border border-slate-700"
                    }
                `}

                >

                {category}

                </button>

            ))}

            </div>

        <div
          className="
            overflow-x-auto
          "
        >

          <table className="w-full">

            <thead>

              <tr
                className="
                  bg-slate-950
                  border-b
                  border-slate-800
                "
              >

                <th className="p-4 text-left">
                  Título
                </th>

                <th className="p-4 text-left">
                  Categoría
                </th>

                <th className="p-4 text-left">
                    Archivo
                    </th>

                    <th className="p-4 text-left">
                    Vista
                    </th>

                    <th className="p-4 text-left">
                    Descargas
                    </th>

                    <th className="p-4 text-left">
                    Publicado
                    </th>

                    <th className="p-4 text-left">
                    Estado
                    </th>

                    <th className="p-4 text-left">
                    Acciones
                    </th>

              </tr>

            </thead>

            <tbody>

              {
                loading
                ?

                <tr>

                  <td
                    colSpan={7}
                    className="
                      p-8
                      text-center
                      text-slate-500
                    "
                  >
                    Cargando...
                  </td>

                </tr>

                :

                resources

                .filter(resource =>

                filterCategory === "Todas"

                    ? true

                    : resource.category === filterCategory

                )

                .filter(resource=>{

                const q=
                search
                .toLowerCase()

                return(

                resource.title
                .toLowerCase()
                .includes(q)

                ||

                (resource.description || "")
                .toLowerCase()
                .includes(q)

                ||

                resource.file_name
                .toLowerCase()
                .includes(q)

                )

                })

                .length===0

                ?

                <tr>

                  <td
                    colSpan={7}
                    className="
                      p-8
                      text-center
                      text-slate-500
                    "
                  >
                    Sin recursos
                  </td>

                </tr>

                :

                resources

                    .filter(resource =>

                    filterCategory === "Todas"

                        ? true

                        : resource.category === filterCategory

                    )

                    .filter(resource=>{

                    const q=
                    search
                    .toLowerCase()

                    return(

                    resource.title
                    .toLowerCase()
                    .includes(q)

                    ||

                    (resource.description || "")
                    .toLowerCase()
                    .includes(q)

                    ||

                    resource.file_name
                    .toLowerCase()
                    .includes(q)

                    )

                    })

                    .map(resource=>(

                  <tr
                    key={resource.id}
                    className="
                      border-b
                      border-slate-800
                    "
                  >

                    <td className="p-4">

                      {resource.title}

                    </td>

                    <td className="p-4">

                      {resource.category}

                    </td>

                   <td className="p-4">

                        <div className="flex items-center gap-3">

                            <span className="text-xl">

                            {
                                resource.mime_type?.startsWith("image/")
                                ? "🖼️"
                                : resource.mime_type?.startsWith("video/")
                                ? "🎥"
                                : resource.mime_type === "application/pdf"
                                ? "📄"
                                : "📦"
                            }

                            </span>

                            <div>

                            <div className="font-medium">

                                {resource.file_name}

                            </div>

                            <div className="text-xs text-slate-500">

                                {(resource.file_size / 1024 / 1024).toFixed(2)} MB

                            </div>

                            </div>

                        </div>

                        </td>

                        <td className="p-4">

{

resource.mime_type?.startsWith("image/")

?

<img

src={`/api/raffles/partners/download?path=${encodeURIComponent(resource.storage_path)}`}

className="
w-20
h-20
object-cover
rounded-xl
border
border-slate-700
"

/>

:

resource.mime_type === "application/pdf"

?

<div className="text-4xl">
📄
</div>

:

resource.mime_type?.startsWith("video/")

?

<div className="text-4xl">
🎥
</div>

:

<div className="text-4xl">
📦
</div>

}

</td>

<td className="p-4">

{resource.download_count || 0}

</td>

<td className="p-4">

{new Date(resource.created_at).toLocaleDateString("es-CL")}

</td>

<td className="p-4">

{
resource.is_active
?
"✅ Activo"
:
"❌ Inactivo"
}

</td>

                    <td className="p-4 flex gap-2">

<button

type="button"

onClick={()=>{

setEditingId(resource.id)

setTitle(resource.title)

setDescription(resource.description || "")

setCategory(resource.category)

setStoragePath(resource.storage_path)

setFileName(resource.file_name)

setMimeType(resource.mime_type)

setSortOrder(resource.sort_order || 0)

}}

className="
px-3
py-1
rounded-lg
bg-cyan-500
text-slate-950
font-semibold
"

>

Editar

</button>

<button

type="button"

onClick={async()=>{

  try{

    const {
      data:{session}
    }
    =
    await supabase.auth.getSession()

    await fetch(

      "/api/admin/raffles/resources",

      {

        method:"PUT",

        headers:{

          "Content-Type":"application/json",

          Authorization:
          `Bearer ${session?.access_token}`

        },

        body:JSON.stringify({

          id:resource.id,

          title:resource.title,

          description:resource.description,

          category:resource.category,

          sort_order:resource.sort_order,

          is_active:!resource.is_active

        })

      }

    )

    await loadResources()

  }

  catch(error){

    console.error(error)

  }

}}

className={`
px-3
py-1
rounded-lg
text-white
font-semibold
${

resource.is_active

?

" bg-red-500 "

:

" bg-emerald-600 "

}

`}

>

{

resource.is_active

?

"Desactivar"

:

"Activar"

}

</button>

</td>

                  </tr>

                ))

              }

            </tbody>

          </table>

        </div>

      </div>

    </div>

  )

}