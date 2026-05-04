import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

// Rutas que no pertenecen a ningún tenant
const PUBLIC_PATHS = ["/", "/login", "/api", "/_next", "/favicon.ico"]

// Rutas exclusivas del Super Admin
const SUPER_ADMIN_PATHS = ["/admin"]

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Saltar rutas públicas y de sistema
  if (PUBLIC_PATHS.some((p) => pathname.startsWith(p))) {
    return NextResponse.next()
  }

  // Rutas /admin → solo Super Admin (TODO: validar con Clerk)
  if (SUPER_ADMIN_PATHS.some((p) => pathname.startsWith(p))) {
    return NextResponse.next()
  }

  // Rutas /[tenant]/... → extraer slug y pasarlo como header
  const segments = pathname.split("/").filter(Boolean)
  const tenantSlug = segments[0]

  if (tenantSlug) {
    const response = NextResponse.next()
    // El header x-tenant-slug lo leen los Server Components y Server Actions
    response.headers.set("x-tenant-slug", tenantSlug)
    return response
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
}
