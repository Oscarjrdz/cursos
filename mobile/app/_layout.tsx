import { useEffect } from "react"
import { Stack } from "expo-router"
import * as Notifications from "expo-notifications"
import { AuthProvider } from "../lib/auth"

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
})

export default function RootLayout() {
  useEffect(() => {
    Notifications.requestPermissionsAsync()
  }, [])

  return (
    <AuthProvider>
      <Stack screenOptions={{ headerShown: false }} />
    </AuthProvider>
  )
}
