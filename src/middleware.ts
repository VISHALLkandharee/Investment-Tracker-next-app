// src/middleware.ts
import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    console.log("Middleware: Processing request for", req.nextUrl.pathname);
    console.log("Middleware: Token found?", !!req.nextauth.token);
    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => {
        console.log("Middleware: Authorized callback, token:", !!token);
        return !!token;
      },
    },
    pages: {
      signIn: "/login",
    },
  }
);

// ✅ FIXED: Remove the empty string at the end
export const config = {
  matcher: [
    "/dashboard/:path*",
    "/portfolios/:path*", 
    "/investments/:path*",
  ],
};