import type { Metadata } from "next"
import type { ReactNode } from "react"

import "./globals.css"

import CookieBanner from "./components/CookieBanner"
import Navbar from "@/app/components/Navbar"
import Footer from "@/app/components/Footer"

import RafflesLayoutWrapper from "@/app/components/raffles/layout/RafflesLayoutWrapper"

export const metadata: Metadata = {
  title: "ImpulsaSueños | Crowdfunding Solidario",
  description:
    "Plataforma de crowdfunding solidario donde personas reales ayudan a cumplir sueños y necesidades reales.",
  icons: {
    icon: "/favicon.png",
  },
}

export default function RootLayout({
  children,
}: {
  children: ReactNode
}) {
  return (
    <html lang="es">

      <head>

        {/* 🔎 GOOGLE SEARCH CONSOLE */}
        <meta
          name="google-site-verification"
          content="Pp7udm12pDRZULTpMooPPoFnJGb6tZXUZMhmVj7mVTY"
        />

        {/* 🔥 FUENTES PRO */}
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Poppins:wght@600;700;800&display=swap"
          rel="stylesheet"
        />

      </head>

      <body
        className={`
          antialiased 
          bg-bg 
          text-text
        `}
        style={{
          fontFamily: "Inter, sans-serif",
        }}
      >
        <RafflesLayoutWrapper>
  <Navbar />
</RafflesLayoutWrapper>

        <main className="min-h-screen pt-20 md:pt-24">
          {children}
        </main>

        <RafflesLayoutWrapper>
  <Footer />
</RafflesLayoutWrapper>

        {/* 🍪 COOKIE BANNER GLOBAL */}
        <RafflesLayoutWrapper>
  <CookieBanner />
</RafflesLayoutWrapper>
      </body>
    </html>
  )
}