export function getSessionId(): string {

  if (typeof window === "undefined") {
    return "server"
  }

  try {

    const existing = localStorage.getItem("session_id")

    if (existing) {
      return existing
    }

    const sessionId = crypto.randomUUID()

    localStorage.setItem("session_id", sessionId)

    return sessionId

  } catch (err) {

    console.error("session_id error:", err)

    return "unknown"
  }
}