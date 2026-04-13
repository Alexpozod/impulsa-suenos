import { NextResponse } from "next/server"

export async function GET() {
  try {
    /* =========================
       💱 TASA BASE (fallback)
    ========================= */
    let rate = 900

    /* =========================
       🌍 API EXTERNA (opcional)
    ========================= */
    try {
      const res = await fetch("https://api.exchangerate-api.com/v4/latest/USD")

      if (res.ok) {
        const data = await res.json()

        if (data?.rates?.CLP) {
          rate = data.rates.CLP
        }
      }
    } catch (err) {
      console.log("⚠️ usando tasa fallback")
    }

    return NextResponse.json({
      rate,
      source: "exchange-api",
    })

  } catch (error) {
    return NextResponse.json({
      rate: 900,
      source: "fallback",
    })
  }
}