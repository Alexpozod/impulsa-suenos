import type { ReactNode } from "react"

import RafflesNavbar from "@/app/components/raffles/public/RafflesNavbar"
import RafflesFooter from "@/app/components/raffles/public/RafflesFooter"
import AffiliateTracker from "@/app/components/raffles/public/AffiliateTracker"

export default function RafflesLayout({
  children,
}: {
  children: ReactNode
}) {
  return (
    <>
  <AffiliateTracker />

  <RafflesNavbar />

  <main className="min-h-screen pt-24">
    {children}
  </main>

  <RafflesFooter />
</>
  )
}