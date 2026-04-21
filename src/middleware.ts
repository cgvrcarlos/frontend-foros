import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

type Role = 'ADMIN' | 'PONENTE' | 'STAFF' | 'ASISTENTE';
interface JwtPayload { sub: string; roles: Role[]; email: string; }

function getSecret(): Uint8Array {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error('JWT_SECRET env var is not set');
  return new TextEncoder().encode(secret);
}

async function getPayload(token: string): Promise<JwtPayload | null> {
  try {
    const { payload } = await jwtVerify(token, getSecret());
    return payload as unknown as JwtPayload;
  } catch {
    return null;
  }
}

function redirectToRole(roles: Role[], req: NextRequest): NextResponse {
  const url = req.nextUrl.clone();
  if (roles.includes('ADMIN')) url.pathname = '/admin';
  else if (roles.includes('PONENTE')) url.pathname = '/ponente';
  else if (roles.includes('STAFF')) url.pathname = '/staff';
  else url.pathname = '/eventos';
  return NextResponse.redirect(url);
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const token = req.cookies.get('accessToken')?.value ?? null;
  console.log(`[middleware] ${pathname} - token: ${token ? 'YES' : 'NO'}`);
  const payload = token ? await getPayload(token) : null;
  const roles: Role[] = payload?.roles ?? [];
  const isAuth = payload !== null;
  console.log(`[middleware] ${pathname} - isAuth: ${isAuth}, roles: ${roles}`);

  // Auth pages: redirect if already logged in
  if (pathname === '/auth/login' || pathname === '/auth/register') {
    if (isAuth) return redirectToRole(roles, req);
    return NextResponse.next();
  }

  // All protected routes: require auth
  if (!isAuth) {
    const loginUrl = req.nextUrl.clone();
    loginUrl.pathname = '/auth/login';
    return NextResponse.redirect(loginUrl);
  }

  // /admin/attendance/:eventId/scan → ADMIN | STAFF (exception to /admin/* rule)
  const scanPattern = /^\/admin\/attendance\/[^/]+\/scan$/;
  if (scanPattern.test(pathname)) {
    if (roles.includes('ADMIN') || roles.includes('STAFF')) return NextResponse.next();
    return NextResponse.redirect(new URL('/', req.url));
  }

  // /admin/* → ADMIN only
  if (pathname.startsWith('/admin')) {
    if (!roles.includes('ADMIN')) return NextResponse.redirect(new URL('/', req.url));
    return NextResponse.next();
  }

  // /ponente → PONENTE only
  if (pathname === '/ponente' || pathname.startsWith('/ponente/')) {
    if (!roles.includes('PONENTE')) return NextResponse.redirect(new URL('/', req.url));
    return NextResponse.next();
  }

  // /staff → STAFF (or ADMIN fallback)
  if (pathname === '/staff' || pathname.startsWith('/staff/')) {
    if (roles.includes('STAFF') || roles.includes('ADMIN')) return NextResponse.next();
    return NextResponse.redirect(new URL('/', req.url));
  }

  // /profile → any authenticated user
  return NextResponse.next();
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/ponente',
    '/ponente/:path*',
    '/staff',
    '/staff/:path*',
    '/profile',
    '/profile/:path*',
    '/auth/login',
    '/auth/register',
  ],
};
