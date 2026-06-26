export function normalizeCommercialCode(
  code?: string | null
) {

  if (!code) {

    return undefined

  }

  const normalized =
    code
      .trim()
      .toUpperCase()

  if (!normalized.length) {

    return undefined

  }

  return normalized

}