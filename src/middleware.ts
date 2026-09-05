import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

// Protects every /admin route. Any non-ADMIN/STAFF user is redirected
// to the storefront home instead of being shown a broken/blank admin page.
export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const role = (token as any)?.role;
    if (req.nextUrl.pathname.startsWith("/admin")) {
      if (role !== "ADMIN" && role !== "STAFF") {
        return NextResponse.redirect(new URL("/", req.url));
      }
    }
    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token, // must at least be logged in
    },
    pages: { signIn: "/login" },
  }
);

export const config = {
  matcher: ["/admin/:path*"],
};
