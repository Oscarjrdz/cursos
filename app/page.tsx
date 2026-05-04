import Link from "next/link"

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-8 p-8" style={{ background: "var(--background)" }}>
      <div className="text-center">
        <h1 className="text-4xl font-bold text-white mb-2">LearnFlow</h1>
        <p className="text-gray-400">Selecciona una vista para explorar</p>
      </div>

      <div className="flex flex-col gap-4 w-full max-w-sm">
        <Link
          href="/admin/dashboard"
          className="flex items-center gap-3 p-4 rounded-2xl border text-white font-medium transition-all hover:scale-[1.02] active:scale-[0.98]"
          style={{ background: "var(--surface)", borderColor: "var(--border)" }}
        >
          <span className="text-2xl">👑</span>
          <div>
            <div className="font-semibold">Super Admin</div>
            <div className="text-sm" style={{ color: "var(--muted)" }}>Dashboard global</div>
          </div>
        </Link>

        <Link
          href="/acme/dashboard"
          className="flex items-center gap-3 p-4 rounded-2xl border text-white font-medium transition-all hover:scale-[1.02] active:scale-[0.98]"
          style={{ background: "var(--surface)", borderColor: "var(--border)" }}
        >
          <span className="text-2xl">🏢</span>
          <div>
            <div className="font-semibold">Admin Cliente</div>
            <div className="text-sm" style={{ color: "var(--muted)" }}>Dashboard ACME Corp</div>
          </div>
        </Link>

        <Link
          href="/acme/home"
          className="flex items-center gap-3 p-4 rounded-2xl border text-white font-medium transition-all hover:scale-[1.02] active:scale-[0.98]"
          style={{ background: "var(--primary)", borderColor: "var(--primary-dark)" }}
        >
          <span className="text-2xl">🎓</span>
          <div>
            <div className="font-semibold">Vista Alumno</div>
            <div className="text-sm text-purple-200">Experiencia gamificada mobile</div>
          </div>
        </Link>
      </div>
    </div>
  )
}
