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
import { Ionicons } from "@expo/vector-icons"
import { useAuth } from "../../lib/auth"
import { apiRequest } from "../../lib/api"

const { width: SW, height: SH } = Dimensions.get("window")
const ZIGZAG = SW * 0.18

/* ── Types ──────────────────────────────────────────────── */
type Lesson  = { id: string; title: string; order: number; completed: boolean; isCurrent: boolean }
type Module  = { id: string; title: string; order: number; lessons: Lesson[] }
type HomeData = {
  student: { name: string; xpTotal: number }
  streak:  { currentDays: number }
  modules: Module[]
  courseName: string | null
  progressPct: number
}

/* ── Palette ─────────────────────────────────────────────── */
const PALETTE = [
  { bg: "#7c3aed", shadow: "#5b21b6", light: "#ede9fe" },
  { bg: "#0891b2", shadow: "#0369a1", light: "#e0f7fa" },
  { bg: "#16a34a", shadow: "#15803d", light: "#dcfce7" },
  { bg: "#d97706", shadow: "#b45309", light: "#fef3c7" },
  { bg: "#e11d48", shadow: "#9f1239", light: "#ffe4e6" },
  { bg: "#2563eb", shadow: "#1e40af", light: "#dbeafe" },
  { bg: "#9333ea", shadow: "#7e22ce", light: "#f3e8ff" },
  { bg: "#0d9488", shadow: "#0f766e", light: "#ccfbf1" },
]
const col = (i: number) => PALETTE[i % PALETTE.length]

/* ── Dot-grid background ─────────────────────────────────── */
function DotGrid() {
  const SP = 26
  const dots: React.ReactNode[] = []
  const rows = Math.ceil(SH / SP) + 2
  const cols = Math.ceil(SW / SP) + 2
  for (let r = 0; r <= rows; r++)
    for (let c = 0; c <= cols; c++)
      dots.push(
        <View key={`${r}-${c}`} style={{
          position: "absolute", top: r * SP, left: c * SP,
          width: 3, height: 3, borderRadius: 1.5,
          backgroundColor: "rgba(124,58,237,0.09)",
        }} />
      )
  return <View style={StyleSheet.absoluteFillObject} pointerEvents="none">{dots}</View>
}

/* ── Stars row ───────────────────────────────────────────── */
function Stars({ filled, color }: { filled: number; color: string }) {
  return (
    <View style={s.starsRow}>
      {[0, 1, 2].map(i => (
        <Ionicons
          key={i}
          name={i < filled ? "star" : "star-outline"}
          size={12}
          color={i < filled ? "#FBBF24" : color}
        />
      ))}
    </View>
  )
}

/* ── Dotted connector ────────────────────────────────────── */
function Connector({ completed }: { completed: boolean }) {
  const dotColor = completed ? "#22c55e" : "#c4b5fd"
  return (
    <View style={s.connectorWrap}>
      {[0, 1, 2, 3].map(i => (
        <View key={i} style={[s.connectorDot, { backgroundColor: dotColor }]} />
      ))}
    </View>
  )
}

/* ── Pulsing ring ────────────────────────────────────────── */
function PulseRing({ color }: { color: string }) {
  const scale   = useRef(new Animated.Value(1)).current
  const opacity = useRef(new Animated.Value(0.4)).current
  useEffect(() => {
    const a = Animated.loop(Animated.sequence([
      Animated.parallel([
        Animated.timing(scale,   { toValue: 1.3,  duration: 1000, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0.05, duration: 1000, useNativeDriver: true }),
      ]),
      Animated.parallel([
        Animated.timing(scale,   { toValue: 1,    duration: 1000, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0.4,  duration: 1000, useNativeDriver: true }),
      ]),
    ]))
    a.start()
    return () => a.stop()
  }, [scale, opacity])
  return (
    <Animated.View style={[
      StyleSheet.absoluteFillObject,
      { borderRadius: 999, backgroundColor: color, transform: [{ scale }], opacity },
    ]} />
  )
}

