import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function middleware(req: NextRequest) {

  const url = req.nextUrl

  // proteger rutas admin
  if (url.pathname.startsWith("/admin")) {

    const auth = req.headers.get("authorization")

    if (!auth) {
      return new Response("Auth required", {
        status: 401,
        headers: {
          "WWW-Authenticate": 'Basic realm="Admin Panel"',
        },
      })
    }

    const base64 = auth.split(" ")[1]
    const decoded = atob(base64)

    const [user, pass] = decoded.split(":")

    if (
      user !== process.env.ADMIN_USER ||
      pass !== process.env.ADMIN_PASS
    ) {
      return new Response("Unauthorized", { status: 401 })
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/admin/:path*"],
}
