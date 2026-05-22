import { useCallback, useEffect, useRef, useState } from "react"
import {
  ActivityIndicator,
  Alert,
  Animated,
  FlatList,
  KeyboardAvoidingView,
  LayoutAnimation,
  Modal,
  Platform,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  Dimensions,
} from "react-native"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import Svg, { Path, Circle, Rect } from "react-native-svg"
import { Ionicons } from "@expo/vector-icons"
import { useAuth } from "../../lib/auth"
import { apiRequest } from "../../lib/api"

/* ── Types ──────────────────────────────────────────────── */
type Student = {
  id: string; name: string; email: string; phone: string | null
  status: "ACTIVE" | "INACTIVE" | "EXPIRED" | "SUSPENDED"
  courseName: string | null; courseCount: number; progress: number
  lastAccess: string; streakDays: number
  subscriptionDaysLeft: number | null; subscriptionExpiresAt: string | null
  enrolledCourseIds: string[]
}
type AvailableCourse = { id: string; title: string }
type StudentsData = {
  tenant: { name: string; slug: string; maxStudents: number; expiresAt: string | null }
  stats: { activeStudents: number; avgProgress: number; atRisk: number; nearExpiry: number }
  students: Student[]
  availableCourses: AvailableCourse[]
}

/* ─── Colors ─────────────────────────────────────────────── */
const DUO = {
  green: "#58CC02", greenDark: "#46A302",
  gold: "#FFC800", goldDark: "#E5A800",
  blue: "#1CB0F6", blueDark: "#1899D6",
  red: "#FF4B4B", purple: "#A855F7", orange: "#FF9600",
  bg: "#F7F7F7", card: "#FFFFFF", text: "#3C3C3C",
  textMuted: "#AFAFAF", border: "#E5E5E5",
}

const STATUS_CONFIG: Record<string, { label: string; bg: string; color: string }> = {
  ACTIVE:    { label: "Activo",    bg: "rgba(88,204,2,0.12)",  color: DUO.green },
  INACTIVE:  { label: "Inactivo",  bg: "rgba(175,175,175,0.12)", color: DUO.textMuted },
  EXPIRED:   { label: "Expirado",  bg: "rgba(255,150,0,0.12)", color: DUO.orange },
  SUSPENDED: { label: "Suspendido", bg: "rgba(255,75,75,0.12)", color: DUO.red },
}

/* ─── Avatar ─────────────────────────────────────────────── */
function Avatar({ name, status }: { name: string; status: string }) {
  const initials = name.split(" ").slice(0, 2).map(w => w[0]).join("").toUpperCase()
  const color = status === "ACTIVE" ? DUO.green : status === "EXPIRED" ? DUO.orange : DUO.textMuted
  return (
    <View style={[styles.avatar, { borderColor: color, backgroundColor: status === "ACTIVE" ? DUO.green : "#E5E5E5" }]}>
      <Text style={[styles.avatarText, { color: status === "ACTIVE" ? "#fff" : "#777" }]}>{initials}</Text>
    </View>
  )
}

/* ─── Mini Stat Card ─────────────────────────────────────── */
function MiniStat({ value, label, emoji }: { value: number | string; label: string; emoji: string }) {
  return (
    <View style={styles.miniStat}>
      <Text style={{ fontSize: 14 }}>{emoji}</Text>
      <Text style={styles.miniStatValue}>{value}</Text>
      <Text style={styles.miniStatLabel}>{label}</Text>
    </View>
  )
}

