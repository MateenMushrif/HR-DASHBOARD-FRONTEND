// middleware.ts
import { NextRequest, NextResponse } from "next/server";

export default function middleware(req: NextRequest) {
    const token = req.cookies.get("auth_token")?.value;
    const isLoggedIn = !!token;

    const path = req.nextUrl.pathname;

    // Auth-related pages (exact match is correct here)
    const authPages = ["/login", "/signup"];

    // Protect everything under /dashboard
    const isDashboardRoute = path.startsWith("/dashboard");

    // If logged in → block access to /login or /signup
    if (isLoggedIn && authPages.includes(path)) {
        return NextResponse.redirect(new URL("/dashboard", req.url));
    }

    // If NOT logged in → block access to dashboard routes
    if (!isLoggedIn && isDashboardRoute) {
        return NextResponse.redirect(new URL("/login", req.url));
    }

    return NextResponse.next();
}

// Limit where middleware runs
export const config = {
    matcher: [
        "/login",
        "/signup",
        "/dashboard/:path*",
    ],
};
