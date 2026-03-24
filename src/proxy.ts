import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { createServerClient } from '@supabase/ssr'

const PUBLIC_ROUTES = ['/login', '/auth/callback']

export async function proxy(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          response = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()
  const { pathname } = request.nextUrl

  // Handle Auth redirect
  if (!user && !PUBLIC_ROUTES.includes(pathname)) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url, 307)
  }

  // Handle i18n Locale Resolution
  let locale = request.cookies.get('NEXT_LOCALE')?.value
  if (!locale) {
    const acceptLang = request.headers.get('accept-language') || ''
    locale = acceptLang.includes('es') ? 'es' : 'en'
    response.cookies.set('NEXT_LOCALE', locale, { maxAge: 60 * 60 * 24 * 365, path: '/' })
  }
  
  // Set locale in header so layouts can read it easily via headers() if needed
  // or they can just read the cookie. We'll set it in response as well.
  response.headers.set('x-next-locale', locale)

  return response
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