/* ─── Expanded Student Detail ────────────────────────────── */
function StudentDetail({ student, courses, tenantSlug, token, onRefresh }: {
  student: Student; courses: AvailableCourse[]
  tenantSlug: string; token: string | null; onRefresh: () => void
}) {
  const [loading, setLoading] = useState(false)

  async function handleEnroll(courseId: string) {
    setLoading(true)
    try {
      await apiRequest(`/api/mobile/admin/students/${student.id}/enroll`, {
        method: "POST", token, body: { courseId },
      })
      onRefresh()
    } catch (e) {
      Alert.alert("Error", e instanceof Error ? e.message : "Error al inscribir")
    } finally { setLoading(false) }
  }

  async function handleUnenroll(courseId: string) {
    Alert.alert("Quitar curso", "¿Seguro que quieres quitar este curso?", [
      { text: "Cancelar", style: "cancel" },
      { text: "Quitar", style: "destructive", onPress: async () => {
        setLoading(true)
        try {
          await apiRequest(`/api/mobile/admin/students/${student.id}/enroll`, {
            method: "DELETE", token, body: { courseId },
          })
          onRefresh()
        } catch (e) {
          Alert.alert("Error", e instanceof Error ? e.message : "Error")
        } finally { setLoading(false) }
      }},
    ])
  }

  async function handleDelete() {
    Alert.alert("Eliminar alumno", `¿Eliminar a ${student.name}? Esta acción no se puede deshacer.`, [
      { text: "Cancelar", style: "cancel" },
      { text: "Eliminar", style: "destructive", onPress: async () => {
        setLoading(true)
        try {
          await apiRequest(`/api/mobile/admin/students/${student.id}`, {
            method: "DELETE", token,
          })
          onRefresh()
        } catch (e) {
          Alert.alert("Error", e instanceof Error ? e.message : "Error")
        } finally { setLoading(false) }
      }},
    ])
  }

  async function handleReset() {
    Alert.alert("Resetear progreso", `¿Resetear todo el progreso de ${student.name}?`, [
      { text: "Cancelar", style: "cancel" },
      { text: "Resetear", style: "destructive", onPress: async () => {
        setLoading(true)
        try {
          await apiRequest(`/api/mobile/admin/students/${student.id}/reset`, {
            method: "POST", token,
          })
          onRefresh()
        } catch (e) {
          Alert.alert("Error", e instanceof Error ? e.message : "Error")
        } finally { setLoading(false) }
      }},
    ])
  }

  const enrolledSet = new Set(student.enrolledCourseIds)
  const enrolled = courses.filter(c => enrolledSet.has(c.id))
  const available = courses.filter(c => !enrolledSet.has(c.id))

  return (
    <View style={styles.detailWrap}>
      {loading && (
        <View style={styles.detailLoading}>
          <ActivityIndicator size="small" color={DUO.blue} />
        </View>
      )}

      {/* Stats row */}
      <View style={styles.detailStatsRow}>
        <View style={[styles.detailStatBox, { borderColor: DUO.green }]}>
          <Text style={[styles.detailStatNum, { color: DUO.green }]}>{student.progress}%</Text>
          <Text style={styles.detailStatLabel}>Progreso</Text>
        </View>
        <View style={[styles.detailStatBox, { borderColor: DUO.orange }]}>
          <Text style={[styles.detailStatNum, { color: DUO.orange }]}>🔥 {student.streakDays}</Text>
          <Text style={styles.detailStatLabel}>Racha</Text>
        </View>
        <View style={[styles.detailStatBox, { borderColor: DUO.blue }]}>
          <Text style={[styles.detailStatNum, { color: DUO.blue }]}>{student.courseCount}</Text>
          <Text style={styles.detailStatLabel}>Cursos</Text>
        </View>
      </View>

      {/* Progress bar */}
      <View style={styles.detailProgressWrap}>
        <View style={styles.detailProgressTrack}>
          <View style={[styles.detailProgressFill, { width: `${student.progress}%` as `${number}%` }]} />
        </View>
      </View>

      {/* Info rows */}
      <View style={styles.detailInfo}>
        <View style={styles.detailInfoRow}>
          <Ionicons name="mail-outline" size={14} color={DUO.textMuted} />
          <Text style={styles.detailInfoText}>{student.email}</Text>
        </View>
        {student.phone && (
          <View style={styles.detailInfoRow}>
            <Ionicons name="call-outline" size={14} color={DUO.textMuted} />
            <Text style={styles.detailInfoText}>{student.phone}</Text>
          </View>
        )}
        <View style={styles.detailInfoRow}>
          <Ionicons name="time-outline" size={14} color={DUO.textMuted} />
          <Text style={styles.detailInfoText}>Último acceso: {student.lastAccess}</Text>
        </View>
        {student.subscriptionExpiresAt && (
          <View style={styles.detailInfoRow}>
            <Ionicons name="calendar-outline" size={14} color={student.subscriptionDaysLeft != null && student.subscriptionDaysLeft <= 7 ? DUO.red : DUO.textMuted} />
            <Text style={[styles.detailInfoText, student.subscriptionDaysLeft != null && student.subscriptionDaysLeft <= 7 && { color: DUO.red }]}>
              Expira: {student.subscriptionExpiresAt}
              {student.subscriptionDaysLeft != null ? ` (${student.subscriptionDaysLeft}d)` : ""}
            </Text>
          </View>
        )}
      </View>

      {/* Enrolled courses */}
      {enrolled.length > 0 && (
        <View style={styles.detailSection}>
          <Text style={styles.detailSectionTitle}>📚 Cursos inscritos</Text>
          {enrolled.map(c => (
            <View key={c.id} style={styles.courseChip}>
              <Text style={styles.courseChipText}>{c.title}</Text>
              <Pressable onPress={() => handleUnenroll(c.id)} hitSlop={8}>
                <Ionicons name="close-circle" size={18} color={DUO.red} />
              </Pressable>
            </View>
          ))}
        </View>
      )}

      {/* Available courses to assign */}
      {available.length > 0 && (
        <View style={styles.detailSection}>
          <Text style={styles.detailSectionTitle}>➕ Asignar curso</Text>
          {available.map(c => (
            <Pressable key={c.id} style={styles.courseAddChip} onPress={() => handleEnroll(c.id)}>
              <Text style={styles.courseAddText}>{c.title}</Text>
              <Ionicons name="add-circle" size={18} color={DUO.green} />
            </Pressable>
          ))}
        </View>
      )}

      {/* Action buttons */}
      <View style={styles.detailActions}>
        <Pressable style={[styles.detailActionBtn, { borderColor: DUO.orange }]} onPress={handleReset}>
          <Ionicons name="refresh-outline" size={16} color={DUO.orange} />
          <Text style={[styles.detailActionText, { color: DUO.orange }]}>Resetear</Text>
        </Pressable>
        <Pressable style={[styles.detailActionBtn, { borderColor: DUO.red }]} onPress={handleDelete}>
          <Ionicons name="trash-outline" size={16} color={DUO.red} />
          <Text style={[styles.detailActionText, { color: DUO.red }]}>Eliminar</Text>
        </Pressable>
      </View>
    </View>
  )
}

