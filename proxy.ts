import { NextResponse } from "next/server";
import { auth } from "@/auth";

// Next.js 16 renamed `middleware` to `proxy` (Node.js runtime by default).
// We wrap with NextAuth's `auth` so `req.auth` carries the session.
//
// Protected: /settings (account settings — logged-in only).
// Public profiles at /u/[username] stay open to guests per PLAN.md; only the
// owner-edit surface would be gated, and that lives inside the page/route.
export default auth((req) => {
  const { pathname } = req.nextUrl;
  const isLoggedIn = !!req.auth;

  const isProtected = pathname.startsWith("/settings");

  if (isProtected && !isLoggedIn) {
    const loginUrl = new URL("/login", req.nextUrl);
    loginUrl.searchParams.set("callbackUrl", pathname);
    loginUrl.searchParams.set("message", "Sign in to access your profile.");
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
});

export const config = {
  // Run on app routes but skip static assets, image optimizer, and API/auth.
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
