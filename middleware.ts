import { NextRequest, NextResponse } from "next/server";

function unauthorized() {
  return new NextResponse("Auth required", {
    status: 401,
    headers: { "WWW-Authenticate": 'Basic realm="Wishlify Admin"' },
  });
}

export function middleware(req: NextRequest) {
  const isDev = process.env.NODE_ENV === "development";

  // ✅ Dev: можна хардкод
  const user = isDev ? "admin" : process.env.ADMIN_USER;
  const pass = isDev ? "root" : process.env.ADMIN_PASS; // можеш інше

  if (!user || !pass) return unauthorized();

  const auth = req.headers.get("authorization");
  if (!auth?.startsWith("Basic ")) return unauthorized();

  const base64 = auth.slice("Basic ".length);
  const decoded = Buffer.from(base64, "base64").toString("utf8");
  const [u, p] = decoded.split(":");

  if (u !== user || p !== pass) return unauthorized();

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
