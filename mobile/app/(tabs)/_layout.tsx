import { Tabs } from "expo-router"
import { Pressable, StyleSheet, Text, View } from "react-native"
import type { BottomTabBarProps } from "@react-navigation/bottom-tabs"
import { useSafeAreaInsets } from "react-native-safe-area-context"

function HomeIcon({ active }: { active: boolean }) {
  const c = active ? "#7c3aed" : "#94a3b8"
  return (
    <View style={{ width: 26, height: 26, justifyContent: "center", alignItems: "center" }}>
      <View style={{ position: "absolute", width: 26, height: 26 }}>
        {/* Roof */}
        <View style={{
          position: "absolute", top: 0, left: 0, right: 0,
          borderLeftWidth: 13, borderRightWidth: 13, borderBottomWidth: 10,
          borderLeftColor: "transparent", borderRightColor: "transparent", borderBottomColor: c,
        }} />
        {/* Body */}
        <View style={{
          position: "absolute", bottom: 0, left: 4, right: 4, height: 14,
          backgroundColor: active ? c : "transparent",
          borderWidth: active ? 0 : 2, borderColor: c, borderTopWidth: 0,
        }} />
        {/* Door */}
        <View style={{
          position: "absolute", bottom: 0, left: 9, right: 9, height: 8,
          backgroundColor: active ? "rgba(255,255,255,0.4)" : "transparent",
        }} />
      </View>
    </View>
  )
}

function TrophyIcon({ active }: { active: boolean }) {
  const c = active ? "#7c3aed" : "#94a3b8"
  return (
    <View style={{ width: 26, height: 26, justifyContent: "center", alignItems: "center" }}>
      <View style={{
        width: 18, height: 14, borderRadius: 2,
        backgroundColor: active ? c : "transparent",
        borderWidth: 2, borderColor: c,
        marginBottom: 2,
      }} />
      <View style={{ width: 2, height: 5, backgroundColor: c }} />
      <View style={{ width: 12, height: 2, backgroundColor: c, borderRadius: 1 }} />
    </View>
  )
}

function UserIcon({ active }: { active: boolean }) {
  const c = active ? "#7c3aed" : "#94a3b8"
  return (
    <View style={{ width: 26, height: 26, justifyContent: "center", alignItems: "center" }}>
      <View style={{
        width: 12, height: 12, borderRadius: 6,
        backgroundColor: active ? c : "transparent",
        borderWidth: 2, borderColor: c, marginBottom: 3,
      }} />
      <View style={{
        width: 20, height: 8, borderTopLeftRadius: 10, borderTopRightRadius: 10,
        backgroundColor: active ? c : "transparent",
        borderWidth: 2, borderColor: c, borderBottomWidth: 0,
      }} />
    </View>
  )
}

const ICONS = [HomeIcon, TrophyIcon, UserIcon]
const LABELS = ["Inicio", "Ranking", "Perfil"]

function CustomTabBar({ state, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets()
  return (
    <View style={[styles.bar, { paddingBottom: insets.bottom + 4 }]}>
      {state.routes.map((route, index) => {
        const active = state.index === index
        const Icon = ICONS[index]
        return (
          <Pressable
            key={route.key}
            onPress={() => navigation.navigate(route.name)}
            style={styles.tab}
          >
            {Icon && <Icon active={active} />}
            <Text style={[styles.label, active && styles.labelActive]}>
              {LABELS[index]}
            </Text>
            {active && <View style={styles.dot} />}
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
  label: { fontSize: 10, fontWeight: "700", color: "#94a3b8" },
  labelActive: { color: "#7c3aed" },
  dot: { width: 4, height: 4, borderRadius: 2, backgroundColor: "#7c3aed" },
})
