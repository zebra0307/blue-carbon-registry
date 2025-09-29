import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { UserRole } from './types/auth';

// Define protected routes and their required roles
const protectedRoutes = {
  '/admin': [UserRole.ADMIN],
  '/validator': [UserRole.VALIDATOR, UserRole.ADMIN],
  '/dashboard': [UserRole.USER, UserRole.VALIDATOR, UserRole.ADMIN],
  '/projects/create': [UserRole.USER, UserRole.VALIDATOR, UserRole.ADMIN]
};

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Check if the route is protected
  const matchedRoute = Object.keys(protectedRoutes).find(route => 
    pathname.startsWith(route)
  );
  
  if (!matchedRoute) {
    return NextResponse.next();
  }
  
  // Get user data from cookie or header (you'd implement this based on your auth strategy)
  const userCookie = request.cookies.get('oceana_user');
  
  if (!userCookie) {
    // Redirect to home page with auth required message
    const url = request.nextUrl.clone();
    url.pathname = '/';
    url.searchParams.set('auth_required', 'true');
    return NextResponse.redirect(url);
  }
  
  try {
    const userData = JSON.parse(userCookie.value);
    const requiredRoles = protectedRoutes[matchedRoute as keyof typeof protectedRoutes];
    
    if (!requiredRoles.includes(userData.role)) {
      // Redirect to unauthorized page or home
      const url = request.nextUrl.clone();
      url.pathname = '/';
      url.searchParams.set('unauthorized', 'true');
      return NextResponse.redirect(url);
    }
    
    return NextResponse.next();
  } catch (error) {
    // Invalid user data, redirect to home
    const url = request.nextUrl.clone();
    url.pathname = '/';
    url.searchParams.set('auth_required', 'true');
    return NextResponse.redirect(url);
  }
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/validator/:path*',
    '/dashboard/:path*',
    '/projects/create'
  ]
};