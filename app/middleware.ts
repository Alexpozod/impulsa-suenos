import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export async function middleware(req: NextRequest) {

  const url = req.nextUrl.pathname

  // 🔥 PROTEGER SOLO RUTAS CRÍTICAS
  const protectedRoutes = [
    "/api/withdraw",
    "/api/campaign/create",
    "/api/admin",
  ]

  const isProtected = protectedRoutes.some(route =>
    url.startsWith(route)
  )

  if (!isProtected) {
    return NextResponse.next()
  }

  try {

    // 🔐 TOKEN JWT (SUPABASE)
    const token = req.headers.get("authorization")?.replace("Bearer ", "")

    if (!token) {
      return NextResponse.json(
        { error: "No autorizado (sin token)" },
        { status: 401 }
      )
    }

    // 🔥 VALIDAR TOKEN CON SUPABASE
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_SUPABASE_URL}/auth/v1/user`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        }
      }
    )

    if (!res.ok) {
      return NextResponse.json(
        { error: "Token inválido" },
        { status: 401 }
      )
    }

    const user = await res.json()

    // 🚨 PROTECCIÓN EXTRA
    if (!user?.email) {
      return NextResponse.json(
        { error: "Usuario inválido" },
        { status: 401 }
      )
    }

    // 🧠 ANTIFRAUDE BÁSICO (IP + UA)
    const ip =
      req.headers.get("x-forwarded-for") ||
      req.headers.get("x-real-ip") ||
      "unknown"

    const userAgent = req.headers.get("user-agent") || "unknown"

    // 🚫 BLOQUEO SIMPLE (puedes mejorar luego)
    if (userAgent.includes("bot") || userAgent.includes("curl")) {
      return NextResponse.json(
        { error: "Acceso bloqueado" },
        { status: 403 }
      )
    }

    // 🔥 PASAR INFO AL BACKEND
    const requestHeaders = new Headers(req.headers)

    requestHeaders.set("x-user-email", user.email)
    requestHeaders.set("x-user-id", user.id)
    requestHeaders.set("x-user-ip", ip)

    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    })

  } catch (error) {
    console.error("❌ Middleware error:", error)

    return NextResponse.json(
      { error: "Error seguridad" },
      { status: 500 }
    )
  }
}

/* =========================
   🎯 CONFIGURACIÓN
========================= */
export const config = {
  matcher: [
    "/api/withdraw",
    "/api/campaign/create",
    "/api/admin/:path*",
  ],
}
