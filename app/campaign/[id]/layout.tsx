import type { Metadata } from "next"

/* =========================
   🔥 GENERATE METADATA
========================= */
export async function generateMetadata(
  { params }: { params: { id: string } }
): Promise<Metadata> {

  const id = params?.id

  const baseUrl =
    process.env.NEXT_PUBLIC_APP_URL ||
    "https://impulsasuenos.com"

  let campaign: any = null

  try {

    const res = await fetch(
      `${baseUrl}/api/campaign/${id}`,
      {
        cache: "no-store"
      }
    )

    if (res.ok) {
      campaign = await res.json()
    }

  } catch (error) {

    console.error("OG fetch error:", error)
  }

  /* =========================
     🧠 CONTENIDO
  ========================= */
  const title =
    campaign?.title ||
    "ImpulsaSueños"

  const rawDescription =
    campaign?.description ||
    "Apoya esta campaña en ImpulsaSueños"

  const description =
    rawDescription.length > 180
      ? rawDescription.slice(0, 177) + "..."
      : rawDescription

  /* =========================
     🖼️ IMAGEN
  ========================= */
  let image =
    campaign?.image_url ||
    campaign?.images?.[0] ||
    `${baseUrl}/default-og.png`

  // 🔥 FIX URL RELATIVA
  if (image?.startsWith("/")) {
    image = `${baseUrl}${image}`
  }

  const url =
    `${baseUrl}/campaign/${id}`

  return {

    metadataBase: new URL(baseUrl),

    title,

    description,

    openGraph: {

      title,

      description,

      url,

      siteName: "ImpulsaSueños",

      locale: "es_CL",

      type: "website",

      images: [
        {
          url: image,
          width: 1200,
          height: 630,
          alt: title,
          type: "image/png"
        }
      ]
    },

    twitter: {

      card: "summary_large_image",

      title,

      description,

      images: [image]
    }
  }
}

/* =========================
   LAYOUT
========================= */
export default function CampaignLayout({
  children
}: {
  children: React.ReactNode
}) {
  return children
}