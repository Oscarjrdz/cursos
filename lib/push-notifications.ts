type PushMessage = {
  to: string | string[]
  title: string
  body: string
  data?: Record<string, unknown>
}

export async function sendPushNotification(message: PushMessage): Promise<void> {
  const tokens = Array.isArray(message.to) ? message.to : [message.to]
  const validTokens = tokens.filter((t) => t.startsWith("ExponentPushToken["))
  if (validTokens.length === 0) return

  const messages = validTokens.map((token) => ({
    to: token,
    title: message.title,
    body: message.body,
    data: message.data ?? {},
    sound: "default",
    priority: "high",
  }))

  await fetch("https://exp.host/--/api/v2/push/send", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      "Accept-Encoding": "gzip, deflate",
    },
    body: JSON.stringify(messages),
  })
}
