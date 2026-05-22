import { useCallback, useEffect, useState } from "react"
import {
  ActivityIndicator,
  Alert,
  LayoutAnimation,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native"
import { useLocalSearchParams, useRouter } from "expo-router"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import { Ionicons } from "@expo/vector-icons"
import { useAuth } from "../../lib/auth"
import { apiRequest } from "../../lib/api"

type LessonItem = { id: string; title: string; order: number; contentType: string }
type ModuleItem = { id: string; title: string; order: number; lessons: LessonItem[] }
type StudentEnrolled = { id: string; name: string; progress: number }
type CourseDetail = {
  id: string; title: string; description: string | null
  modules: ModuleItem[]
  enrolledStudents: StudentEnrolled[]
  unenrolledStudents: { id: string; name: string }[]
}

const DUO = {
  green: "#58CC02", greenDark: "#46A302",
  gold: "#FFC800", blue: "#1CB0F6",
  red: "#FF4B4B", purple: "#A855F7", orange: "#FF9600",
  bg: "#F7F7F7", card: "#FFFFFF", text: "#3C3C3C",
  textMuted: "#AFAFAF", border: "#E5E5E5",
}

const MODULE_COLORS = [
  "#7c3aed", "#0891b2", "#16a34a", "#d97706", "#e11d48", "#2563eb",
]

export default function CourseDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const router = useRouter()
  const { token } = useAuth()
  const insets = useSafeAreaInsets()
  const [data, setData] = useState<CourseDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [expandedModule, setExpandedModule] = useState<string | null>(null)
  const [actionLoading, setActionLoading] = useState(false)

  const fetchData = useCallback(async () => {
    try {
      const d = await apiRequest<CourseDetail>(`/api/mobile/admin/courses/${id}`, { token })
      setData(d)
    } catch { /* silent */ }
    finally { setLoading(false); setRefreshing(false) }
  }, [id, token])

  useEffect(() => { fetchData() }, [fetchData])
  const onRefresh = () => { setRefreshing(true); fetchData() }

  function toggleModule(moduleId: string) {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut)
    setExpandedModule(prev => prev === moduleId ? null : moduleId)
  }

  async function handleEnroll(studentId: string) {
    setActionLoading(true)
    try {
      await apiRequest(`/api/mobile/admin/students/${studentId}/enroll`, {
        method: "POST", token, body: { courseId: id },
      })
      fetchData()
    } catch (e) {
      Alert.alert("Error", e instanceof Error ? e.message : "Error")
    } finally { setActionLoading(false) }
  }

  async function handleUnenroll(studentId: string) {
    setActionLoading(true)
    try {
      await apiRequest(`/api/mobile/admin/students/${studentId}/enroll`, {
        method: "DELETE", token, body: { courseId: id },
      })
      fetchData()
    } catch (e) {
      Alert.alert("Error", e instanceof Error ? e.message : "Error")
    } finally { setActionLoading(false) }
  }

  async function handleEnrollAll() {
    if (!data || data.unenrolledStudents.length === 0) return
    Alert.alert(
      "Asignar a todos",
      `¿Inscribir a ${data.unenrolledStudents.length} alumnos en este curso?`,
      [
        { text: "Cancelar", style: "cancel" },
        { text: "Asignar", onPress: async () => {
          setActionLoading(true)
          try {
            for (const s of data.unenrolledStudents) {
              await apiRequest(`/api/mobile/admin/students/${s.id}/enroll`, {
                method: "POST", token, body: { courseId: id },
              })
            }
            fetchData()
          } catch (e) {
            Alert.alert("Error", e instanceof Error ? e.message : "Error")
          } finally { setActionLoading(false) }
        }},
      ]
    )
  }

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: DUO.bg }}>
        <ActivityIndicator size="large" color={DUO.purple} />
      </View>
    )
  }

  if (!data) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: DUO.bg }}>
        <Text style={{ color: DUO.textMuted }}>Curso no encontrado</Text>
        <Pressable onPress={() => router.back()} style={{ marginTop: 16 }}>
          <Text style={{ color: "#7c3aed", fontWeight: "700" }}>Volver</Text>
        </Pressable>
      </View>
    )
  }

  const totalLessons = data.modules.reduce((a, m) => a + m.lessons.length, 0)

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      {/* Top bar */}
      <View style={styles.topBar}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={20} color="#64748b" />
        </Pressable>
        <Text style={styles.topTitle} numberOfLines={1}>{data.title}</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={DUO.purple} />}
        contentContainerStyle={{ padding: 16, paddingBottom: 32 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Course info card */}
        <View style={styles.infoCard}>
          <Text style={styles.courseTitle}>{data.title}</Text>
          {data.description && <Text style={styles.courseDesc}>{data.description}</Text>}
          <View style={styles.infoPills}>
            <View style={styles.infoPill}>
              <Text style={styles.infoPillText}>📦 {data.modules.length} módulos</Text>
            </View>
            <View style={styles.infoPill}>
              <Text style={styles.infoPillText}>📄 {totalLessons} lecciones</Text>
            </View>
            <View style={[styles.infoPill, { backgroundColor: "rgba(88,204,2,0.1)" }]}>
              <Text style={[styles.infoPillText, { color: DUO.green }]}>👥 {data.enrolledStudents.length} inscritos</Text>
            </View>
          </View>
        </View>

        {/* Modules */}
        <Text style={styles.sectionTitle}>📦 Contenido del curso</Text>
        {data.modules.map((m, idx) => {
          const color = MODULE_COLORS[idx % MODULE_COLORS.length]
          const isOpen = expandedModule === m.id
          return (
            <View key={m.id}>
              <Pressable style={[styles.moduleRow, { borderLeftColor: color }]} onPress={() => toggleModule(m.id)}>
                <View style={[styles.moduleIcon, { backgroundColor: color + "18" }]}>
                  <Ionicons name="layers" size={18} color={color} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.moduleTitle}>Módulo {m.order}: {m.title}</Text>
                  <Text style={styles.moduleSub}>{m.lessons.length} lecciones</Text>
                </View>
                <Ionicons name={isOpen ? "chevron-up" : "chevron-down"} size={18} color={DUO.textMuted} />
              </Pressable>
              {isOpen && m.lessons.map(l => (
                <View key={l.id} style={styles.lessonRow}>
                  <View style={[styles.lessonIcon, {
                    backgroundColor: l.contentType === "QUIZ" ? "#fffbeb" : l.contentType === "TEXT_AND_QUIZ" ? "#f3e8ff" : "#f0fdf4"
                  }]}>
                    <Text style={{ fontSize: 12 }}>
                      {l.contentType === "QUIZ" ? "⚡" : l.contentType === "TEXT_AND_QUIZ" ? "📝" : "📖"}
                    </Text>
                  </View>
                  <Text style={styles.lessonTitle} numberOfLines={1}>{l.title}</Text>
                  <Text style={styles.lessonType}>
                    {l.contentType === "QUIZ" ? "Quiz" : l.contentType === "TEXT_AND_QUIZ" ? "Mixto" : "Lectura"}
                  </Text>
                </View>
              ))}
            </View>
          )
        })}

        {/* Enrolled students */}
        <Text style={[styles.sectionTitle, { marginTop: 20 }]}>👥 Alumnos inscritos ({data.enrolledStudents.length})</Text>
        {data.enrolledStudents.length === 0 ? (
          <Text style={styles.noStudents}>Ningún alumno inscrito aún</Text>
        ) : (
          data.enrolledStudents.map(s => (
            <View key={s.id} style={styles.studentRow}>
              <View style={[styles.studentAvatar, { backgroundColor: DUO.green }]}>
                <Text style={styles.studentInitials}>{s.name.split(" ").slice(0, 2).map(w => w[0]).join("").toUpperCase()}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.studentName}>{s.name}</Text>
                <View style={styles.studentProgressWrap}>
                  <View style={styles.studentProgressTrack}>
                    <View style={[styles.studentProgressFill, { width: `${s.progress}%` as `${number}%` }]} />
                  </View>
                  <Text style={styles.studentProgressText}>{s.progress}%</Text>
                </View>
              </View>
              <Pressable onPress={() => handleUnenroll(s.id)} hitSlop={8} disabled={actionLoading}>
                <Ionicons name="close-circle" size={20} color={DUO.red} />
              </Pressable>
            </View>
          ))
        )}

        {/* Unenrolled — assign */}
        {data.unenrolledStudents.length > 0 && (
          <>
            <View style={styles.assignHeader}>
              <Text style={styles.sectionTitle}>➕ Asignar alumnos</Text>
              <Pressable style={styles.assignAllBtn} onPress={handleEnrollAll} disabled={actionLoading}>
                <Text style={styles.assignAllText}>Asignar todos</Text>
              </Pressable>
            </View>
            {data.unenrolledStudents.map(s => (
              <Pressable key={s.id} style={styles.assignRow} onPress={() => handleEnroll(s.id)} disabled={actionLoading}>
                <View style={[styles.studentAvatar, { backgroundColor: "#E5E5E5" }]}>
                  <Text style={[styles.studentInitials, { color: "#777" }]}>{s.name.split(" ").slice(0, 2).map(w => w[0]).join("").toUpperCase()}</Text>
                </View>
                <Text style={[styles.studentName, { flex: 1 }]}>{s.name}</Text>
                <Ionicons name="add-circle" size={22} color={DUO.green} />
              </Pressable>
            ))}
          </>
        )}
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: DUO.bg },
  topBar: {
    flexDirection: "row", alignItems: "center", gap: 10,
    paddingHorizontal: 16, paddingVertical: 12,
    backgroundColor: DUO.card, borderBottomWidth: 3, borderBottomColor: DUO.border,
  },
  backBtn: {
    width: 36, height: 36, borderRadius: 18, backgroundColor: "#f1f5f9",
    justifyContent: "center", alignItems: "center",
  },
  topTitle: { flex: 1, fontSize: 16, fontWeight: "800", color: DUO.text },

  infoCard: {
    backgroundColor: DUO.card, borderRadius: 20, padding: 18, marginBottom: 20,
    borderWidth: 2, borderColor: DUO.border, borderBottomWidth: 4, borderBottomColor: "#D5D5D5",
  },
  courseTitle: { fontSize: 18, fontWeight: "900", color: DUO.text },
  courseDesc: { fontSize: 13, color: DUO.textMuted, fontWeight: "600", marginTop: 6, lineHeight: 18 },
  infoPills: { flexDirection: "row", gap: 6, marginTop: 12, flexWrap: "wrap" },
  infoPill: { backgroundColor: "#F5F5F5", borderRadius: 10, paddingHorizontal: 10, paddingVertical: 5 },
  infoPillText: { fontSize: 12, fontWeight: "700", color: DUO.textMuted },

  sectionTitle: { fontSize: 15, fontWeight: "900", color: DUO.text, marginBottom: 10 },

  /* Modules */
  moduleRow: {
    flexDirection: "row", alignItems: "center", gap: 10,
    backgroundColor: DUO.card, borderRadius: 14, padding: 12, marginBottom: 6,
    borderWidth: 2, borderColor: DUO.border, borderLeftWidth: 4,
  },
  moduleIcon: { width: 36, height: 36, borderRadius: 10, justifyContent: "center", alignItems: "center" },
  moduleTitle: { fontSize: 13, fontWeight: "800", color: DUO.text },
  moduleSub: { fontSize: 11, fontWeight: "600", color: DUO.textMuted },

  lessonRow: {
    flexDirection: "row", alignItems: "center", gap: 8,
    marginLeft: 20, paddingVertical: 8, paddingHorizontal: 10,
    borderLeftWidth: 2, borderLeftColor: "#E5E5E5",
  },
  lessonIcon: { width: 26, height: 26, borderRadius: 8, justifyContent: "center", alignItems: "center" },
  lessonTitle: { flex: 1, fontSize: 12, fontWeight: "600", color: DUO.text },
  lessonType: { fontSize: 10, fontWeight: "700", color: DUO.textMuted },

  /* Students */
  noStudents: { fontSize: 13, fontWeight: "600", color: DUO.textMuted, textAlign: "center", paddingVertical: 16 },
  studentRow: {
    flexDirection: "row", alignItems: "center", gap: 10,
    backgroundColor: DUO.card, borderRadius: 14, padding: 12, marginBottom: 6,
    borderWidth: 2, borderColor: DUO.border,
  },
  studentAvatar: {
    width: 34, height: 34, borderRadius: 17, justifyContent: "center", alignItems: "center",
  },
  studentInitials: { fontSize: 12, fontWeight: "900", color: "#fff" },
  studentName: { fontSize: 13, fontWeight: "700", color: DUO.text },
  studentProgressWrap: { flexDirection: "row", alignItems: "center", gap: 6, marginTop: 3 },
  studentProgressTrack: { flex: 1, height: 6, borderRadius: 3, backgroundColor: "#E5E5E5", overflow: "hidden" },
  studentProgressFill: { height: "100%", borderRadius: 3, backgroundColor: DUO.green },
  studentProgressText: { fontSize: 10, fontWeight: "800", color: DUO.green, minWidth: 28 },

  assignHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginTop: 16 },
  assignAllBtn: {
    backgroundColor: DUO.green, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10,
    borderBottomWidth: 2, borderBottomColor: "#46A302",
  },
  assignAllText: { fontSize: 11, fontWeight: "800", color: "#fff" },

  assignRow: {
    flexDirection: "row", alignItems: "center", gap: 10,
    backgroundColor: "#FAFAFA", borderRadius: 14, padding: 12, marginBottom: 4,
    borderWidth: 1, borderColor: DUO.border, borderStyle: "dashed",
  },
})
