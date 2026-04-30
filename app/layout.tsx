import type { Metadata } from "next"
import type { ReactNode } from "react"

import "./globals.css"

import CookieBanner from "./components/CookieBanner"
import Navbar from "@/app/components/Navbar"
import Footer from "@/app/components/Footer"

export const metadata: Metadata = {
  title: "ImpulsaSueños",
  description: "Gana premios reales mientras ayudas a otros",
}

export default function RootLayout({
  children,
}: {
  children: ReactNode
}) {
  return (
    <html lang="es">
      
      {/* 🔥 FUENTES PRO */}
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Poppins:wght@600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>

      <body
        className={`
          antialiased 
          bg-white 
          text-gray-900
        `}
        style={{
          fontFamily: "Inter, sans-serif",
        }}
      >
        <Navbar />

        <main className="min-h-screen pt-20 md:pt-24">
          {children}
        </main>

        <Footer />

        {/* 🍪 COOKIE BANNER GLOBAL */}
        <CookieBanner />
      </body>
    </html>
  )
}