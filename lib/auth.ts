// TODO: Replace with Clerk when auth is set up
// Temporary mock session for development

import { cookies } from "next/headers"

export type MockSession = {
  userId: string
  email: string
  name: string
  role: "SUPER_ADMIN" | "TENANT_ADMIN" | "STUDENT"
  tenantId: string | null
}

const MOCK_USERS: Record<string, MockSession> = {
  "super-admin": {
    userId: "mock-super-admin",
    email: "oscar@learnflow.app",
    name: "Oscar (Super Admin)",
    role: "SUPER_ADMIN",
    tenantId: null,
  },
  "tenant-admin": {
    userId: "mock-tenant-admin",
    email: "admin@acme.com",
    name: "Admin ACME",
    role: "TENANT_ADMIN",
    tenantId: "mock-tenant-id",
  },
  student: {
    userId: "mock-student",
    email: "alumno@acme.com",
    name: "Alumno Demo",
    role: "STUDENT",
    tenantId: "mock-tenant-id",
  },
}

export async function getMockSession(): Promise<MockSession | null> {
  const cookieStore = await cookies()
  const mockRole = cookieStore.get("mock-role")?.value ?? "student"
  return MOCK_USERS[mockRole] ?? null
}
