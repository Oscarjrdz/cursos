import { Tabs } from "expo-router"
import { Animated, Pressable, StyleSheet, Text, View } from "react-native"
import type { BottomTabBarProps } from "@react-navigation/bottom-tabs"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import Svg, { Path, Circle, Rect, Defs, Pattern } from "react-native-svg"
import { useRef } from "react"

/* ─── Duolingo-style vibrant colors ───────────────────────── */
const COLORS = {
  students: { active: "#58CC02", dark: "#46A302" },
  library:  { active: "#FFC800", dark: "#E5A800" },
  profile:  { active: "#1CB0F6", dark: "#1899D6" },
  muted:    "#AFAFAF",
}

/* ─── Students Icon ──────────────────────────────────────── */
function StudentsIcon({ active }: { active: boolean }) {
  const fill = active ? COLORS.students.active : COLORS.muted
  const dark = active ? COLORS.students.dark : "#9A9A9A"
  return (
    <Svg width={38} height={38} viewBox="0 0 24 24" fill="none">
      <Circle cx={9} cy={7} r={4} fill={fill} />
      <Path d="M2 20c0-3.87 3.13-7 7-7s7 3.13 7 7" fill={fill} />
      <Circle cx={9} cy={7} r={4} fill={dark} opacity={0.15} />
      <Circle cx={17} cy={9} r={3} fill={fill} opacity={0.7} />
      <Path d="M14 20c0-2.5 1.3-4.7 3.3-6" stroke={fill} strokeWidth={2} strokeLinecap="round" opacity={0.7} />
      <Circle cx={7.5} cy={5.5} r={1} fill="#FFFFFF" opacity={active ? 0.3 : 0.2} />
    </Svg>
  )
}

/* ─── Library / Book Icon ────────────────────────────────── */
function LibraryIcon({ active }: { active: boolean }) {
  const fill = active ? COLORS.library.active : COLORS.muted
  const dark = active ? COLORS.library.dark : "#9A9A9A"
  return (
    <Svg width={38} height={38} viewBox="0 0 24 24" fill="none">
      <Path d="M4 4h4v16H4z" fill={fill} />
      <Path d="M10 4h4v16h-4z" fill={fill} opacity={0.8} />
      <Path d="M16 6l4-1v15l-4 1z" fill={fill} opacity={0.6} />
      <Path d="M4 4h4v4H4z" fill={dark} opacity={0.2} />
      <Rect x={5} y={7} width={2} height={8} rx={0.5} fill="#FFFFFF" opacity={active ? 0.25 : 0.15} />
      <Rect x={11} y={6} width={2} height={6} rx={0.5} fill="#FFFFFF" opacity={active ? 0.2 : 0.1} />
    </Svg>
  )
}

/* ─── Profile / Building Icon ────────────────────────────── */
function BuildingIcon({ active }: { active: boolean }) {
  const fill = active ? COLORS.profile.active : COLORS.muted
  const dark = active ? COLORS.profile.dark : "#9A9A9A"
  return (
    <Svg width={38} height={38} viewBox="0 0 24 24" fill="none">
      <Rect x={3} y={4} width={18} height={17} rx={2} fill={fill} />
      <Rect x={3} y={4} width={18} height={5} rx={2} fill={dark} opacity={0.2} />
      <Rect x={6} y={11} width={3} height={3} rx={0.8} fill="#FFFFFF" opacity={active ? 0.4 : 0.25} />
      <Rect x={10.5} y={11} width={3} height={3} rx={0.8} fill="#FFFFFF" opacity={active ? 0.4 : 0.25} />
      <Rect x={15} y={11} width={3} height={3} rx={0.8} fill="#FFFFFF" opacity={active ? 0.4 : 0.25} />
      <Rect x={9.5} y={16} width={5} height={5} rx={1} fill={active ? "#FFFFFF" : "#E0E0E0"} opacity={active ? 0.5 : 0.3} />
    </Svg>
  )
}

/* ─── Heart SVG Icon ─────────────────────────────────────── */
function HeartIcon() {
  return (
    <Svg width={12} height={12} viewBox="0 0 24 24" fill="none">
      <Path
        d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
        fill="#FF4B4B"
      />
    </Svg>
  )
}

