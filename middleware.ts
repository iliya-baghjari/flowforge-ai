import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";

// Routes that don't require authentication
const publicRoutes = [
  "/login",
  "/register",
  "/forgot-password",
  "/reset-password",
  "/verify-email",
  "/auth/error",
];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow public routes
  if (publicRoutes.some((route) => pathname.startsWith(route))) {
    return NextResponse.next();
  }

  // Check authentication for protected routes
  try {
    const session = await auth();

    if (!session?.user) {
      // Redirect to login if not authenticated
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(loginUrl);
    }

    // Check email verification for dashboard routes
    if (pathname.startsWith("/dashboard")) {
      // Optional: You can add email verification check here
      // if (!session.user.emailVerified) {
      //   return NextResponse.redirect(new URL("/verify-email", request.url));
      // }
    }

    return NextResponse.next();
  } catch (error) {
    console.error("Auth middleware error:", error);
    return NextResponse.redirect(new URL("/login", request.url));
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    "/((?!api|_next/static|_next/image|favicon.ico|public).*)",
  ],
};
