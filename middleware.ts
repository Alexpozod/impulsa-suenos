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

  const { data } = await supabase.auth.getUser()
  const user = data.user

  const isAdminRoute = req.nextUrl.pathname.startsWith('/admin')

  if (isAdminRoute) {

    // ❌ no logueado
    if (!user) {
      return NextResponse.redirect(new URL('/login', req.url))
    }

    // ❌ no es admin
    if (user.email !== 'alex.taz17@gmail.com') {
      return NextResponse.redirect(new URL('/', req.url))
    }
  }

  return res
}

export const config = {
  matcher: ['/admin/:path*'],
}
