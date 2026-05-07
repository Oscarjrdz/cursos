import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { verifySession, getSessionFromRequest } from "@/lib/session"

const PUBLIC_EXACT = ["/", "/login"]
const PUBLIC_PREFIXES = ["/api", "/_next", "/favicon.ico"]

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  if (PUBLIC_EXACT.includes(pathname)) return NextResponse.next()
  if (PUBLIC_PREFIXES.some((p) => pathname.startsWith(p))) return NextResponse.next()
  if (/^\/[^/]+\/login$/.test(pathname)) return NextResponse.next()

  const token = getSessionFromRequest(request)
  const session = token ? await verifySession(token) : null

  // /admin/* → SUPER_ADMIN only
  if (pathname.startsWith("/admin")) {
    if (session?.role !== "SUPER_ADMIN") {
      return NextResponse.redirect(new URL("/login", request.url))
    }
    return NextResponse.next()
  }

  // /[slug]/dashboard → TENANT_ADMIN or SUPER_ADMIN
  const dashboardMatch = pathname.match(/^\/([^/]+)\/dashboard/)
  if (dashboardMatch) {
    const slug = dashboardMatch[1]
    if (!session) return NextResponse.redirect(new URL(`/${slug}/login`, request.url))
    if (session.role === "SUPER_ADMIN") return NextResponse.next()
    if (session.role === "TENANT_ADMIN" && session.tenantSlug === slug) return NextResponse.next()
    return NextResponse.redirect(new URL(`/${slug}/login`, request.url))
  }

  // /[slug]/home|lesson|ranking|achievements|profile → any authenticated user of that tenant
  const studentRouteMatch = pathname.match(/^\/([^/]+)\/(home|lesson|ranking|achievements|profile)/)
  if (studentRouteMatch) {
    const slug = studentRouteMatch[1]
    if (!session) return NextResponse.redirect(new URL(`/${slug}/login`, request.url))
    if (session.role === "SUPER_ADMIN") return NextResponse.next()
    if (session.tenantSlug === slug) return NextResponse.next()
    return NextResponse.redirect(new URL(`/${slug}/login`, request.url))
  }

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
