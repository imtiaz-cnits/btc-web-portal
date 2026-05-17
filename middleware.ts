import { NextResponse, NextRequest } from 'next/server'
import { getToken } from 'next-auth/jwt'

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Protect /admin routes
  if (pathname.startsWith('/admin')) {
    const token = await getToken({ 
      req: request, 
      secret: process.env.NEXTAUTH_SECRET || process.env.JWT_SECRET 
    })

    // Skip protection for auth pages
    if (pathname === '/admin/auth') {
      if (token && token.role === 'ADMIN') {
        return NextResponse.redirect(new URL('/admin/egp-notices', request.url))
      }
      return NextResponse.next()
    }

    if (!token) {
      return NextResponse.redirect(new URL('/admin/auth', request.url))
    }

    // Enforce admin role
    if (token.role !== 'ADMIN') {
      return new NextResponse("Access Denied. Admin role required.", { status: 403 })
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*'],
}