/* ─── Create Student Modal ───────────────────────────────── */
function CreateModal({ visible, onClose, token, tenantSlug, onCreated }: {
  visible: boolean; onClose: () => void; token: string | null
  tenantSlug: string; onCreated: () => void
}) {
  const insets = useSafeAreaInsets()
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  function reset() { setName(""); setEmail(""); setPhone(""); setPassword(""); setError("") }

  async function handleCreate() {
    if (!name.trim() || !email.trim()) { setError("Nombre y email son requeridos"); return }
    setLoading(true); setError("")
    try {
      await apiRequest("/api/mobile/admin/students", {
        method: "POST", token,
        body: { name: name.trim(), email: email.trim(), phone: phone.trim() || null, password: password.trim() || null },
      })
      reset(); onCreated(); onClose()
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error al crear")
    } finally { setLoading(false) }
  }

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.modalOverlay}>
        <Pressable style={styles.modalBackdrop} onPress={onClose} />
        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.modalKeyboard}>
          <View style={[styles.modalContent, { paddingBottom: insets.bottom || 20 }]}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Nuevo Alumno</Text>
              <Pressable onPress={onClose} style={styles.modalCloseBtn}>
                <Text style={styles.modalCloseText}>✕</Text>
              </Pressable>
            </View>

            <ScrollView contentContainerStyle={styles.modalForm} showsVerticalScrollIndicator={false}>
              <View style={styles.modalField}>
                <Text style={styles.modalLabel}>NOMBRE *</Text>
                <TextInput style={styles.modalInput} value={name} onChangeText={setName} placeholder="Juan Pérez" placeholderTextColor="#c4c9d4" />
              </View>
              <View style={styles.modalField}>
                <Text style={styles.modalLabel}>EMAIL *</Text>
                <TextInput style={styles.modalInput} value={email} onChangeText={setEmail} placeholder="juan@email.com" placeholderTextColor="#c4c9d4" keyboardType="email-address" autoCapitalize="none" />
              </View>
              <View style={styles.modalField}>
                <Text style={styles.modalLabel}>TELÉFONO</Text>
                <TextInput style={styles.modalInput} value={phone} onChangeText={setPhone} placeholder="8112345678" placeholderTextColor="#c4c9d4" keyboardType="phone-pad" />
              </View>
              <View style={styles.modalField}>
                <Text style={styles.modalLabel}>CONTRASEÑA</Text>
                <TextInput style={styles.modalInput} value={password} onChangeText={setPassword} placeholder="••••••" placeholderTextColor="#c4c9d4" secureTextEntry />
              </View>

              {error ? (
                <View style={styles.modalError}>
                  <Ionicons name="alert-circle-outline" size={14} color="#dc2626" />
                  <Text style={styles.modalErrorText}>{error}</Text>
                </View>
              ) : null}

              <Pressable
                style={[styles.modalCreateBtn, (!name || !email || loading) && { opacity: 0.5 }]}
                onPress={handleCreate}
                disabled={!name || !email || loading}
              >
                {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.modalCreateText}>CREAR ALUMNO</Text>}
              </Pressable>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  )
}

