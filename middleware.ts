import { NextResponse, type NextRequest } from "next/server"

// Rehearsal only. Run with an isolated data project before enabling transactions.
export function middleware(request: NextRequest) {
  if (process.env.RAFFLES_REHEARSAL === "isolated" && process.env.NEXT_PUBLIC_SUPABASE_URL === "https://raffles-build-only.invalid") {
    if (["GET", "HEAD"].includes(request.method) && !request.nextUrl.pathname.startsWith("/api/")) {
      return NextResponse.next()
    }
  }
  return new NextResponse("Ensayo de migración: operación deshabilitada.", { status: 503 })
}
export const config = { matcher: ["/((?!_next/static|_next/image).*)"] }
