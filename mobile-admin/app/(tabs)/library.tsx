import { useCallback, useEffect, useState } from "react"
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from "react-native"
import { useRouter } from "expo-router"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import { Ionicons } from "@expo/vector-icons"
import { useAuth } from "../../lib/auth"
import { apiRequest } from "../../lib/api"

type CourseItem = {
  id: string; title: string; description: string | null
  moduleCount: number; lessonCount: number; enrolledCount: number
}
type LibraryData = { courses: CourseItem[] }

const DUO = {
  gold: "#FFC800", goldDark: "#E5A800",
  green: "#58CC02", blue: "#1CB0F6", purple: "#A855F7",
  bg: "#F7F7F7", card: "#FFFFFF", text: "#3C3C3C",
  textMuted: "#AFAFAF", border: "#E5E5E5",
}

const COURSE_COLORS = [
  { bg: "#7c3aed", shadow: "#5b21b6" },
  { bg: "#0891b2", shadow: "#0369a1" },
  { bg: "#16a34a", shadow: "#15803d" },
  { bg: "#d97706", shadow: "#b45309" },
  { bg: "#e11d48", shadow: "#9f1239" },
  { bg: "#2563eb", shadow: "#1e40af" },
]

const COURSE_ICONS: React.ComponentProps<typeof Ionicons>["name"][] = [
  "book", "bulb", "leaf", "flash", "trophy", "rocket",
]

export default function LibraryScreen() {
  const router = useRouter()
  const { token } = useAuth()
  const insets = useSafeAreaInsets()
  const [data, setData] = useState<LibraryData | null>(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  const fetchData = useCallback(async () => {
    try {
      const d = await apiRequest<LibraryData>("/api/mobile/admin/courses", { token })
      setData(d)
    } catch { /* silent */ }
    finally { setLoading(false); setRefreshing(false) }
  }, [token])

  useEffect(() => { fetchData() }, [fetchData])
  const onRefresh = () => { setRefreshing(true); fetchData() }

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>📚 Biblioteca</Text>
        <Text style={styles.subtitle}>Catálogo de cursos disponibles</Text>
      </View>

      {loading ? (
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
          <ActivityIndicator size="large" color={DUO.gold} />
        </View>
      ) : (
        <FlatList
          data={data?.courses ?? []}
          keyExtractor={item => item.id}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={DUO.gold} />}
          contentContainerStyle={{ padding: 16, paddingBottom: 32 }}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyWrap}>
              <Text style={{ fontSize: 48 }}>📖</Text>
              <Text style={styles.emptyTitle}>Sin cursos</Text>
              <Text style={styles.emptySub}>No hay cursos asignados a tu empresa aún</Text>
            </View>
          }
          ListHeaderComponent={
            data && data.courses.length > 0 ? (
              <View style={styles.headerBanner}>
                <Text style={{ fontSize: 16 }}>📚</Text>
                <Text style={styles.bannerText}>{data.courses.length} cursos disponibles</Text>
              </View>
            ) : null
          }
          renderItem={({ item, index }) => {
            const colorSet = COURSE_COLORS[index % COURSE_COLORS.length]
            const icon = COURSE_ICONS[index % COURSE_ICONS.length]

            return (
              <Pressable
                style={({ pressed }) => [styles.courseCard, { shadowColor: colorSet.shadow }, pressed && { transform: [{ scale: 0.98 }] }]}
                onPress={() => router.push(`/course/${item.id}`)}
              >
                {/* Color accent bar */}
                <View style={[styles.courseAccent, { backgroundColor: colorSet.bg }]} />

                <View style={styles.courseBody}>
                  {/* Icon + Title */}
                  <View style={styles.courseTopRow}>
                    <View style={[styles.courseIconWrap, { backgroundColor: colorSet.bg + "18" }]}>
                      <Ionicons name={icon} size={22} color={colorSet.bg} />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.courseTitle} numberOfLines={2}>{item.title}</Text>
                      {item.description && (
                        <Text style={styles.courseDesc} numberOfLines={2}>{item.description}</Text>
                      )}
                    </View>
                    <Ionicons name="chevron-forward" size={20} color={DUO.textMuted} />
                  </View>

                  {/* Stats pills */}
                  <View style={styles.coursePills}>
                    <View style={styles.pill}>
                      <Ionicons name="layers-outline" size={12} color={DUO.purple} />
                      <Text style={styles.pillText}>{item.moduleCount} módulos</Text>
                    </View>
                    <View style={styles.pill}>
                      <Ionicons name="document-text-outline" size={12} color={DUO.blue} />
                      <Text style={styles.pillText}>{item.lessonCount} lecciones</Text>
                    </View>
                    <View style={[styles.pill, { backgroundColor: "rgba(88,204,2,0.08)" }]}>
                      <Ionicons name="people-outline" size={12} color={DUO.green} />
                      <Text style={[styles.pillText, { color: DUO.green }]}>{item.enrolledCount} alumnos</Text>
                    </View>
                  </View>
                </View>
              </Pressable>
            )
          }}
        />
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: DUO.bg },
  header: {
    backgroundColor: DUO.card, paddingHorizontal: 20, paddingTop: 12, paddingBottom: 16,
    borderBottomWidth: 3, borderBottomColor: DUO.border,
  },
  title: { fontSize: 22, fontWeight: "900", color: DUO.text },
  subtitle: { fontSize: 12, color: DUO.textMuted, fontWeight: "600", marginTop: 1 },

  headerBanner: {
    flexDirection: "row", alignItems: "center", gap: 8,
    backgroundColor: "rgba(255,200,0,0.1)", borderRadius: 14,
    paddingHorizontal: 16, paddingVertical: 10, marginBottom: 14,
    borderWidth: 2, borderColor: "rgba(255,200,0,0.2)",
  },
  bannerText: { fontSize: 13, fontWeight: "700", color: DUO.goldDark },

  courseCard: {
    backgroundColor: DUO.card, borderRadius: 18, marginBottom: 12, overflow: "hidden",
    borderWidth: 2, borderColor: DUO.border, borderBottomWidth: 4, borderBottomColor: "#D5D5D5",
    shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 4,
  },
  courseAccent: { height: 4 },
  courseBody: { padding: 14 },
  courseTopRow: { flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 12 },
  courseIconWrap: {
    width: 46, height: 46, borderRadius: 14, justifyContent: "center", alignItems: "center",
  },
  courseTitle: { fontSize: 15, fontWeight: "800", color: DUO.text, lineHeight: 20 },
  courseDesc: { fontSize: 12, fontWeight: "600", color: DUO.textMuted, marginTop: 2, lineHeight: 16 },

  coursePills: { flexDirection: "row", gap: 6, flexWrap: "wrap" },
  pill: {
    flexDirection: "row", alignItems: "center", gap: 4,
    backgroundColor: "#F5F5F5", borderRadius: 10,
    paddingHorizontal: 10, paddingVertical: 5,
  },
  pillText: { fontSize: 11, fontWeight: "700", color: DUO.textMuted },

  emptyWrap: { alignItems: "center", paddingTop: 40 },
  emptyTitle: { fontSize: 18, fontWeight: "900", color: DUO.text, marginTop: 12 },
  emptySub: { fontSize: 13, fontWeight: "600", color: DUO.textMuted, marginTop: 4, textAlign: "center" },
})