/* ═══════════════════════════════════════════════════════════
   MAIN SCREEN
   ═══════════════════════════════════════════════════════════ */
export default function StudentsScreen() {
  const { token, user } = useAuth()
  const insets = useSafeAreaInsets()
  const [data, setData] = useState<StudentsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [search, setSearch] = useState("")
  const [showCreate, setShowCreate] = useState(false)
  const [showExpiredModal, setShowExpiredModal] = useState(false)

  const isExpired = data?.tenant.expiresAt ? new Date(data.tenant.expiresAt) < new Date() : false

  const fetchData = useCallback(async () => {
    try {
      const d = await apiRequest<StudentsData>("/api/mobile/admin/students", { token })
      setData(d)
    } catch { /* silent */ }
    finally { setLoading(false); setRefreshing(false) }
  }, [token])

  useEffect(() => { fetchData() }, [fetchData])
  const onRefresh = () => { setRefreshing(true); fetchData() }

  // Show expired overlay every 30s
  useEffect(() => {
    if (!isExpired) return
    setShowExpiredModal(true)
    const interval = setInterval(() => setShowExpiredModal(true), 30000)
    return () => clearInterval(interval)
  }, [isExpired])

  function toggleExpand(id: string) {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut)
    setExpandedId(prev => prev === id ? null : id)
  }

  const filtered = data?.students.filter(s =>
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    s.email.toLowerCase().includes(search.toLowerCase())
  ) ?? []

  type Item = { kind: "header" } | { kind: "student"; student: Student }
  const items: Item[] = [{ kind: "header" }, ...filtered.map(s => ({ kind: "student" as const, student: s }))]

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.title}>🧑‍🎓 Alumnos</Text>
            <Text style={styles.subtitle}>
              {data ? `${data.stats.activeStudents} de ${data.tenant.maxStudents} contratados` : "Cargando..."}
            </Text>
            {data && (
              <Text style={[styles.subtitle, { color: (data.tenant.maxStudents - data.stats.activeStudents) > 0 ? DUO.green : DUO.red, fontWeight: "800", marginTop: 1 }]}>
                {(data.tenant.maxStudents - data.stats.activeStudents) > 0
                  ? `✓ ${data.tenant.maxStudents - data.stats.activeStudents} disponibles`
                  : "Sin lugares disponibles"}
              </Text>
            )}
          </View>
          <Pressable
            style={({ pressed }) => [styles.createBtn, pressed && { opacity: 0.8 }, isExpired && { backgroundColor: DUO.textMuted }]}
            onPress={() => isExpired ? setShowExpiredModal(true) : setShowCreate(true)}
          >
            <Ionicons name="add" size={20} color="#fff" />
            <Text style={styles.createBtnText}>Crear</Text>
          </Pressable>
        </View>
      </View>

      {loading ? (
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
          <ActivityIndicator size="large" color={DUO.green} />
        </View>
      ) : (
        <FlatList
          data={items}
          keyExtractor={(item, i) => item.kind === "header" ? "header" : (item as { student: Student }).student.id}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={DUO.green} />}
          contentContainerStyle={{ padding: 16, paddingBottom: 32 }}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => {
            if (item.kind === "header") {
              return (
                <View>
                  {/* Mini stats row */}
                  <View style={styles.statsRow}>
                    <MiniStat value={data?.stats.activeStudents ?? 0} label="Activos" emoji="✅" />
                    <MiniStat value={`${data?.stats.avgProgress ?? 0}%`} label="Promedio" emoji="📊" />
                    <MiniStat value={data?.stats.atRisk ?? 0} label="Sin actividad" emoji="⚠️" />
                    <MiniStat value={data?.stats.nearExpiry ?? 0} label="Por vencer" emoji="⏳" />
                  </View>

                  {/* Search */}
                  <View style={styles.searchWrap}>
                    <Ionicons name="search-outline" size={18} color={DUO.textMuted} />
                    <TextInput
                      style={styles.searchInput}
                      placeholder="Buscar alumno..."
                      placeholderTextColor={DUO.textMuted}
                      value={search}
                      onChangeText={setSearch}
                    />
                    {search.length > 0 && (
                      <Pressable onPress={() => setSearch("")}>
                        <Ionicons name="close-circle" size={18} color={DUO.textMuted} />
                      </Pressable>
                    )}
                  </View>

                  {filtered.length === 0 && (
                    <View style={styles.emptyWrap}>
                      <Text style={{ fontSize: 40 }}>📋</Text>
                      <Text style={styles.emptyTitle}>
                        {search ? "Sin resultados" : "Sin alumnos"}
                      </Text>
                      <Text style={styles.emptySub}>
                        {search ? "Intenta con otro nombre" : "Crea tu primer alumno con el botón de arriba"}
                      </Text>
                    </View>
                  )}
                </View>
              )
            }

            const s = item.student
            const isExpanded = expandedId === s.id
            const statusCfg = STATUS_CONFIG[s.status] ?? STATUS_CONFIG.INACTIVE

            return (
              <Pressable onPress={() => toggleExpand(s.id)} style={[styles.row, isExpanded && styles.rowExpanded]}>
                {/* Top section */}
                <View style={styles.rowTop}>
                  <Avatar name={s.name} status={s.status} />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.name} numberOfLines={1}>{s.name}</Text>
                    <View style={styles.rowSubRow}>
                      <View style={[styles.statusPill, { backgroundColor: statusCfg.bg }]}>
                        <Text style={[styles.statusText, { color: statusCfg.color }]}>{statusCfg.label}</Text>
                      </View>
                      {s.streakDays > 0 && (
                        <Text style={styles.streakText}>🔥 {s.streakDays}</Text>
                      )}
                      {s.courseName && (
                        <Text style={styles.courseSmall} numberOfLines={1}>📖 {s.courseName}</Text>
                      )}
                    </View>
                  </View>
                  {/* Progress circle */}
                  <View style={styles.progressCircle}>
                    <Text style={[styles.progressNum, { color: s.progress >= 60 ? DUO.green : s.progress > 0 ? DUO.orange : DUO.textMuted }]}>
                      {s.progress}%
                    </Text>
                  </View>
                  <Ionicons
                    name={isExpanded ? "chevron-up" : "chevron-down"}
                    size={18}
                    color={DUO.textMuted}
                  />
                </View>

                {/* Expanded detail */}
                {isExpanded && (
                  <StudentDetail
                    student={s}
                    courses={data?.availableCourses ?? []}
                    tenantSlug={user?.tenantSlug ?? ""}
                    token={token}
                    onRefresh={() => { setExpandedId(null); onRefresh() }}
                  />
                )}
              </Pressable>
            )
          }}
        />
      )}

      <CreateModal
        visible={showCreate}
        onClose={() => setShowCreate(false)}
        token={token}
        tenantSlug={user?.tenantSlug ?? ""}
        onCreated={onRefresh}
      />

      {/* License expired modal */}
      <LicenseExpiredModal visible={showExpiredModal} onClose={() => setShowExpiredModal(false)} />
    </View>
  )
}

