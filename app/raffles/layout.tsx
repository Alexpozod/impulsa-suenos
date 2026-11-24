import type { ReactNode } from "react"
import { rafflesFontVariables } from "@/lib/raffles/brand/fonts"
import "@/lib/raffles/brand/raffles-brand.css"

import { createClient }
from "@supabase/supabase-js"

import RafflesNavbar
from "@/app/components/raffles/public/RafflesNavbar"

import RafflesFooter
from "@/app/components/raffles/public/RafflesFooter"

import AffiliateTracker
from "@/app/components/raffles/public/AffiliateTracker"

import ReferralTracker
from "@/app/components/raffles/public/ReferralTracker"

const supabase = createClient(

  process.env.NEXT_PUBLIC_SUPABASE_URL!,

  process.env.SUPABASE_SERVICE_ROLE_KEY!

)

export default async function RafflesLayout({
  children,
}: {
  children: ReactNode
}) {

  const {
    data: settings
  } =
    await supabase
      .schema("raffles")
      .from("public_site_settings")
      .select("site_mode")
      .eq(
        "id",
        "00000000-0000-0000-0000-000000000001"
      )
      .single()

    if (

    settings?.site_mode === "landing"

  ) {

    return (

      <main className={`raffles-brand bg-[#FAF9F5] text-[#002314] ${rafflesFontVariables} min-h-screen`}>

        {children}

      </main>

    )

  }

  if (settings?.site_mode === "landing") {

  return (

    <main className={`raffles-brand bg-[#FAF9F5] text-[#002314] ${rafflesFontVariables} min-h-screen`}>

      {children}

    </main>

  )

}

return (

  <div className={`raffles-brand bg-[#FAF9F5] text-[#002314] ${rafflesFontVariables}`}>

    <AffiliateTracker />

    <ReferralTracker />

    <RafflesNavbar />

    <main className={`raffles-brand bg-[#FAF9F5] text-[#002314] ${rafflesFontVariables} min-h-screen`}>

      {children}

    </main>

    <RafflesFooter />

  </div>

)

}