import { Roboto, Urbanist } from "next/font/google"

// Raffles-only fonts. Do not modify the shared root layout or Campaign styles.
export const rafflesDisplayFont = Urbanist({
  subsets: ["latin"],
  variable: "--font-raffles-display",
  display: "swap",
  weight: ["500", "700", "900"]
})

export const rafflesBodyFont = Roboto({
  subsets: ["latin"],
  variable: "--font-raffles-body",
  display: "swap",
  weight: ["300", "400", "500", "700"]
})

export const rafflesFontVariables =
  `${rafflesDisplayFont.variable} ${rafflesBodyFont.variable}`
