"use client"

import { useEffect, useState } from "react"

export default function LaunchCountdown({
  target
}:{
  target:string
}){

  const [time,setTime]=
    useState({

      days:"00",

      hours:"00",

      minutes:"00",

      seconds:"00",

      finished:false

    })

  useEffect(()=>{

    function update(){

      const now=
        Date.now()

      const end=
        new Date(target).getTime()

      const diff=
        end-now

      if(diff<=0){

        setTime({

          days:"00",

          hours:"00",

          minutes:"00",

          seconds:"00",

          finished:true

        })

        return

      }

      const days=
        Math.floor(diff/86400000)

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

      setTime({

        days:String(days).padStart(2,"0"),

        hours:String(hours).padStart(2,"0"),

        minutes:String(minutes).padStart(2,"0"),

        seconds:String(seconds).padStart(2,"0"),

        finished:false

      })

    }

    update()

    const id=
      setInterval(update,1000)

    return ()=>clearInterval(id)

  },[target])

  if(time.finished){

    return(

      <div
        className="
          mt-10
          rounded-3xl
          bg-emerald-500/10
          border
          border-emerald-500/30
          p-8
        "
      >

        <div className="text-3xl font-black">

          🚀 ¡Ya comenzó!

        </div>

      </div>

    )

  }

  return(

    <div
      className="
        mt-10
        rounded-3xl
        border
        border-cyan-500/20
        bg-cyan-500/5
        p-8
      "
    >

      <div
        className="
          text-cyan-400
          uppercase
          tracking-[0.35em]
          text-sm
          font-bold
          mb-8
        "
      >

        Lanzamiento

      </div>

      <div
        className="
          grid
          grid-cols-4
          gap-4
        "
      >

        <CountdownCard
          value={time.days}
          label="Días"
        />

        <CountdownCard
          value={time.hours}
          label="Horas"
        />

        <CountdownCard
          value={time.minutes}
          label="Min"
        />

        <CountdownCard
          value={time.seconds}
          label="Seg"
        />

      </div>

    </div>

  )

}

function CountdownCard({
  value,
  label
}:{
  value:string
  label:string
}){

  return(

    <div
      className="
        rounded-2xl
        bg-slate-900
        border
        border-slate-800
        py-6
      "
    >

      <div
        className="
          text-4xl
          md:text-5xl
          font-black
          text-white
        "
      >

        {value}

      </div>

      <div
        className="
          mt-3
          text-xs
          uppercase
          tracking-[0.25em]
          text-slate-400
        "
      >

        {label}

      </div>

    </div>

  )

}