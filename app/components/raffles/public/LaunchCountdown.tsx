"use client"

import { useEffect, useState } from "react"

export default function LaunchCountdown({
  target
}:{
  target:string
}){

  const [time,setTime]=
    useState("")

  useEffect(()=>{

    function update(){

      const now=
        new Date().getTime()

      const normalizedTarget =
        target.replace(" ", "T")

        const end =
        new Date(
            normalizedTarget
        ).getTime()

      const diff=
        end-now

      if(diff<=0){

        setTime(
          "¡Ya comenzó!"
        )

        return

      }

      const days=
        Math.floor(
          diff/86400000
        )

      const hours=
        Math.floor(
          (diff%86400000)/3600000
        )

      const minutes=
        Math.floor(
          (diff%3600000)/60000
        )

      const seconds=
        Math.floor(
          (diff%60000)/1000
        )

      setTime(

        `${days} días ${hours} h ${minutes} min ${seconds} s`

      )

    }

    update()

    const id=
      setInterval(
        update,
        1000
      )

    return ()=>clearInterval(id)

  },[target])

  return(

    <div
      className="
        mt-10
        rounded-2xl
        bg-cyan-500/10
        border
        border-cyan-500/30
        p-6
        text-center
      "
    >

      <div className="text-sm text-cyan-300 uppercase tracking-widest">

        Lanzamiento

      </div>

      <div
        className="
          mt-3
          text-3xl
          font-black
          text-white
        "
      >

        {time}

      </div>

    </div>

  )

}