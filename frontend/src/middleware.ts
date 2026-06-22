import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const token = request.cookies.get('token')?.value;
  
  if (!token && !request.nextUrl.pathname.startsWith('/login')) {
    return NextResponse.redirect(new URL('/login', request.url));
  }
  
  if (token && request.nextUrl.pathname.startsWith('/login')) {
    return NextResponse.redirect(new URL('/employees', request.url));
  }
  
  if (request.nextUrl.pathname === '/') {
    return NextResponse.redirect(new URL(token ? '/employees' : '/login', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/', '/login', '/employees/:path*', '/projects/:path*', '/audit/:path*'],
};