/* ─── License Expired Modal ──────────────────────────────── */
function LicenseExpiredModal({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  const bounceAnim = useRef(new Animated.Value(0)).current

  useEffect(() => {
    if (!visible) return
    Animated.loop(
      Animated.sequence([
        Animated.timing(bounceAnim, { toValue: -8, duration: 1000, useNativeDriver: true }),
        Animated.timing(bounceAnim, { toValue: 0, duration: 1000, useNativeDriver: true }),
      ])
    ).start()
  }, [visible, bounceAnim])

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={expiredStyles.overlay}>
        <View style={expiredStyles.card}>
          {/* Top accent */}
          <View style={expiredStyles.accent} />

          {/* Animated lock icon */}
          <Animated.View style={[expiredStyles.iconWrap, { transform: [{ translateY: bounceAnim }] }]}>
            <Text style={{ fontSize: 44 }}>🔒</Text>
          </Animated.View>

          <Text style={expiredStyles.title}>Licencia vencida</Text>
          <Text style={expiredStyles.desc}>
            Tu acceso ha expirado y no puedes crear ni editar contenido.
          </Text>
          <Text style={expiredStyles.highlight}>
            Contacta a tu administrador para renovar tu licencia
          </Text>

          {/* Contact box */}
          <View style={expiredStyles.contactBox}>
            <Ionicons name="mail-outline" size={16} color={DUO.purple} />
            <Text style={expiredStyles.contactText}>soporte@candidatic.com</Text>
          </View>

          <Pressable style={expiredStyles.btn} onPress={onClose}>
            <Text style={expiredStyles.btnText}>Entendido</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  )
}

