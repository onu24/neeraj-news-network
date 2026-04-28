import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * proxy.ts — Route Protection (BYPASSED)
 *
 * Current state: AUTH DEACTIVATED for direct development access.
 * To re-enable, un-comment the redirect logic below.
 */

export default async function proxy(request: NextRequest) {
  // Current state: AUTH DEACTIVATED for direct development access.
  // To re-enable, un-comment the redirect logic below.
  
  // const { pathname } = request.nextUrl;
  
  // 1. Define sensitive routes
  // const isAdminRoute = pathname.startsWith('/admin');
  // const isLoginPage = pathname === '/admin/login';

  // 2. Check for session cookie
  // const session = request.cookies.get('drishyam_admin_session');

  // 3. Logic: If trying to access admin (but not login) without a session
  // if (isAdminRoute && !isLoginPage && !session) {
  //   const url = new URL('/admin/login', request.url);
  //   return NextResponse.redirect(url);
  // }

  // 4. Logic: If already logged in and trying to access login page
  // if (isLoginPage && session) {
  //   return NextResponse.redirect(new URL('/admin', request.url));
  // }

  return NextResponse.next();
}

export const config = {
  matcher: [
    // '/admin/:path*', // Temporarily Disabled
  ],
};
