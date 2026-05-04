import StudentHome from "@/features/student/components/StudentHome"

export default function StudentHomePage() {
  const mockData = {
    student: { name: "Ana García", avatarUrl: null, xpTotal: 30 },
    streak: { currentDays: 5, shields: 1 },
    enrollment: {
      course: { title: "Fundamentos de Ventas B2B" },
      progressPct: 66,
      nextLesson: { id: "lesson-003", title: "Identificando al decisor" },
    },
    leaderboard: [
      { rank: 1, name: "María Torres", xpTotal: 40, isCurrentUser: false },
      { rank: 2, name: "Ana García", xpTotal: 30, isCurrentUser: true },
      { rank: 3, name: "Carlos López", xpTotal: 10, isCurrentUser: false },
    ],
    achievements: [
      { id: "ach-001", title: "Primera lección", earned: true },
      { id: "ach-002", title: "Racha de fuego", earned: false },
      { id: "ach-003", title: "Curso completado", earned: false },
    ],
  }

  return <StudentHome data={mockData} tenantSlug="acme" />
}
