import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

function unauthorized() {
  return new NextResponse("Auth required", {
    status: 401,
    headers: { "WWW-Authenticate": 'Basic realm="Wishlify Admin"' },
  });
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (pathname.startsWith("/admin")) {
    const isDev = process.env.NODE_ENV === "development";
    const user = isDev ? "admin" : process.env.ADMIN_USER;
    const pass = isDev ? "root" : process.env.ADMIN_PASS;

    if (!user || !pass) return unauthorized();

    const auth = req.headers.get("authorization");
    if (!auth?.startsWith("Basic ")) return unauthorized();

    const decoded = Buffer.from(auth.slice("Basic ".length), "base64").toString("utf8");
    const [u, p] = decoded.split(":");
    if (u !== user || p !== pass) return unauthorized();

    return NextResponse.next();
  }

  if (pathname === "/") {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    if (token) return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/", "/admin/:path*"],
};
