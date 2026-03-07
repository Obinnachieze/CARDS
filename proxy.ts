import { NextResponse, type NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/proxy'

export async function proxy(request: NextRequest) {
    const { supabase, response } = createClient(request)

    const {
        data: { user },
    } = await supabase.auth.getUser()

    const isProtectedRoute =
        request.nextUrl.pathname.startsWith('/dashboard') ||
        request.nextUrl.pathname.startsWith('/onboarding')

    if (isProtectedRoute && !user) {
        return NextResponse.redirect(new URL('/login', request.url))
    }

    // If user is logged in but trying to access login/signup, redirect to dashboard
    const isAuthRoute =
        request.nextUrl.pathname === '/login' ||
        request.nextUrl.pathname === '/signup'

    if (isAuthRoute && user) {
        return NextResponse.redirect(new URL('/dashboard', request.url))
    }

    return response
}

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - api (API routes)
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * - extension files (svg, png, etc.)
         */
        '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
    ],
}
