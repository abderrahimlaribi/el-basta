import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  // Check if the request is for the admin page
  if (request.nextUrl.pathname === '/admin') {
    // Check if user is authenticated (has admin session)
    const adminSession = request.cookies.get('admin-session')
    
    if (!adminSession) {
      // Redirect to admin auth page if not authenticated
      return NextResponse.redirect(new URL('/admin-auth', request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: '/admin',
} 