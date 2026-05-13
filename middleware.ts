import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/request'
import { verifyJWT } from '@/lib/jwt'

export async function middleware(request: NextRequest) {
  const token = request.cookies.get('token')?.value
  const { pathname } = request.nextUrl

  // Protect /admin routes
  if (pathname.startsWith('/admin')) {
    // Skip protection for auth pages
    if (pathname === '/admin/auth') {
      if (token) {
        const payload = await verifyJWT(token)
        if (payload) {
          return NextResponse.redirect(new URL('/admin/dashboard', request.url))
        }
      }
      return NextResponse.next()
    }

    if (!token) {
      return NextResponse.redirect(new URL('/admin/auth', request.url))
    }

    const payload = await verifyJWT(token)
    if (!payload) {
      const response = NextResponse.redirect(new URL('/admin/auth', request.url))
      response.cookies.delete('token')
      return response
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*'],
}
