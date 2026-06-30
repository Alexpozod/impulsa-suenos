"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/src/lib/supabase"

export default function PartnerResourcesPage() {

  const [loading,setLoading]=useState(true)
  const [resources,setResources]=useState<any[]>([])

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

              <div className="flex justify-between items-start">

                <div>

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
                    text-white
                    font-bold
                  "

                >

                  Descargar

                </a>

              </div>

            </div>

          ))

        }

      </div>

    </div>

  )

}