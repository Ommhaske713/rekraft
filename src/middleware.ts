import { NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { NextRequestWithAuth } from 'next-auth/middleware';

export default async function middleware(request: NextRequestWithAuth) {
  const token = await getToken({ 
    req: request,
    cookieName: process.env.NODE_ENV === 'production' 
      ? '__Secure-next-auth.session-token'
      : 'next-auth.session-token'
  });

  const url = request.nextUrl.clone();

  const publicPaths = [
    '/', 
    '/signin', 
    '/signup', 
    '/verify', 
    '/products'
  ];

  const authPages = ['/signin', '/signup', '/verify'];

  const isPublicPath = publicPaths.some(path => 
    url.pathname === path || url.pathname.startsWith(`${path}/`)
  );

  const isAuthPage = authPages.some(path => 
    url.pathname === path || url.pathname.startsWith(`${path}/`)
  );

  const isSellerPath = url.pathname === '/seller' || url.pathname.startsWith('/seller/');

  const isDashboardPath = url.pathname === '/dashboard' || url.pathname.startsWith('/dashboard/');

  if (token && isAuthPage) {
    console.log('User already authenticated, redirecting to appropriate dashboard');

    if (token.role === 'seller') {
      return NextResponse.redirect(new URL('/seller', request.url));
    } else {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
  }

  if (isSellerPath) {
    if (!token) {
      return NextResponse.redirect(new URL('/signin', request.url));
    }
    
    if (token.role !== 'seller') {
      console.log('Non-seller attempting to access seller area');
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
  }

  if (!token && isDashboardPath) {
    return NextResponse.redirect(new URL('/signin', request.url));
  }

  if (!token && !isPublicPath) {
    return NextResponse.redirect(new URL('/signin', request.url));
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: [
    '/',
    '/signin',
    '/signup',
    '/verify',
    '/dashboard/:path*',
    '/seller/:path*',
    '/profile/:path*',
    '/settings/:path*',
    '/cart/:path*',
    '/orders/:path*',
    '/negotiations/:path*',
    '/products/:path*'
  ],
}