import { NextResponse } from 'next/server';

export function middleware(request) {
  const { pathname } = request.nextUrl;
  
  // Protect the dashboard (root route)
  if (pathname === '/') {
    const sessionCookie = request.cookies.get('auth_session');
    
    // Check if the auth session cookie exists and is valid
    // In a real app with JWTs, we'd verify the token here. 
    // For this simple app, we just check if it exists and matches an expected format
    if (!sessionCookie || sessionCookie.value !== 'authenticated') {
      const loginUrl = new URL('/login', request.url);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - login (the login page itself)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|login).*)',
  ],
};
