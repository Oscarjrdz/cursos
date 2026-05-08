import { Tabs } from "expo-router"
import { Animated, Pressable, StyleSheet, Text, View } from "react-native"
import type { BottomTabBarProps } from "@react-navigation/bottom-tabs"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import Svg, { Path, Circle, Rect } from "react-native-svg"
import { useRef } from "react"

/* ─── Duolingo-style vibrant colors ───────────────────────── */
const COLORS = {
  home:    { active: "#58CC02", dark: "#46A302" },
  ranking: { active: "#FFC800", dark: "#E5A800" },
  profile: { active: "#1CB0F6", dark: "#1899D6" },
  muted:   "#AFAFAF",
}

/* ─── Home Icon ──────────────────────────────────────────── */
function HomeIcon({ active }: { active: boolean }) {
  const fill = active ? COLORS.home.active : COLORS.muted
  const dark = active ? COLORS.home.dark : "#9A9A9A"
  return (
    <Svg width={32} height={32} viewBox="0 0 24 24" fill="none">
      <Path d="M12 3L2 12h3v8a1 1 0 001 1h12a1 1 0 001-1v-8h3L12 3z" fill={fill} />
      <Path d="M5 12v8a1 1 0 001 1h12a1 1 0 001-1v-8" fill={dark} opacity={0.25} />
      <Rect x={9.5} y={14} width={5} height={7} rx={1} fill={active ? "#FFFFFF" : "#E0E0E0"} opacity={active ? 0.55 : 0.4} />
      <Rect x={14} y={10} width={3} height={3} rx={0.8} fill={active ? "#FFFFFF" : "#E0E0E0"} opacity={active ? 0.4 : 0.3} />
    </Svg>
  )
}

/* ─── Trophy / Ranking Icon ──────────────────────────────── */
function TrophyIcon({ active }: { active: boolean }) {
  const fill = active ? COLORS.ranking.active : COLORS.muted
  const dark = active ? COLORS.ranking.dark : "#9A9A9A"
  return (
    <Svg width={32} height={32} viewBox="0 0 24 24" fill="none">
      <Path d="M6 3h12v9a6 6 0 01-12 0V3z" fill={fill} />
      <Path d="M8 5h2v6a4 4 0 01-2-.5V5z" fill="#FFFFFF" opacity={0.3} />
      <Path d="M6 5H4a2 2 0 00-2 2v1a3 3 0 003 3h1" stroke={fill} strokeWidth={2.2} strokeLinecap="round" />
      <Path d="M18 5h2a2 2 0 012 2v1a3 3 0 01-3 3h-1" stroke={fill} strokeWidth={2.2} strokeLinecap="round" />
      <Rect x={10.5} y={16} width={3} height={3} rx={0.5} fill={dark} />
      <Rect x={7} y={19} width={10} height={2.5} rx={1.2} fill={dark} />
      <Path
        d="M12 6.5l1.1 2.2 2.4.35-1.75 1.7.41 2.4L12 12l-2.16 1.15.41-2.4-1.75-1.7 2.4-.35L12 6.5z"
        fill="#FFFFFF" opacity={active ? 0.45 : 0.25}
      />
    </Svg>
  )
}

/* ─── Profile / User Icon ────────────────────────────────── */
function UserIcon({ active }: { active: boolean }) {
  const fill = active ? COLORS.profile.active : COLORS.muted
  const dark = active ? COLORS.profile.dark : "#9A9A9A"
  return (
    <Svg width={32} height={32} viewBox="0 0 24 24" fill="none">
      <Circle cx={12} cy={8} r={4.5} fill={fill} />
      <Circle cx={10.5} cy={6.5} r={1.5} fill="#FFFFFF" opacity={0.3} />
      <Path d="M4 21c0-4.42 3.58-8 8-8s8 3.58 8 8" fill={fill} />
      <Path d="M6 21c0-3.87 2.69-7.1 6.3-7.9C8.5 13.7 6 16.5 6 21z" fill={dark} opacity={0.2} />
      <Path d="M9.5 14.5L12 16.5l2.5-2" stroke="#FFFFFF" strokeWidth={1} strokeLinecap="round" opacity={active ? 0.35 : 0.2} />
    </Svg>
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
    Animated.spring(scaleAnim, {
      toValue: 0.8,
      useNativeDriver: true,
      speed: 50,
      bounciness: 0,
    }).start()
  }

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      speed: 8,
      bounciness: 14,
    }).start()
  }

  return (
    <Pressable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={styles.tab}
    >
      <Animated.View style={[styles.tabInner, { transform: [{ scale: scaleAnim }] }]}>
        {icon}
        <Text style={[styles.label, active && { color }]}>
          {label}
        </Text>
        {active && (
          <View style={[styles.dot, { backgroundColor: color }]} />
        )}
      </Animated.View>
    </Pressable>
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
    borderTopColor: "#E5E5E5",
    paddingTop: 6,
  },
  tab: {
    flex: 1,
    alignItems: "center",
    paddingTop: 4,
    paddingBottom: 2,
  },
  tabInner: {
    alignItems: "center",
    gap: 2,
  },
  label: { fontSize: 11, fontWeight: "800", color: "#AFAFAF" },
  dot: { width: 5, height: 5, borderRadius: 2.5, marginTop: 1 },
})
