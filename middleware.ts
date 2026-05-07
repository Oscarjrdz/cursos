import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { verifySession, getSessionFromRequest } from "@/lib/session"

const PUBLIC = ["/login", "/api", "/_next", "/favicon.ico"]

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Always allow public paths and tenant login pages
  if (PUBLIC.some((p) => pathname.startsWith(p))) return NextResponse.next()
  if (pathname === "/") return NextResponse.next()
  if (/^\/[^/]+\/login$/.test(pathname)) return NextResponse.next()

  const token = getSessionFromRequest(request)
  const session = token ? await verifySession(token) : null

  // Protect /admin/* → must be SUPER_ADMIN
  if (pathname.startsWith("/admin")) {
    if (session?.role !== "SUPER_ADMIN") {
      return NextResponse.redirect(new URL("/login", request.url))
    }
    return NextResponse.next()
  }

  // Protect /[slug]/dashboard and /[slug]/home → must be TENANT_ADMIN for that slug or SUPER_ADMIN
  const tenantRouteMatch = pathname.match(/^\/([^/]+)\/(dashboard|home)/)
  if (tenantRouteMatch) {
    const slug = tenantRouteMatch[1]
    if (!session) {
      return NextResponse.redirect(new URL(`/${slug}/login`, request.url))
    }
    if (session.role === "SUPER_ADMIN") return NextResponse.next()
    if (session.role === "TENANT_ADMIN" && session.tenantSlug === slug) {
      return NextResponse.next()
    }
    return NextResponse.redirect(new URL(`/${slug}/login`, request.url))
  }

  // Pass tenant slug as header for other tenant routes
  const segments = pathname.split("/").filter(Boolean)
  if (segments.length > 0) {
    const res = NextResponse.next()
    res.headers.set("x-tenant-slug", segments[0])
    return res
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
}