/* ── Duolingo-style 3-D node ─────────────────────────────── */
function Node3D({
  size = 76, bg, shadowColor, children, onPress, disabled,
}: {
  size?: number; bg: string; shadowColor: string
  children: React.ReactNode; onPress?: () => void; disabled?: boolean
}) {
  const Inner = (
    <View style={[
      s.nodeCircle,
      {
        width: size, height: size, borderRadius: size / 2,
        backgroundColor: bg,
        borderBottomWidth: 5,
        borderBottomColor: shadowColor,
        shadowColor,
      },
    ]}>
      {children}
    </View>
  )
  if (!onPress || disabled) return Inner
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => ({ transform: [{ scale: pressed ? 0.93 : 1 }] })}
    >
      {Inner}
    </Pressable>
  )
}

/* ── Lesson node ─────────────────────────────────────────── */
function LessonNode({ lesson, colorIdx, onPress }: {
  lesson: Lesson; colorIdx: number; onPress: () => void
}) {
  const { bg, shadow } = col(colorIdx)

  if (lesson.completed) {
    return (
      <View style={s.nodeWrap}>
        <Node3D bg="#22c55e" shadowColor="#16a34a">
          <Ionicons name="checkmark" size={34} color="white" />
        </Node3D>
        <Stars filled={3} color="#d1fae5" />
        <Text style={[s.nodeLabel, { color: "#15803d" }]} numberOfLines={2}>{lesson.title}</Text>
      </View>
    )
  }

  if (lesson.isCurrent) {
    return (
      <View style={s.nodeWrap}>
        {/* INICIAR badge above */}
        <View style={[s.startBadge, { backgroundColor: bg }]}>
          <Text style={s.startText}>INICIAR</Text>
          <Ionicons name="arrow-down" size={11} color="white" />
        </View>
        {/* Node with pulse */}
        <View style={{ width: 86, height: 86, marginVertical: 2 }}>
          <PulseRing color={bg} />
          <View style={{ position: "absolute", top: 5, left: 5 }}>
            <Node3D size={76} bg={bg} shadowColor={shadow} onPress={onPress}>
              <Ionicons name="play" size={28} color="white" style={{ marginLeft: 4 }} />
            </Node3D>
          </View>
        </View>
        <Stars filled={0} color="#ddd6fe" />
        <Text style={[s.nodeLabel, { color: bg, fontWeight: "800" }]} numberOfLines={2}>{lesson.title}</Text>
      </View>
    )
  }

  return (
    <View style={[s.nodeWrap, { opacity: 0.45 }]}>
      <Node3D bg="#94a3b8" shadowColor="#64748b">
        <Ionicons name="lock-closed" size={26} color="white" />
      </Node3D>
      <Stars filled={0} color="#cbd5e1" />
      <Text style={[s.nodeLabel, { color: "#94a3b8" }]} numberOfLines={2}>{lesson.title}</Text>
    </View>
  )
}

/* ── Module banner ───────────────────────────────────────── */
const MODULE_ICONS = ["book", "bulb", "leaf", "flash", "trophy", "rocket", "star", "flask"]

function ModuleBanner({ module, colorIdx }: { module: Module; colorIdx: number }) {
  const { bg, shadow, light } = col(colorIdx)
  const done     = module.lessons.every(l => l.completed)
  const started  = module.lessons.some(l => l.completed)
  const pct      = module.lessons.length ? module.lessons.filter(l => l.completed).length / module.lessons.length : 0
  const icon     = MODULE_ICONS[colorIdx % MODULE_ICONS.length] as React.ComponentProps<typeof Ionicons>["name"]

  return (
    <View style={[s.banner, { backgroundColor: bg, shadowColor: shadow }]}>
      {/* top row */}
      <View style={s.bannerRow}>
        <View style={[s.bannerIconWrap, { backgroundColor: "rgba(255,255,255,0.18)" }]}>
          <Ionicons name={icon} size={22} color="white" />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={s.bannerSup}>MÓDULO {module.order}</Text>
          <Text style={s.bannerTitle} numberOfLines={2}>{module.title}</Text>
        </View>
        <View style={[s.bannerPill, { backgroundColor: "rgba(255,255,255,0.2)" }]}>
          <Text style={s.bannerPillText}>
            {done ? "✓ Listo" : started ? "En curso" : "Nuevo"}
          </Text>
        </View>
      </View>
      {/* progress */}
      <View style={s.bannerBarTrack}>
        <View style={[s.bannerBarFill, { width: `${Math.round(pct * 100)}%` as `${number}%` }]} />
      </View>
      <Text style={s.bannerPct}>{Math.round(pct * 100)}% completado</Text>
    </View>
  )
}

