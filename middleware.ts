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

  // 🔥 CAMBIO CLAVE
  const {
    data: { session }
  } = await supabase.auth.getSession()

  const user = session?.user

  console.log("👤 SESSION USER:", user?.email)

  const isAdminRoute = req.nextUrl.pathname.startsWith('/admin')

  if (isAdminRoute) {

    if (!user) {
      console.log("❌ NO USER SESSION")
      return NextResponse.redirect(new URL('/login', req.url))
    }

    // 🔥 buscar profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .maybeSingle()

    console.log("📄 PROFILE:", profile)

    if (!profile || profile.role !== 'admin') {
      console.log("❌ NO ADMIN")
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
