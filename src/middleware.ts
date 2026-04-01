import { NextResponse, type NextRequest } from 'next/server';
import { updateSession } from '@/lib/supabase/middleware';

export async function middleware(request: NextRequest) {
  // Update the Supabase session, this avoids session expiry drops
  return await updateSession(request);
}

// Config blocks Next.js from running middleware on static paths and images
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - .*\\.(svg|png|jpg|jpeg|gif|webp|webmanifest|json|mp3|wav|ogg)$ (asset extensions)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|webmanifest|json|mp3|wav|ogg)).*)',
  ],
};