/* ════════════════════════════════════════════════════════
   MAIN
   ════════════════════════════════════════════════════════ */
export default function HomeScreen() {
  const router  = useRouter()
  const { token } = useAuth()
  const insets  = useSafeAreaInsets()
  const [data,       setData]       = useState<HomeData | null>(null)
  const [loading,    setLoading]    = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const progressAnim = useRef(new Animated.Value(0)).current

  const fetchData = useCallback(async () => {
    try {
      const d = await apiRequest<HomeData>("/api/mobile/home", { token })
      setData(d)
      Animated.timing(progressAnim, { toValue: d.progressPct, duration: 900, useNativeDriver: false }).start()
    } catch { /* silent */ }
    finally { setLoading(false); setRefreshing(false) }
  }, [token])

  useEffect(() => { fetchData() }, [fetchData])
  const onRefresh = () => { setRefreshing(true); fetchData() }

  if (loading) return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#f0e8ff" }}>
      <ActivityIndicator size="large" color="#7c3aed" />
    </View>
  )

  const firstName      = data?.student.name.split(" ")[0] ?? ""
  const totalLessons   = data?.modules.reduce((a, m) => a + m.lessons.length, 0) ?? 0
  const completedCount = data?.modules.reduce((a, m) => a + m.lessons.filter(l => l.completed).length, 0) ?? 0

  type Item =
    | { kind: "header" }
    | { kind: "banner";  module: Module; colorIdx: number }
    | { kind: "lessons"; module: Module; colorIdx: number }
    | { kind: "done" }

  const items: Item[] = [{ kind: "header" }]
  data?.modules.forEach((m, i) => {
    items.push({ kind: "banner",  module: m, colorIdx: i })
    items.push({ kind: "lessons", module: m, colorIdx: i })
  })
  if (completedCount > 0 && completedCount === totalLessons)
    items.push({ kind: "done" })

  return (
    <View style={{ flex: 1, backgroundColor: "#f0e8ff" }}>

      {/* fixed dot-grid texture */}
      <DotGrid />

      {/* top bar */}
      <View style={[s.topBar, { paddingTop: insets.top + 8 }]}>
        <View style={s.brand}>
          <Image
            source={{ uri: "https://cdn-icons-png.flaticon.com/128/11051/11051168.png" }}
            style={s.brandImg}
          />
          <View>
            <Text style={s.brandTop}>Candidatic</Text>
            <Text style={s.brandBottom}>Knowledge</Text>
          </View>
        </View>
        <View style={s.badges}>
          <View style={[s.badge, s.badgeFire]}>
            <Text style={{ fontSize: 18 }}>🔥</Text>
            <Text style={s.badgeNumFire}>{data?.streak.currentDays ?? 0}</Text>
          </View>
          <View style={[s.badge, s.badgeXP]}>
            <Text style={{ fontSize: 16 }}>💎</Text>
            <Text style={s.badgeNumXP}>{data?.student.xpTotal ?? 0}</Text>
          </View>
        </View>
      </View>

      <FlatList
        data={items}
        keyExtractor={(_, i) => String(i)}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#7c3aed" />}
        contentContainerStyle={{ paddingBottom: 32 }}
        showsVerticalScrollIndicator={false}
        style={{ backgroundColor: "transparent" }}
        renderItem={({ item }) => {

          /* ── Course header card ── */
          if (item.kind === "header") {
            if (!data?.courseName) return null
            return (
              <View style={s.headerCard}>
                <Text style={s.headerHi}>¡Hola, {firstName}! 👋</Text>
                <Text style={s.headerCourse}>{data.courseName}</Text>
                <View style={s.progressRow}>
                  <View style={s.progressTrack}>
                    <Animated.View style={[
                      s.progressFill,
                      { width: progressAnim.interpolate({ inputRange: [0, 100], outputRange: ["0%", "100%"] }) },
                    ]} />
                  </View>
                  <Text style={s.progressLabel}>{completedCount}/{totalLessons}</Text>
                </View>
                <View style={s.progressPctRow}>
                  <Text style={s.progressPct}>{Math.round(data.progressPct)}% completado</Text>
                  <View style={s.progressStarRow}>
                    <Ionicons name="star" size={12} color="#FBBF24" />
                    <Text style={s.progressXP}>{data.student.xpTotal} XP</Text>
                  </View>
                </View>
              </View>
            )
          }

          /* ── Module banner ── */
          if (item.kind === "banner") {
            return (
              <View style={{ marginHorizontal: 16, marginTop: 12, marginBottom: 4 }}>
                <ModuleBanner module={item.module} colorIdx={item.colorIdx} />
              </View>
            )
          }

          /* ── Lessons zigzag ── */
          if (item.kind === "lessons") {
            return (
              <View style={{ alignItems: "center", paddingVertical: 8 }}>
                {item.module.lessons.map((lesson, lIdx) => {
                  const isLeft = lIdx % 2 === 0
                  return (
                    <View key={lesson.id} style={{ alignItems: "center", width: "100%" }}>
                      <View style={{
                        alignSelf: isLeft ? "flex-start" : "flex-end",
                        marginLeft:  isLeft ? ZIGZAG : 0,
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

          /* ── Done card ── */
          if (item.kind === "done") {
            return (
              <View style={s.doneCard}>
                <Text style={{ fontSize: 36 }}>🎉</Text>
                <Text style={s.doneTitle}>¡Curso completado!</Text>
                <Text style={s.doneSub}>Eres increíble, {firstName} 🌟</Text>
              </View>
            )
          }

          return null
        }}
      />
    </View>
  )
}

/* ════════════════════════════════════════════════════════
   STYLES
   ════════════════════════════════════════════════════════ */
const s = StyleSheet.create({
  /* top bar */
  topBar: {
    backgroundColor: "#ffffff",
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    paddingHorizontal: 16, paddingBottom: 12,
    shadowColor: "#7c3aed",
    shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 6,
    borderBottomWidth: 0,
  },
  brand: { flexDirection: "row", alignItems: "center", gap: 10 },
  brandImg: { width: 36, height: 36, borderRadius: 18 },
  brandTop: { fontSize: 10, fontWeight: "700", color: "#94a3b8", letterSpacing: 1.5, textTransform: "uppercase" },
  brandBottom: { fontSize: 15, fontWeight: "900", color: "#4c1d95", letterSpacing: -0.3 },
  badges: { flexDirection: "row", gap: 8 },
  badge: {
    flexDirection: "row", alignItems: "center", gap: 5,
    paddingHorizontal: 12, paddingVertical: 7,
    borderRadius: 20,
  },
  badgeFire: { backgroundColor: "#fff7ed", borderWidth: 2, borderColor: "#fed7aa" },
  badgeXP:   { backgroundColor: "#f5f3ff", borderWidth: 2, borderColor: "#ddd6fe" },
  badgeNumFire: { fontSize: 15, fontWeight: "900", color: "#ea580c" },
  badgeNumXP:   { fontSize: 15, fontWeight: "900", color: "#7c3aed" },

  /* header card */
  headerCard: {
    margin: 16, borderRadius: 24, padding: 20,
    backgroundColor: "#ffffff",
    shadowColor: "#7c3aed",
    shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.12, shadowRadius: 16,
    elevation: 6,
    borderWidth: 1.5, borderColor: "rgba(124,58,237,0.12)",
  },
  headerHi:     { fontSize: 13, fontWeight: "600", color: "#94a3b8", marginBottom: 2 },
  headerCourse: { fontSize: 17, fontWeight: "900", color: "#1e1b4b", marginBottom: 14, lineHeight: 22 },
  progressRow: { flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 6 },
  progressTrack: {
    flex: 1, height: 14, borderRadius: 7,
    backgroundColor: "#ede9fe", overflow: "hidden",
    borderWidth: 1, borderColor: "#ddd6fe",
  },
  progressFill: {
    height: "100%", borderRadius: 7,
    backgroundColor: "#7c3aed",
  },
  progressLabel:  { fontSize: 12, fontWeight: "900", color: "#7c3aed", minWidth: 36, textAlign: "right" },
  progressPctRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  progressPct:    { fontSize: 11, fontWeight: "700", color: "#a78bfa" },
  progressStarRow:{ flexDirection: "row", alignItems: "center", gap: 3 },
  progressXP:     { fontSize: 11, fontWeight: "700", color: "#FBBF24" },

  /* banner */
  banner: {
    borderRadius: 20, padding: 16,
    shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.35, shadowRadius: 14, elevation: 8,
  },
  bannerRow:    { flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 14 },
  bannerIconWrap: {
    width: 46, height: 46, borderRadius: 14,
    justifyContent: "center", alignItems: "center",
  },
  bannerSup:    { color: "rgba(255,255,255,0.65)", fontSize: 10, fontWeight: "800", letterSpacing: 1.5 },
  bannerTitle:  { color: "#ffffff", fontSize: 15, fontWeight: "800", lineHeight: 20, marginTop: 2 },
  bannerPill:   {
    paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20,
    borderWidth: 1.5, borderColor: "rgba(255,255,255,0.3)",
  },
  bannerPillText: { color: "#ffffff", fontSize: 11, fontWeight: "800" },
  bannerBarTrack: { height: 8, borderRadius: 4, backgroundColor: "rgba(255,255,255,0.22)", overflow: "hidden", marginBottom: 6 },
  bannerBarFill:  { height: "100%", borderRadius: 4, backgroundColor: "rgba(255,255,255,0.9)" },
  bannerPct:      { color: "rgba(255,255,255,0.65)", fontSize: 11, fontWeight: "600" },

  /* nodes */
  nodeWrap:   { alignItems: "center", width: 116, paddingVertical: 4 },
  nodeCircle: {
    justifyContent: "center", alignItems: "center",
    shadowOffset: { width: 0, height: 5 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 8,
  },
  starsRow:   { flexDirection: "row", gap: 3, marginTop: 6 },
  nodeLabel: {
    fontSize: 11, fontWeight: "700", textAlign: "center",
    marginTop: 5, maxWidth: 100, lineHeight: 14,
    color: "#64748b",
  },
  startBadge: {
    flexDirection: "row", alignItems: "center", gap: 4,
    paddingHorizontal: 10, paddingVertical: 4,
    borderRadius: 20, marginBottom: 4,
    shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.25, shadowRadius: 4, elevation: 4,
  },
  startText: { color: "white", fontSize: 10, fontWeight: "900", letterSpacing: 1 },

  /* connector */
  connectorWrap: { alignItems: "center", gap: 5, paddingVertical: 2 },
  connectorDot:  { width: 5, height: 5, borderRadius: 2.5 },

  /* done */
  doneCard: {
    marginHorizontal: 16, marginTop: 12, borderRadius: 24, padding: 28,
    backgroundColor: "#7c3aed", alignItems: "center",
    shadowColor: "#7c3aed", shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.45, shadowRadius: 20, elevation: 10,
  },
  doneTitle: { color: "#ffffff", fontWeight: "900", fontSize: 22, marginTop: 8, marginBottom: 4 },
  doneSub:   { color: "rgba(255,255,255,0.75)", fontSize: 15, fontWeight: "600" },
})
