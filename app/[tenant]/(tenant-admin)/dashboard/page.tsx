import TenantAdminDashboard from "@/features/tenant-admin/components/TenantAdminDashboard"

export default function TenantDashboardPage({ params }: { params: { tenant: string } }) {
  const mockData = {
    tenant: { name: "ACME Corp", slug: params.tenant, maxStudents: 50 },
    stats: { activeStudents: 3, avgProgress: 66, atRisk: 1, nearExpiry: 0 },
    students: [
      {
        id: "s1", name: "María Torres", email: "maria@acme.com",
        course: "Fundamentos de Ventas B2B", progress: 100,
        lastAccess: "Hoy", streakDays: 12, status: "ACTIVE" as const,
        subscriptionDaysLeft: 28,
      },
      {
        id: "s2", name: "Ana García", email: "ana@acme.com",
        course: "Fundamentos de Ventas B2B", progress: 66,
        lastAccess: "Hoy", streakDays: 5, status: "ACTIVE" as const,
        subscriptionDaysLeft: 15,
      },
      {
        id: "s3", name: "Carlos López", email: "carlos@acme.com",
        course: "Fundamentos de Ventas B2B", progress: 33,
        lastAccess: "Hace 3 días", streakDays: 0, status: "INACTIVE" as const,
        subscriptionDaysLeft: 5,
      },
    ],
  }

  return <TenantAdminDashboard data={mockData} />
}