/* ─── Dot Texture Background ─────────────────────────────── */
function DotTexture() {
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <Svg width="100%" height="100%" style={StyleSheet.absoluteFill}>
        <Defs>
          <Pattern id="dots" x="0" y="0" width="16" height="16" patternUnits="userSpaceOnUse">
            <Circle cx="2" cy="2" r="0.8" fill="#E0E0E0" opacity={0.5} />
          </Pattern>
        </Defs>
        <Rect width="100%" height="100%" fill="url(#dots)" />
      </Svg>
    </View>
  )
}

/* ─── Animated Tab Button ────────────────────────────────── */
function TabButton({ onPress, active, icon, label, color }: {
  onPress: () => void
  active: boolean
  icon: React.ReactNode
  label: string
  color: string
}) {
  const scaleAnim = useRef(new Animated.Value(1)).current

  const handlePressIn = () => {
    Animated.spring(scaleAnim, { toValue: 0.78, useNativeDriver: true, speed: 50, bounciness: 0 }).start()
  }
  const handlePressOut = () => {
    Animated.spring(scaleAnim, { toValue: 1, useNativeDriver: true, speed: 8, bounciness: 16 }).start()
  }

  return (
    <Pressable onPress={onPress} onPressIn={handlePressIn} onPressOut={handlePressOut} style={styles.tab}>
      <Animated.View style={[styles.tabInner, { transform: [{ scale: scaleAnim }] }]}>
        {icon}
        <Text style={[styles.label, active && { color }]}>{label}</Text>
        {active && <View style={[styles.dot, { backgroundColor: color }]} />}
      </Animated.View>
    </Pressable>
  )
}

/* ─── Tab config ─────────────────────────────────────────── */
const TAB_CONFIG = [
  { Icon: StudentsIcon, label: "Alumnos",    color: COLORS.students.active },
  { Icon: LibraryIcon,  label: "Biblioteca", color: COLORS.library.active },
  { Icon: BuildingIcon, label: "Empresa",    color: COLORS.profile.active },
]

function CustomTabBar({ state, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets()
  return (
    <View style={[styles.bar, { paddingBottom: insets.bottom + 4 }]}>
      <DotTexture />
      <View style={styles.tabsRow}>
        {state.routes.map((route, index) => {
          const active = state.index === index
          const config = TAB_CONFIG[index]
          if (!config) return null
          return (
            <TabButton
              key={route.key}
              onPress={() => navigation.navigate(route.name)}
              active={active}
              icon={<config.Icon active={active} />}
              label={config.label}
              color={config.color}
            />
          )
        })}
      </View>
      <View style={styles.madeWithRow}>
        <Text style={styles.madeWithText}>Hecha con </Text>
        <HeartIcon />
        <Text style={styles.madeWithText}> para ti</Text>
      </View>
    </View>
  )
}

export default function TabLayout() {
  return (
    <Tabs
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{ headerShown: false }}
    >
      <Tabs.Screen name="index" />
      <Tabs.Screen name="library" />
      <Tabs.Screen name="profile" />
    </Tabs>
  )
}

const styles = StyleSheet.create({
  bar: {
    backgroundColor: "#FAFAFA",
    borderTopWidth: 2,
    borderTopColor: "#E5E5E5",
    overflow: "hidden",
  },
  tabsRow: { flexDirection: "row", paddingTop: 8 },
  tab: { flex: 1, alignItems: "center", paddingTop: 4, paddingBottom: 2 },
  tabInner: { alignItems: "center", gap: 1 },
  label: { fontSize: 11, fontWeight: "800", color: "#AFAFAF" },
  dot: { width: 5, height: 5, borderRadius: 2.5, marginTop: 1 },
  madeWithRow: {
    flexDirection: "row", alignItems: "center", justifyContent: "center",
    paddingTop: 4, paddingBottom: 2,
  },
  madeWithText: { fontSize: 9, fontWeight: "700", color: "#D5D5D5" },
})