const expiredStyles = StyleSheet.create({
  overlay: {
    flex: 1, backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center", alignItems: "center", padding: 24,
  },
  card: {
    backgroundColor: "#fff", borderRadius: 28, width: "100%", maxWidth: 360,
    alignItems: "center", overflow: "hidden",
    borderWidth: 2, borderColor: DUO.border,
    borderBottomWidth: 5, borderBottomColor: "#D5D5D5",
  },
  accent: {
    height: 6, width: "100%",
    backgroundColor: DUO.purple,
  },
  iconWrap: {
    width: 88, height: 88, borderRadius: 22,
    backgroundColor: "rgba(168,85,247,0.08)",
    borderWidth: 2, borderColor: "rgba(168,85,247,0.2)",
    justifyContent: "center", alignItems: "center",
    marginTop: 28,
  },
  title: {
    fontSize: 20, fontWeight: "900", color: DUO.text,
    marginTop: 16,
  },
  desc: {
    fontSize: 13, fontWeight: "600", color: DUO.textMuted,
    textAlign: "center", marginTop: 8, paddingHorizontal: 28,
  },
  highlight: {
    fontSize: 14, fontWeight: "800", color: DUO.purple,
    textAlign: "center", marginTop: 8, paddingHorizontal: 28,
  },
  contactBox: {
    flexDirection: "row", alignItems: "center", gap: 8,
    backgroundColor: "rgba(168,85,247,0.06)",
    borderWidth: 1.5, borderColor: "rgba(168,85,247,0.15)",
    borderRadius: 14, paddingHorizontal: 16, paddingVertical: 10,
    marginTop: 16,
  },
  contactText: { fontSize: 13, fontWeight: "700", color: DUO.purple },
  btn: {
    backgroundColor: DUO.purple, borderRadius: 16,
    paddingVertical: 14, alignItems: "center",
    width: "80%", marginTop: 20, marginBottom: 28,
    borderBottomWidth: 4, borderBottomColor: "#7e22ce",
  },
  btnText: { color: "#fff", fontSize: 15, fontWeight: "900" },
})

/* ═══════════════════════════════════════════════════════════
   STYLES
   ═══════════════════════════════════════════════════════════ */
