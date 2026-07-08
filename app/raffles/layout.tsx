import type { ReactNode } from "react"

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
  return (
    <>
  <AffiliateTracker />

  <ReferralTracker />

  <RafflesNavbar />

  <main className="min-h-screen">
    {children}
  </main>

  <RafflesFooter />
</>
  )
}