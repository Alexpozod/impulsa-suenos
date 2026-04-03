export function generatePrefix(title: string): string {
  if (!title) return "CMP"

  const words = title
    .toUpperCase()
    .replace(/[^A-Z0-9 ]/g, "")
    .split(" ")
    .filter(w => w.length > 2)

  const prefix = words
    .slice(0, 2)
    .map(w => w.substring(0, 2))
    .join("")

  return prefix || "CMP"
}