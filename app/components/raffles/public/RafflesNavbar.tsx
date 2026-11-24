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

    <header className="fixed top-0 left-0 right-0 z-50 bg-[#002314]/95 backdrop-blur border-b-0">

      <div className="max-w-7xl mx-auto px-4 lg:px-6">

        <div className="h-20 flex items-center justify-between">

          {/* LOGO */}

          <Link
            href="/raffles"
            className="flex items-center gap-3"
          >

            <span className="flex items-center rounded-xl bg-[#FAF9F5] px-3 py-2">
              <img
                src="/raffles/brand/logo-impulsa.svg"
                alt="ImpulsaSueños"
                className="h-10 w-auto max-w-[180px] object-contain"
              />
            </span>

            <div className="hidden sm:block">

              <div className="text-white font-bold text-sm leading-none">
                ImpulsaSueños
              </div>

              <div className="text-[#A8C63A] text-xs font-semibold uppercase tracking-wider">
                Sorteos
              </div>

            </div>

          </Link>

          {/* DESKTOP MENU */}

          <nav className="hidden lg:flex items-center gap-8 text-sm font-medium">

            <Link
              href="/raffles"
              className="text-[#EDE8FD] hover:text-white transition"
            >
              Sorteos
            </Link>

            <Link
              href="/raffles/winners"
              className="text-[#EDE8FD] hover:text-white transition"
            >
              Ganadores
            </Link>

            <Link
              href="/raffles/my-tickets"
              className="text-[#EDE8FD] hover:text-white transition"
            >
              Mis Participaciones
            </Link>

            <Link
  href="/raffles/faq"
  className="text-[#EDE8FD] hover:text-white transition"
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
                className="text-[#EDE8FD] hover:text-white transition"
              >

              Dashboard

              </Link>

              <button

              onClick={async()=>{

              await supabase.auth.signOut()

              window.location.href="/raffles"

              }}

              className="text-[#EDE8FD] hover:text-white transition"

              >

              Cerrar sesión

              </button>

              </>

              :

              <Link
                href="/raffles/login"
                className="text-[#EDE8FD] hover:text-white transition"
              >

              Entrar

              </Link>

              }

            <Link
              href="#sorteos-activos"
              className="
                bg-[#7048E8]
hover:bg-[#5D36CC]
text-white
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

        <div className="lg:hidden border-t border-[#285143] bg-[#002314]">

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

            className="text-left text-[#EDE8FD]"

            >

            Cerrar sesión

            </button>

            </>

            :

            <Link

            href="/raffles/login"

            onClick={()=>setOpen(false)}

            className="text-[#EDE8FD]"

            >

            Entrar

            </Link>

            }

            <Link
              href="#sorteos-activos"
              onClick={() => setOpen(false)}
              className="
                bg-[#7048E8]
                text-center
                text-white
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