const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: DUO.bg },

  /* Header */
  header: {
    backgroundColor: DUO.card, paddingHorizontal: 20, paddingTop: 12, paddingBottom: 16,
    borderBottomWidth: 3, borderBottomColor: DUO.border,
  },
  headerRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  title: { fontSize: 22, fontWeight: "900", color: DUO.text },
  subtitle: { fontSize: 12, color: DUO.textMuted, fontWeight: "600", marginTop: 1 },
  createBtn: {
    flexDirection: "row", alignItems: "center", gap: 4,
    backgroundColor: DUO.green, paddingHorizontal: 14, paddingVertical: 10,
    borderRadius: 14, borderBottomWidth: 3, borderBottomColor: "#46A302",
  },
  createBtnText: { color: "#fff", fontSize: 14, fontWeight: "800" },

  /* Stats row */
  statsRow: {
    flexDirection: "row", gap: 8, marginBottom: 12,
  },
  miniStat: {
    flex: 1, backgroundColor: DUO.card, borderRadius: 14, padding: 10,
    alignItems: "center", borderWidth: 2, borderColor: DUO.border,
    borderBottomWidth: 3, borderBottomColor: "#D5D5D5",
  },
  miniStatValue: { fontSize: 16, fontWeight: "900", color: DUO.text, marginTop: 2 },
  miniStatLabel: { fontSize: 9, fontWeight: "700", color: DUO.textMuted, marginTop: 1 },

  /* Search */
  searchWrap: {
    flexDirection: "row", alignItems: "center", gap: 8,
    backgroundColor: DUO.card, borderRadius: 14, borderWidth: 2, borderColor: DUO.border,
    paddingHorizontal: 14, paddingVertical: 10, marginBottom: 12,
  },
  searchInput: { flex: 1, fontSize: 14, fontWeight: "600", color: DUO.text, padding: 0 },

  /* Row */
  row: {
    backgroundColor: DUO.card, borderRadius: 16, padding: 14, marginBottom: 10,
    borderWidth: 2, borderColor: DUO.border, borderBottomWidth: 4, borderBottomColor: "#D5D5D5",
  },
  rowExpanded: { borderColor: DUO.blue, borderBottomColor: DUO.blueDark + "40" },
  rowTop: { flexDirection: "row", alignItems: "center", gap: 10 },
  rowSubRow: { flexDirection: "row", alignItems: "center", gap: 6, marginTop: 3, flexWrap: "wrap" },

  /* Avatar */
  avatar: {
    width: 42, height: 42, borderRadius: 21, borderWidth: 3,
    justifyContent: "center", alignItems: "center",
  },
  avatarText: { fontSize: 14, fontWeight: "900" },

  /* Name & status */
  name: { fontSize: 14, fontWeight: "700", color: DUO.text },
  statusPill: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 10 },
  statusText: { fontSize: 10, fontWeight: "800" },
  streakText: { fontSize: 11, fontWeight: "700", color: DUO.orange },
  courseSmall: { fontSize: 10, fontWeight: "600", color: DUO.textMuted, maxWidth: 100 },

  /* Progress circle */
  progressCircle: {
    width: 42, height: 42, borderRadius: 21,
    backgroundColor: "#F5F5F5", justifyContent: "center", alignItems: "center",
  },
  progressNum: { fontSize: 12, fontWeight: "900" },

  /* Detail (expanded) */
  detailWrap: { marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: "#F0F0F0" },
  detailLoading: { position: "absolute", top: 0, right: 0, zIndex: 1 },

  detailStatsRow: { flexDirection: "row", gap: 8, marginBottom: 10 },
  detailStatBox: {
    flex: 1, backgroundColor: "#F9F9F9", borderRadius: 12, padding: 10,
    alignItems: "center", borderWidth: 1.5, borderBottomWidth: 3,
  },
  detailStatNum: { fontSize: 15, fontWeight: "900" },
  detailStatLabel: { fontSize: 9, fontWeight: "700", color: DUO.textMuted, marginTop: 2 },

  detailProgressWrap: { marginBottom: 10 },
  detailProgressTrack: { height: 8, borderRadius: 4, backgroundColor: "#E5E5E5", overflow: "hidden" },
  detailProgressFill: { height: "100%", borderRadius: 4, backgroundColor: DUO.green },

  detailInfo: { gap: 6, marginBottom: 10 },
  detailInfoRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  detailInfoText: { fontSize: 12, fontWeight: "600", color: "#666" },

  detailSection: { marginTop: 8, marginBottom: 4 },
  detailSectionTitle: { fontSize: 12, fontWeight: "800", color: DUO.text, marginBottom: 6 },

  courseChip: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    backgroundColor: "rgba(88,204,2,0.08)", borderRadius: 10,
    paddingHorizontal: 12, paddingVertical: 8, marginBottom: 4,
    borderWidth: 1, borderColor: "rgba(88,204,2,0.2)",
  },
  courseChipText: { fontSize: 12, fontWeight: "700", color: DUO.text, flex: 1 },

  courseAddChip: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    backgroundColor: "#F9F9F9", borderRadius: 10,
    paddingHorizontal: 12, paddingVertical: 8, marginBottom: 4,
    borderWidth: 1, borderColor: DUO.border, borderStyle: "dashed",
  },
  courseAddText: { fontSize: 12, fontWeight: "600", color: DUO.textMuted, flex: 1 },

  detailActions: { flexDirection: "row", gap: 8, marginTop: 8 },
  detailActionBtn: {
    flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 4,
    paddingVertical: 10, borderRadius: 12, borderWidth: 2, borderBottomWidth: 3,
  },
  detailActionText: { fontSize: 12, fontWeight: "800" },

  /* Empty */
  emptyWrap: { alignItems: "center", paddingTop: 30 },
  emptyTitle: { fontSize: 16, fontWeight: "900", color: DUO.text, marginTop: 8 },
  emptySub: { fontSize: 13, fontWeight: "600", color: DUO.textMuted, marginTop: 4, textAlign: "center" },

  /* Modal */
  modalOverlay: { flex: 1, justifyContent: "flex-end" },
  modalBackdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: "rgba(0,0,0,0.4)" },
  modalKeyboard: { justifyContent: "flex-end" },
  modalContent: {
    backgroundColor: DUO.bg, borderTopLeftRadius: 24, borderTopRightRadius: 24,
    maxHeight: "80%",
  },
  modalHeader: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    padding: 16, borderBottomWidth: 2, borderBottomColor: DUO.border,
    backgroundColor: DUO.card, borderTopLeftRadius: 24, borderTopRightRadius: 24,
  },
  modalTitle: { fontSize: 18, fontWeight: "800", color: DUO.text },
  modalCloseBtn: {
    width: 32, height: 32, backgroundColor: "#F0F0F0", borderRadius: 16,
    justifyContent: "center", alignItems: "center",
  },
  modalCloseText: { fontSize: 14, fontWeight: "900", color: DUO.textMuted },
  modalForm: { padding: 20, gap: 14 },
  modalField: { gap: 6 },
  modalLabel: { fontSize: 11, fontWeight: "800", color: "#6366f1", letterSpacing: 1 },
  modalInput: {
    backgroundColor: "#fff", borderWidth: 2, borderColor: DUO.border, borderRadius: 14,
    paddingHorizontal: 14, paddingVertical: 14, fontSize: 15, fontWeight: "600", color: DUO.text,
  },
  modalError: {
    flexDirection: "row", alignItems: "center", gap: 6,
    backgroundColor: "#fef2f2", borderWidth: 1.5, borderColor: "#fecaca",
    borderRadius: 12, paddingHorizontal: 14, paddingVertical: 10,
  },
  modalErrorText: { color: "#dc2626", fontSize: 13, fontWeight: "600", flex: 1 },
  modalCreateBtn: {
    backgroundColor: DUO.green, borderRadius: 16, paddingVertical: 16, alignItems: "center",
    borderBottomWidth: 4, borderBottomColor: "#46A302",
  },
  modalCreateText: { color: "#fff", fontSize: 14, fontWeight: "900", letterSpacing: 1 },
})
