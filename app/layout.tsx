import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import "./globals.css"

import Navbar from "@/app/components/Navbar"
import Footer from "@/app/components/Footer"

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
})

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
})

export const metadata: Metadata = {
  title: "ImpulsaSueños",
  description: "Gana premios reales mientras ayudas a otros",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es">
      <body
        className={`
          ${geistSans.variable} 
          ${geistMono.variable} 
          antialiased 
          bg-white 
          text-gray-900
        `}
      >

        <Navbar />

        <main className="min-h-screen">
          {children}
        </main>

        <Footer />

      </body>
    </html>
  )
}
