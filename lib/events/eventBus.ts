export async function emitEvent(event: string, payload: any) {
  try {
    await fetch("/api/audit-log", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: event,
        entity: payload.entity || "system",
        entity_id: payload.id || null,
        metadata: payload,
        actor_id: payload.actor_id || "system"
      })
    })
  } catch (e) {
    console.error("event_failed", e)
  }
}
