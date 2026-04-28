import type { Metadata } from "next"

/* =========================
   🔥 GENERATE METADATA (OG PRO)
========================= */
export async function generateMetadata(
  { params }: { params: { id: string } }
): Promise<Metadata> {

  const id = params.id

  let campaign: any = null

  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_APP_URL}/api/campaign/${id}`,
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

  const title = campaign?.title || "ImpulsaSueños"
  const description =
    campaign?.description?.slice(0, 150) ||
    "Apoya esta campaña en ImpulsaSueños"

  const image =
    campaign?.image_url ||
    campaign?.images?.[0] ||
    `${process.env.NEXT_PUBLIC_APP_URL}/default-og.jpg`

  const url = `${process.env.NEXT_PUBLIC_APP_URL}/campaign/${id}`

  return {
    title,
    description,

    openGraph: {
      title,
      description,
      url,
      siteName: "ImpulsaSueños",
      images: [
        {
          url: image,
          width: 1200,
          height: 630,
          alt: title
        }
      ],
      locale: "es_CL",
      type: "website"
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
   LAYOUT (NO TOCAR)
========================= */
export default function CampaignLayout({
  children
}: {
  children: React.ReactNode
}) {
  return children
}