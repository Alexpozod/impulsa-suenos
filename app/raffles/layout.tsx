import type { ReactNode } from "react"

import RafflesNavbar from "@/app/components/raffles/public/RafflesNavbar"
import RafflesFooter from "@/app/components/raffles/public/RafflesFooter"
import AffiliateTracker from "@/app/components/raffles/public/AffiliateTracker"
import ReferralTracker from "@/app/components/raffles/public/ReferralTracker"

export default function RafflesLayout({
  children,
}: {
  children: ReactNode
}) {
  return (
    <>
  <AffiliateTracker />

  <ReferralTracker />

  <RafflesNavbar />

  <main className="min-h-screen pt-24">
    {children}
  </main>

  <RafflesFooter />
</>
  )
}