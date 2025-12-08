// proxy.ts
import { NextRequest, NextResponse } from "next/server";

export default function proxy(req: NextRequest) {
    const token = req.cookies.get("auth_token")?.value;
    const isLoggedIn = !!token;

    console.log("Proxy middleware - isLoggedIn:", isLoggedIn);
    console.log("Proxy middleware - token:", token);

    const path = req.nextUrl.pathname;

    // Pages
    const authPages = ["/login", "/signup"];
    const protectedPages = ["/dashboard"];

    // If logged in → don’t allow /login or /signup
    if (isLoggedIn && authPages.includes(path)) {
        return NextResponse.redirect(new URL("/dashboard", req.url));
    }

    // If NOT logged in → don’t allow /dashboard
    if (!isLoggedIn && protectedPages.includes(path)) {
        return NextResponse.redirect(new URL("/login", req.url));
    }

    return NextResponse.next();
}

// Limit where this runs
export const config = {
    matcher: ["/login", "/signup", "/dashboard"],
};
