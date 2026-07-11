"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/src/lib/supabase"

export default function PartnerResourcesPage() {

  const [loading,setLoading]=useState(true)
  const [resources,setResources]=useState<any[]>([])

  const [previewUrls,setPreviewUrls]=useState<
  Record<string,string>
>({})

  useEffect(()=>{

    load()

  },[])

  async function load(){

    try{

      const {
        data:{session}
      }=
      await supabase.auth.getSession()

      const res=
      await fetch(

        "/api/raffles/partners/resources",

        {
          headers:{
            Authorization:
            `Bearer ${session?.access_token}`
          }
        }

      )

      const json=
      await res.json()

      setResources(
        json.resources || []
      )

      if(session){

  const previews:
    Record<string,string>={}

  for(const resource of json.resources || []){

    if(
      !resource.storage_path
    ) continue

    try{

      const res=
      await fetch(

        `/api/raffles/partners/preview?path=${encodeURIComponent(resource.storage_path)}`,

        {

          headers:{

            Authorization:
            `Bearer ${session.access_token}`

          }

        }

      )

      const data=
      await res.json()

      console.log(

  "Preview",

  resource.title,

  res.status,

  data

)

      if(data.url){

        previews[
          resource.id
        ]=data.url

      }

    }

    catch(error){

      console.error(error)

    }

  }

  setPreviewUrls(
    previews
  )

}

    }

    catch(error){

      console.error(error)

    }

    finally{

      setLoading(false)

    }

  }

  if(loading){

    return(

      <div className="p-8">

        Cargando...

      </div>

    )

  }

  return(

    <div className="p-8 space-y-8">

      <div>

        <h1 className="text-4xl font-bold">

          📦 Recursos

        </h1>

        <p className="text-slate-500 mt-2">

          Descarga material oficial para promocionar ImpulsaSueños.

        </p>

      </div>

      <div className="grid gap-5">

        {

          resources.map(resource=>(

            <div

              key={resource.id}

              className="
                bg-white
                rounded-3xl
                shadow
                p-6
              "

            >

              <div className="flex flex-col md:flex-row gap-8 items-start">

              <div
                className="
                  w-40
                  h-40
                  rounded-2xl
                  bg-slate-100
                  border
                  border-slate-200
                  flex
                  items-center
                  justify-center
                  overflow-hidden
                  shrink-0
                "
              >

                <img

  src={
  previewUrls[
    resource.id
  ]
}

  alt={resource.title}

  className="
    w-full
    h-full
    object-contain
  "

/>

              </div>

              <div className="flex-1">

                <div className="text-sm text-slate-500">

                  {resource.category}

                </div>

                <h2 className="text-2xl font-bold mt-1">

                  {resource.title}

                </h2>

                <p className="mt-2 text-slate-600">

                  {resource.description}

                </p>

              </div>

              <div className="shrink-0">

                <a

                  href="#"

                  onClick={async(e)=>{

                    e.preventDefault()

                    const {
                      data:{session}
                    }=
                    await supabase.auth.getSession()

                    const res=
                    await fetch(

                      `/api/raffles/partners/download?path=${encodeURIComponent(resource.storage_path)}`,

                      {

                        headers:{

                          Authorization:
                          `Bearer ${session?.access_token}`

                        }

                      }

                    )

                    const json=
                    await res.json()

                    if(json.url){

                      window.open(
                        json.url,
                        "_blank"
                      )

                    }

                  }}

                  className="
                    px-5
                    py-3
                    rounded-xl
                    bg-cyan-500
                    hover:bg-cyan-400
                    text-white
                    font-bold
                    transition
                  "

                >

                  Descargar

                </a>

              </div>

            </div>

            </div>

          ))

        }

      </div>

    </div>

  )

}