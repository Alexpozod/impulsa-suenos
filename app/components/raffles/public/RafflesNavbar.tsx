"use client"

import Link from "next/link"

export default function RafflesNavbar() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-slate-950 border-b border-slate-800">

      <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">

        <Link
          href="/raffles"
          className="font-black text-2xl text-white"
        >
          ImpulsaSueños Sorteos
        </Link>

        <nav className="flex gap-6 text-white">

          <Link href="/raffles">
            Sorteos
          </Link>

          <Link href="/faq">
            FAQ
          </Link>

        </nav>

      </div>

    </header>
  )
}