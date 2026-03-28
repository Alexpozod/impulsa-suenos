import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import "./globals.css"

// 🔥 IMPORTAR COMPONENTES
import Navbar from "./components/Navbar"
import Footer from "./components/Footer"

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
          bg-gray-50 
          text-gray-900
        `}
      >

        {/* 🔝 NAVBAR GLOBAL */}
        <Navbar />

        {/* 📄 CONTENIDO */}
        <div className="min-h-screen">
          {children}
        </div>

        {/* 🔻 FOOTER GLOBAL */}
        <Footer />

      </body>
    </html>
  )
}
