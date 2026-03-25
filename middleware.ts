import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(req: NextRequest) {

  const res = NextResponse.next()

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get: (key) => req.cookies.get(key)?.value,
        set: (key, value, options) => {
          res.cookies.set(key, value, options)
        },
        remove: (key, options) => {
          res.cookies.set(key, '', options)
        }
      }
    }
  )

  const {
    data: { user },
    error
  } = await supabase.auth.getUser()

  console.log("👤 USER:", user?.email)

  const isAdminRoute = req.nextUrl.pathname.startsWith('/admin')

  if (isAdminRoute) {

    // ❌ no logueado
    if (!user) {
      console.log("❌ NO USER")
      return NextResponse.redirect(new URL('/login', req.url))
    }

    // 🔥 buscar profile REAL
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .maybeSingle()

    console.log("📄 PROFILE:", profile)

    if (profileError || !profile) {
      console.log("❌ PROFILE NO ENCONTRADO")
      return NextResponse.redirect(new URL('/', req.url))
    }

    if (profile.role !== 'admin') {
      console.log("❌ NO ES ADMIN")
      return NextResponse.redirect(new URL('/', req.url))
    }

    console.log("✅ ADMIN OK")
    return res
  }

  return res
}

export const config = {
  matcher: ['/admin/:path*'],
}
