import { useCallback, useEffect, useRef, useState } from "react"
import {
  ActivityIndicator,
  Animated,
  Dimensions,
  FlatList,
  Image,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from "react-native"
import { useRouter } from "expo-router"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import { useAuth } from "../../lib/auth"
import { apiRequest } from "../../lib/api"

const { width: SW } = Dimensions.get("window")
const ZIGZAG = SW * 0.2

/* ── Types ─────────────────────────────────────────────────── */
type Lesson = { id: string; title: string; order: number; completed: boolean; isCurrent: boolean }
type Module = { id: string; title: string; order: number; lessons: Lesson[] }
type HomeData = {
  student: { name: string; xpTotal: number }
  streak: { currentDays: number }
  modules: Module[]
  courseName: string | null
  progressPct: number
}

/* ── Colors ─────────────────────────────────────────────────── */
const COLORS = [
  "#7c3aed", "#0891b2", "#059669", "#d97706",
  "#e11d48", "#2563eb", "#9333ea", "#0d9488",
]

/* ── Module banner ──────────────────────────────────────────── */
function ModuleBanner({ module, colorIdx }: { module: Module; colorIdx: number }) {
  const color = COLORS[colorIdx % COLORS.length]
  const completed = module.lessons.every((l) => l.completed)
  const started = module.lessons.some((l) => l.completed)
  const completedCount = module.lessons.filter((l) => l.completed).length
  const pct = module.lessons.length > 0 ? completedCount / module.lessons.length : 0
  return (
    <View style={[styles.banner, { backgroundColor: color, shadowColor: color }]}>
      <View style={styles.bannerContent}>
        <View style={{ flex: 1 }}>
          <Text style={styles.bannerSub}>Módulo {module.order}</Text>
          <Text style={styles.bannerTitle} numberOfLines={2}>{module.title}</Text>
        </View>
        <View style={[styles.bannerIcon, { backgroundColor: "rgba(255,255,255,0.2)" }]}>
          <Text style={{ fontSize: 20 }}>{completed ? "✓" : started ? "📖" : "≡"}</Text>
        </View>
      </View>
      <View style={styles.bannerBar}>
        <View style={[styles.bannerFill, { width: `${Math.round(pct * 100)}%` as `${number}%` }]} />
      </View>
    </View>
  )
}

/* ── Pulsing dot ─────────────────────────────────────────────── */
function PulsingRing({ color }: { color: string }) {
  const scale = useRef(new Animated.Value(1)).current
  const opacity = useRef(new Animated.Value(0.35)).current

  useEffect(() => {
    const anim = Animated.loop(
      Animated.sequence([
        Animated.parallel([
          Animated.timing(scale, { toValue: 1.28, duration: 1100, useNativeDriver: true }),
          Animated.timing(opacity, { toValue: 0.06, duration: 1100, useNativeDriver: true }),
        ]),
        Animated.parallel([
          Animated.timing(scale, { toValue: 1, duration: 1100, useNativeDriver: true }),
          Animated.timing(opacity, { toValue: 0.35, duration: 1100, useNativeDriver: true }),
        ]),
      ])
    )
    anim.start()
    return () => anim.stop()
  }, [])

  return (
    <Animated.View style={[
      StyleSheet.absoluteFillObject,
      { borderRadius: 999, backgroundColor: color, transform: [{ scale }], opacity },
    ]} />
  )
}

/* ── Lesson Node ─────────────────────────────────────────────── */
function LessonNode({ lesson, colorIdx, onPress }: {
  lesson: Lesson; colorIdx: number; onPress: () => void
}) {
  const color = COLORS[colorIdx % COLORS.length]

  if (lesson.completed) {
    return (
      <View style={styles.nodeWrap}>
        <View style={[styles.nodeCircle, { backgroundColor: "#22c55e", shadowColor: "#22c55e" }]}>
          <Text style={{ color: "white", fontSize: 28, fontWeight: "900" }}>✓</Text>
        </View>
        <View style={styles.starsRow}>
          {[0, 1, 2].map((i) => (
            <Text key={i} style={{ fontSize: 11, color: "#FFCC00" }}>★</Text>
          ))}
        </View>
        <Text style={[styles.nodeLabel, { color: "#64748b" }]} numberOfLines={2}>{lesson.title}</Text>
      </View>
    )
  }

  if (lesson.isCurrent) {
    return (
      <View style={styles.nodeWrap}>
        <View style={{ width: 80, height: 80, position: "relative" }}>
          <PulsingRing color={color} />
          <Pressable
            onPress={onPress}
            style={[styles.nodeCircle, {
              backgroundColor: color,
              shadowColor: color,
              position: "absolute",
              top: 5, left: 5, right: 5, bottom: 5,
            }]}
          >
            <Text style={{ color: "white", fontSize: 24 }}>▶</Text>
          </Pressable>
        </View>
        <View style={styles.startBadge}>
          <Text style={[styles.startLabel, { color }]}>INICIAR</Text>
        </View>
        <View style={styles.starsRow}>
          {[0, 1, 2].map((i) => (
            <Text key={i} style={{ fontSize: 11, color: "#CBD5E1" }}>★</Text>
          ))}
        </View>
        <Text style={[styles.nodeLabel, { color, fontWeight: "800" }]} numberOfLines={2}>{lesson.title}</Text>
      </View>
    )
  }

  return (
    <View style={[styles.nodeWrap, { opacity: 0.5 }]}>
      <View style={[styles.nodeCircle, {
        backgroundColor: "#e2e8f0",
        borderWidth: 4, borderColor: "#cbd5e1",
        shadowColor: "#94a3b8",
      }]}>
        <Text style={{ fontSize: 22, color: "#94a3b8" }}>🔒</Text>
      </View>
      <View style={styles.starsRow}>
        {[0, 1, 2].map((i) => (
          <Text key={i} style={{ fontSize: 11, color: "#CBD5E1" }}>★</Text>
        ))}
      </View>
      <Text style={[styles.nodeLabel, { color: "#94a3b8" }]} numberOfLines={2}>{lesson.title}</Text>
    </View>
  )
}

/* ── Connector ───────────────────────────────────────────────── */
function Connector({ completed }: { completed: boolean }) {
  return (
    <View style={{
      width: 4, height: 32, borderRadius: 2, marginVertical: 2,
      backgroundColor: completed ? "#22c55e" : "#e2e8f0",
    }} />
  )
}

/* ── Main ────────────────────────────────────────────────────── */
export default function HomeScreen() {
  const router = useRouter()
  const { token } = useAuth()
  const insets = useSafeAreaInsets()
  const [data, setData] = useState<HomeData | null>(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const progressAnim = useRef(new Animated.Value(0)).current

  const fetchData = useCallback(async () => {
    try {
      const d = await apiRequest<HomeData>("/api/mobile/home", { token })
      setData(d)
      Animated.timing(progressAnim, {
        toValue: d.progressPct,
        duration: 900,
        useNativeDriver: false,
      }).start()
    } catch {
      // silent
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [token])

  useEffect(() => { fetchData() }, [fetchData])

  const onRefresh = () => { setRefreshing(true); fetchData() }

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#f8fafc" }}>
        <ActivityIndicator size="large" color="#7c3aed" />
      </View>
    )
  }

  const firstName = data?.student.name.split(" ")[0] ?? ""
  const totalLessons = data?.modules.reduce((a, m) => a + m.lessons.length, 0) ?? 0
  const completedLessons = data?.modules.reduce((a, m) => a + m.lessons.filter((l) => l.completed).length, 0) ?? 0

  // Build flat list items: banners + lesson groups
  type Item =
    | { kind: "header" }
    | { kind: "banner"; module: Module; colorIdx: number }
    | { kind: "lessons"; module: Module; colorIdx: number }
    | { kind: "done" }

  const items: Item[] = [{ kind: "header" }]
  data?.modules.forEach((m, i) => {
    items.push({ kind: "banner", module: m, colorIdx: i })
    items.push({ kind: "lessons", module: m, colorIdx: i })
  })
  if (completedLessons > 0 && completedLessons === totalLessons) {
    items.push({ kind: "done" })
  }

  return (
    <View style={{ flex: 1, backgroundColor: "#f8fafc" }}>
      {/* Top bar */}
      <View style={[styles.topBar, { paddingTop: insets.top + 8 }]}>
        <View style={styles.brand}>
          <Image
            source={{ uri: "https://cdn-icons-png.flaticon.com/128/11051/11051168.png" }}
            style={{ width: 28, height: 28, borderRadius: 14 }}
          />
          <Text style={styles.brandText}>
            <Text style={{ color: "#0f172a" }}>Candidatic </Text>
            <Text style={{ color: "#7c3aed" }}>Knowledge</Text>
          </Text>
        </View>
        <View style={styles.statsRow}>
          <View style={styles.statBadge}>
            <Text style={{ fontSize: 16 }}>🔥</Text>
            <Text style={styles.statNum}>{data?.streak.currentDays ?? 0}</Text>
          </View>
          <View style={[styles.statBadge, { backgroundColor: "#faf5ff", borderColor: "#ddd6fe" }]}>
            <Text style={{ fontSize: 14 }}>💎</Text>
            <Text style={[styles.statNum, { color: "#7c3aed" }]}>{data?.student.xpTotal ?? 0}</Text>
          </View>
        </View>
      </View>

      <FlatList
        data={items}
        keyExtractor={(_, i) => String(i)}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#7c3aed" />}
        contentContainerStyle={{ paddingBottom: 24 }}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => {
          if (item.kind === "header") {
            return data?.courseName ? (
              <View style={styles.courseHeader}>
                <Text style={styles.hi}>Hola, {firstName}</Text>
                <Text style={styles.courseName}>{data.courseName}</Text>
                <View style={styles.progressRow}>
                  <View style={styles.progressTrack}>
                    <Animated.View style={[
                      styles.progressFill,
                      { width: progressAnim.interpolate({ inputRange: [0, 100], outputRange: ["0%", "100%"] }) },
                    ]} />
                  </View>
                  <Text style={styles.progressLabel}>{completedLessons}/{totalLessons}</Text>
                </View>
              </View>
            ) : null
          }

          if (item.kind === "banner") {
            return (
              <View style={{ marginHorizontal: 16, marginBottom: 8, marginTop: 8 }}>
                <ModuleBanner module={item.module} colorIdx={item.colorIdx} />
              </View>
            )
          }

          if (item.kind === "lessons") {
            return (
              <View style={{ alignItems: "center", marginBottom: 24 }}>
                {item.module.lessons.map((lesson, lIdx) => {
                  const isLeft = lIdx % 2 === 0
                  return (
                    <View key={lesson.id} style={{ alignItems: "center", width: "100%" }}>
                      <View style={{
                        alignSelf: isLeft ? "flex-start" : "flex-end",
                        marginLeft: isLeft ? ZIGZAG : 0,
                        marginRight: isLeft ? 0 : ZIGZAG,
                      }}>
                        <LessonNode
                          lesson={lesson}
                          colorIdx={item.colorIdx}
                          onPress={() => router.push(`/lesson/${lesson.id}`)}
                        />
                      </View>
                      {lIdx < item.module.lessons.length - 1 && (
                        <Connector completed={lesson.completed} />
                      )}
                    </View>
                  )
                })}
              </View>
            )
          }

          if (item.kind === "done") {
            return (
              <View style={styles.doneCard}>
                <Text style={{ fontSize: 28, marginBottom: 8 }}>⭐⭐⭐</Text>
                <Text style={styles.doneTitle}>¡Curso completado!</Text>
                <Text style={styles.doneSub}>Eres increíble, {firstName}</Text>
              </View>
            )
          }

          return null
        }}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  topBar: {
    backgroundColor: "#ffffff",
    borderBottomWidth: 2,
    borderBottomColor: "#f1f5f9",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingBottom: 10,
  },
  brand: { flexDirection: "row", alignItems: "center", gap: 8 },
  brandText: { fontSize: 13, fontWeight: "800" },
  statsRow: { flexDirection: "row", gap: 8 },
  statBadge: {
    flexDirection: "row", alignItems: "center", gap: 4,
    paddingHorizontal: 10, paddingVertical: 6,
    backgroundColor: "#fff7ed", borderWidth: 2, borderColor: "#FED7AA",
    borderRadius: 16,
  },
  statNum: { fontSize: 13, fontWeight: "800", color: "#EA580C" },
  courseHeader: { paddingHorizontal: 16, paddingTop: 20, paddingBottom: 16 },
  hi: { fontSize: 13, color: "#94a3b8", fontWeight: "600", marginBottom: 2 },
  courseName: { fontSize: 18, fontWeight: "900", color: "#0f172a", marginBottom: 12, lineHeight: 24 },
  progressRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  progressTrack: {
    flex: 1, height: 12, borderRadius: 6,
    backgroundColor: "#e2e8f0", overflow: "hidden",
  },
  progressFill: {
    height: "100%", borderRadius: 6,
    backgroundColor: "#7c3aed",
  },
  progressLabel: { fontSize: 12, fontWeight: "800", color: "#7c3aed" },
  banner: {
    borderRadius: 18, padding: 16,
    shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.3, shadowRadius: 12,
    elevation: 6,
  },
  bannerContent: { flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 12 },
  bannerSub: { color: "rgba(255,255,255,0.7)", fontSize: 11, fontWeight: "700", letterSpacing: 1.2 },
  bannerTitle: { color: "#ffffff", fontSize: 15, fontWeight: "800", lineHeight: 20 },
  bannerIcon: {
    width: 40, height: 40, borderRadius: 12,
    justifyContent: "center", alignItems: "center",
  },
  bannerBar: {
    height: 6, borderRadius: 3, backgroundColor: "rgba(255,255,255,0.25)", overflow: "hidden",
  },
  bannerFill: { height: "100%", borderRadius: 3, backgroundColor: "rgba(255,255,255,0.9)" },
  nodeWrap: { alignItems: "center", width: 110 },
  nodeCircle: {
    width: 72, height: 72, borderRadius: 36,
    justifyContent: "center", alignItems: "center",
    shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8,
    elevation: 4,
  },
  startBadge: { marginTop: 4 },
  startLabel: { fontSize: 11, fontWeight: "900", letterSpacing: 1 },
  starsRow: { flexDirection: "row", gap: 2, marginTop: 4 },
  nodeLabel: {
    fontSize: 10, fontWeight: "600",
    textAlign: "center", marginTop: 4,
    maxWidth: 90, lineHeight: 13,
  },
  doneCard: {
    marginHorizontal: 16, marginTop: 8, borderRadius: 24, padding: 24,
    backgroundColor: "#7c3aed", alignItems: "center",
    shadowColor: "#7c3aed", shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4, shadowRadius: 16, elevation: 8,
  },
  doneTitle: { color: "#ffffff", fontWeight: "900", fontSize: 20, marginBottom: 4 },
  doneSub: { color: "rgba(255,255,255,0.75)", fontSize: 14 },
})
