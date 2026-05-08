import { Redirect } from "expo-router"
import { ActivityIndicator, View } from "react-native"
import { useAuth } from "../lib/auth"

export default function Index() {
  const { token, isLoading } = useAuth()

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#f8fafc" }}>
        <ActivityIndicator size="large" color="#7c3aed" />
      </View>
    )
  }

  return <Redirect href={token ? "/(tabs)" : "/login"} />
}
