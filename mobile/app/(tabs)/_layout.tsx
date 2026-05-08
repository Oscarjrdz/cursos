import { Tabs } from "expo-router"
import { Pressable, StyleSheet, Text, View } from "react-native"
import type { BottomTabBarProps } from "@react-navigation/bottom-tabs"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import Svg, { Path, Circle, Rect, Line } from "react-native-svg"

/* ─── Duolingo-style vibrant colors ───────────────────────── */
const COLORS = {
  home:    { active: "#58CC02", dark: "#46A302" },  // Duolingo green
  ranking: { active: "#FFC800", dark: "#E5A800" },  // Duolingo gold
  profile: { active: "#1CB0F6", dark: "#1899D6" },  // Duolingo blue
  muted:   "#AFAFAF",
}

/* ─── Home Icon ──────────────────────────────────────────── */
function HomeIcon({ active }: { active: boolean }) {
  const fill = active ? COLORS.home.active : COLORS.muted
  const dark = active ? COLORS.home.dark : "#9A9A9A"
  return (
    <Svg width={28} height={28} viewBox="0 0 24 24" fill="none">
      {/* Roof */}
      <Path
        d="M12 3L2 12h3v8a1 1 0 001 1h12a1 1 0 001-1v-8h3L12 3z"
        fill={fill}
      />
      {/* Roof shadow line */}
      <Path
        d="M5 12v8a1 1 0 001 1h12a1 1 0 001-1v-8"
        fill={dark}
        opacity={0.25}
      />
      {/* Door */}
      <Rect x={9.5} y={14} width={5} height={7} rx={1} fill={active ? "#FFFFFF" : "#E0E0E0"} opacity={active ? 0.55 : 0.4} />
      {/* Window */}
      <Rect x={14} y={10} width={3} height={3} rx={0.8} fill={active ? "#FFFFFF" : "#E0E0E0"} opacity={active ? 0.4 : 0.3} />
    </Svg>
  )
}

/* ─── Trophy / Ranking Icon ──────────────────────────────── */
function TrophyIcon({ active }: { active: boolean }) {
  const fill = active ? COLORS.ranking.active : COLORS.muted
  const dark = active ? COLORS.ranking.dark : "#9A9A9A"
  return (
    <Svg width={28} height={28} viewBox="0 0 24 24" fill="none">
      {/* Cup body */}
      <Path
        d="M6 3h12v9a6 6 0 01-12 0V3z"
        fill={fill}
      />
      {/* Shine on cup */}
      <Path
        d="M8 5h2v6a4 4 0 01-2-.5V5z"
        fill="#FFFFFF"
        opacity={0.3}
      />
      {/* Left handle */}
      <Path
        d="M6 5H4a2 2 0 00-2 2v1a3 3 0 003 3h1"
        stroke={fill}
        strokeWidth={2.2}
        strokeLinecap="round"
      />
      {/* Right handle */}
      <Path
        d="M18 5h2a2 2 0 012 2v1a3 3 0 01-3 3h-1"
        stroke={fill}
        strokeWidth={2.2}
        strokeLinecap="round"
      />
      {/* Stem */}
      <Rect x={10.5} y={16} width={3} height={3} rx={0.5} fill={dark} />
      {/* Base */}
      <Rect x={7} y={19} width={10} height={2.5} rx={1.2} fill={dark} />
      {/* Star on cup */}
      <Path
        d="M12 6.5l1.1 2.2 2.4.35-1.75 1.7.41 2.4L12 12l-2.16 1.15.41-2.4-1.75-1.7 2.4-.35L12 6.5z"
        fill="#FFFFFF"
        opacity={active ? 0.45 : 0.25}
      />
    </Svg>
  )
}

/* ─── Profile / User Icon ────────────────────────────────── */
function UserIcon({ active }: { active: boolean }) {
  const fill = active ? COLORS.profile.active : COLORS.muted
  const dark = active ? COLORS.profile.dark : "#9A9A9A"
  return (
    <Svg width={28} height={28} viewBox="0 0 24 24" fill="none">
      {/* Head */}
      <Circle cx={12} cy={8} r={4.5} fill={fill} />
      {/* Head shine */}
      <Circle cx={10.5} cy={6.5} r={1.5} fill="#FFFFFF" opacity={0.3} />
      {/* Body */}
      <Path
        d="M4 21c0-4.42 3.58-8 8-8s8 3.58 8 8"
        fill={fill}
      />
      {/* Body shadow */}
      <Path
        d="M6 21c0-3.87 2.69-7.1 6.3-7.9C8.5 13.7 6 16.5 6 21z"
        fill={dark}
        opacity={0.2}
      />
      {/* Collar detail */}
      <Path
        d="M9.5 14.5L12 16.5l2.5-2"
        stroke="#FFFFFF"
        strokeWidth={1}
        strokeLinecap="round"
        opacity={active ? 0.35 : 0.2}
      />
    </Svg>
  )
}

/* ─── Tab config ─────────────────────────────────────────── */
const TAB_CONFIG = [
  { Icon: HomeIcon,   label: "Inicio",  color: COLORS.home.active },
  { Icon: TrophyIcon, label: "Ranking", color: COLORS.ranking.active },
  { Icon: UserIcon,   label: "Perfil",  color: COLORS.profile.active },
]

function CustomTabBar({ state, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets()
  return (
    <View style={[styles.bar, { paddingBottom: insets.bottom + 4 }]}>
      {state.routes.map((route, index) => {
        const active = state.index === index
        const config = TAB_CONFIG[index]
        return (
          <Pressable
            key={route.key}
            onPress={() => navigation.navigate(route.name)}
            style={styles.tab}
          >
            {config && <config.Icon active={active} />}
            <Text style={[
              styles.label,
              active && { color: config?.color ?? COLORS.muted },
            ]}>
              {config?.label}
            </Text>
            {active && (
              <View style={[styles.dot, { backgroundColor: config?.color }]} />
            )}
          </Pressable>
        )
      })}
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
      <Tabs.Screen name="ranking" />
      <Tabs.Screen name="profile" />
    </Tabs>
  )
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: "row",
    backgroundColor: "#ffffff",
    borderTopWidth: 2,
    borderTopColor: "#f1f5f9",
    paddingTop: 8,
  },
  tab: {
    flex: 1,
    alignItems: "center",
    gap: 3,
    paddingTop: 4,
    paddingBottom: 2,
  },
  label: { fontSize: 10, fontWeight: "800", color: "#AFAFAF" },
  dot: { width: 5, height: 5, borderRadius: 2.5, marginTop: 1 },
})
