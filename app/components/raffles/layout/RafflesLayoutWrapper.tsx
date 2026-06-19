"use client"

import { usePathname } from "next/navigation"

export default function RafflesLayoutWrapper({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()

  const isRafflesRoute =
    pathname.startsWith("/raffles")

  if (isRafflesRoute) {
    return null
  }

  return <>{children}</>
}