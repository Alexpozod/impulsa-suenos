import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export async function middleware(req: NextRequest) {

  const url = req.nextUrl.pathname

  const protectedRoutes = [
    "/api/withdraw",
    "/api/campaign/create",
    "/api/admin",
    "/contador",
  ]

  const isProtected = protectedRoutes.some(route =>
    url.startsWith(route)
  )

  if (!isProtected) {
    return NextResponse.next()
  }

  try {

    /* =========================
       🔐 TOKEN
    ========================= */
    const token = req.headers.get("authorization")?.replace("Bearer ", "")

    if (!token) {
      return NextResponse.json(
        { error: "No autorizado (sin token)" },
        { status: 401 }
      )
    }

    /* =========================
       👤 VALIDAR USUARIO
    ========================= */
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

    if (!user?.email) {
      return NextResponse.json(
        { error: "Usuario inválido" },
        { status: 401 }
      )
    }

    /* =========================
       🧠 ANTIFRAUDE
    ========================= */
    const ip =
      req.headers.get("x-forwarded-for") ||
      req.headers.get("x-real-ip") ||
      "unknown"

    const userAgent = req.headers.get("user-agent") || "unknown"

    if (userAgent.includes("bot") || userAgent.includes("curl")) {
      return NextResponse.json(
        { error: "Acceso bloqueado" },
        { status: 403 }
      )
    }

    /* =========================
       👑 ADMIN CHECK
    ========================= */
    let isAdmin = false

    if (url.startsWith("/api/admin") || url.startsWith("/admin")) {

      const adminCheck = await fetch(
        `${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/rpc/is_admin_email`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            user_email: user.email
          }),
        }
      )

      isAdmin = await adminCheck.json()

      if (!isAdmin) {
        return NextResponse.json(
          { error: "No autorizado (admin requerido)" },
          { status: 403 }
        )
      }
    }

    /* =========================
       👨‍💼 CONTADOR CHECK
    ========================= */
    if (url.startsWith("/contador")) {

      // admin siempre puede entrar
      if (!isAdmin) {

        const profileRes = await fetch(
          `${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/profiles?email=eq.${user.email}`,
          {
            headers: {
              apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
              Authorization: `Bearer ${token}`
            }
          }
        )

        const profile = await profileRes.json()
        const role = profile?.[0]?.role || "user"

        if (role !== "contador") {
          return NextResponse.redirect(new URL("/", req.url))
        }
      }
    }

    /* =========================
       🔥 HEADERS INTERNOS
    ========================= */
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
   🎯 MATCHER
========================= */
export const config = {
  matcher: [
    "/api/withdraw",
    "/api/campaign/create",
    "/api/admin/:path*",
    "/admin/:path*",
    "/contador/:path*",
  ],
}