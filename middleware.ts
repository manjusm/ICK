import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const path = req.nextUrl.pathname;

    if (path.startsWith("/admin") && token?.role !== "ADMIN") {
      return NextResponse.redirect(new URL("/", req.url));
    }
    if (
      path.startsWith("/dashboard/kitchen") &&
      token?.role !== "KITCHEN_OWNER" &&
      token?.role !== "ADMIN"
    ) {
      return NextResponse.redirect(new URL("/", req.url));
    }
    return NextResponse.next();
  },
  { callbacks: { authorized: ({ token }) => !!token } }
);

export const config = {
  matcher: ["/dashboard/:path*", "/admin/:path*", "/checkout/:path*"],
};
