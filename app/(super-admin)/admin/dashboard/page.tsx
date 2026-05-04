import SuperAdminDashboard from "@/features/super-admin/components/SuperAdminDashboard"

export default function SuperAdminPage() {
  const mockData = {
    stats: { totalTenants: 3, totalStudents: 12, activeToday: 7, globalCompletion: 58 },
    tenants: [
      {
        id: "t1", name: "ACME Corp", slug: "acme",
        students: { current: 3, max: 50 },
        avgProgress: 66, status: "ACTIVE" as const,
        expiresIn: 28, lastActivity: "Hoy",
      },
      {
        id: "t2", name: "Beta Empresa", slug: "beta",
        students: { current: 6, max: 10 },
        avgProgress: 45, status: "ACTIVE" as const,
        expiresIn: 3, lastActivity: "Ayer",
      },
      {
        id: "t3", name: "Gamma SRL", slug: "gamma",
        students: { current: 3, max: 20 },
        avgProgress: 20, status: "SUSPENDED" as const,
        expiresIn: -5, lastActivity: "Hace 2 semanas",
      },
    ],
  }

  return <SuperAdminDashboard data={mockData} />
}
