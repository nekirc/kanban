import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

export async function middleware(request: NextRequest) {
  const token = await getToken({ req: request });
  const { pathname } = request.nextUrl;

  // Protect dashboard and board routes
  if (pathname.startsWith('/dashboard') || pathname.startsWith('/board')) {
    if (!token) {
      return NextResponse.redirect(new URL('/login', request.url));
    }

    // If 2FA is enabled but not verified, redirect to 2FA page
    const twoFactorEnabled = token.twoFactorEnabled;
    const is2FAVerified = request.cookies.get('zf_2fa_verified')?.value === 'true';

    if (twoFactorEnabled && !is2FAVerified && !pathname.startsWith('/auth/2fa')) {
      return NextResponse.redirect(new URL('/auth/2fa', request.url));
    }
  }

  // If already logged in and 2FA verified, redirect away from login/register/2fa
  if (pathname === '/login' || pathname === '/register' || pathname === '/auth/2fa') {
      if (token) {
          const twoFactorEnabled = token.twoFactorEnabled;
          const is2FAVerified = request.cookies.get('zf_2fa_verified')?.value === 'true';

          if (!twoFactorEnabled || is2FAVerified) {
              return NextResponse.redirect(new URL('/dashboard', request.url));
          }
      }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*', '/board/:path*', '/login', '/register', '/auth/2fa'],
};
