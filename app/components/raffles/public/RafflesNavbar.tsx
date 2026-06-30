"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { supabase } from "@/src/lib/supabase"

export default function RafflesNavbar() {

  const [open, setOpen] = useState(false)

  const [logged, setLogged] = useState(false)

useEffect(() => {

  async function loadSession() {

    const {
      data:{session}
    } =
    await supabase.auth.getSession()

    setLogged(
      !!session
    )

  }

  loadSession()

  const {
    data:listener
  } =
  supabase.auth.onAuthStateChange(
    (_event, session)=>{

      setLogged(
        !!session
      )

    }
  )

  return ()=>{

    listener.subscription.unsubscribe()

  }

},[])

  return (

    <header className="fixed top-0 left-0 right-0 z-50 bg-slate-950/95 backdrop-blur border-b-0">

      <div className="max-w-7xl mx-auto px-4 lg:px-6">

        <div className="h-20 flex items-center justify-between">

          {/* LOGO */}

          <Link
            href="/raffles"
            className="flex items-center gap-3"
          >

            <img
              src="/logo.png"
              alt="ImpulsaSueños"
              className="h-10 w-auto"
            />

            <div className="hidden sm:block">

              <div className="text-white font-black text-lg leading-none">
                ImpulsaSueños
              </div>

              <div className="text-cyan-400 text-xs font-semibold uppercase tracking-wider">
                Sorteos
              </div>

            </div>

          </Link>

          {/* DESKTOP MENU */}

          <nav className="hidden lg:flex items-center gap-8 text-sm font-medium">

            <Link
              href="/raffles"
              className="text-slate-200 hover:text-white transition"
            >
              Sorteos
            </Link>

            <Link
              href="/raffles/winners"
              className="text-slate-200 hover:text-white transition"
            >
              Ganadores
            </Link>

            <Link
              href="/raffles/my-tickets"
              className="text-slate-200 hover:text-white transition"
            >
              Mis Participaciones
            </Link>

            <Link
  href="/raffles/faq"
  className="text-slate-200 hover:text-white transition"
>
  FAQ
</Link>

          </nav>

          {/* DESKTOP CTA */}

          <div className="hidden lg:flex items-center gap-4">

            {

              logged

              ?

              <>

              <Link
                href="/raffles/partners/dashboard"
                className="text-slate-300 hover:text-white transition"
              >

              Dashboard

              </Link>

              <button

              onClick={async()=>{

              await supabase.auth.signOut()

              window.location.href="/raffles"

              }}

              className="text-red-400 hover:text-red-300 transition"

              >

              Cerrar sesión

              </button>

              </>

              :

              <Link
                href="/raffles/login"
                className="text-slate-300 hover:text-white transition"
              >

              Entrar

              </Link>

              }

            <Link
              href="#sorteos-activos"
              className="
                bg-cyan-500
hover:bg-cyan-400
text-slate-950
                px-5
                py-3
                rounded-xl
                font-bold
                transition
              "
            >
              Participar Ahora
            </Link>

          </div>

          {/* MOBILE BUTTON */}

          <button
            onClick={() => setOpen(!open)}
            className="
              lg:hidden
              text-white
              text-2xl
            "
          >
            ☰
          </button>

        </div>

      </div>

      {/* MOBILE MENU */}

      {open && (

        <div className="lg:hidden border-t border-slate-800 bg-slate-950">

          <div className="px-6 py-6 flex flex-col gap-5">

            <Link
              href="/raffles"
              onClick={() => setOpen(false)}
              className="text-white"
            >
              Sorteos
            </Link>

            <Link
              href="/raffles/winners"
              onClick={() => setOpen(false)}
              className="text-white"
            >
              Ganadores
            </Link>

            <Link
              href="/raffles/my-tickets"
              onClick={() => setOpen(false)}
              className="text-white"
            >
              Mis Participaciones
            </Link>

            <Link
              href="/raffles/faq"
              onClick={() => setOpen(false)}
              className="text-white"
            >
              FAQ
            </Link>

                        {

            logged

            ?

            <>

            <Link

            href="/raffles/partners/dashboard"

            onClick={()=>setOpen(false)}

            className="text-white"

            >

            Dashboard

            </Link>

            <button

            onClick={async()=>{

            await supabase.auth.signOut()

            window.location.href="/raffles"

            }}

            className="text-left text-red-400"

            >

            Cerrar sesión

            </button>

            </>

            :

            <Link

            href="/raffles/login"

            onClick={()=>setOpen(false)}

            className="text-slate-300"

            >

            Entrar

            </Link>

            }

            <Link
              href="#sorteos-activos"
              onClick={() => setOpen(false)}
              className="
                bg-cyan-500
                text-center
                text-slate-950
                py-3
                rounded-xl
                font-bold
              "
            >
              Participar Ahora
            </Link>

          </div>

        </div>

      )}

    </header>

  )
}