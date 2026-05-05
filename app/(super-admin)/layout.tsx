import SuperAdminSidebar from "@/features/super-admin/components/SuperAdminSidebar"

export default function SuperAdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen" style={{ background: "#f1f5f9" }}>
      <SuperAdminSidebar />
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  )
}
