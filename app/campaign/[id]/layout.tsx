// /app/campaign/[id]/layout.tsx

import { ReactNode } from "react"

export async function generateMetadata({ params }: any) {

  try {

    const res = await fetch(
      `${process.env.NEXT_PUBLIC_APP_URL}/api/campaign/${params.id}`,
      { cache: "no-store" }
    )

    const campaign = await res.json()

    const title = campaign?.title || "ImpulsaSueños"
    const description =
      campaign?.description?.slice(0, 140) ||
      "Apoya esta campaña"

    const image =
      campaign?.image_url ||
      campaign?.images?.[0] ||
      `${process.env.NEXT_PUBLIC_APP_URL}/default.jpg`

    const url = `${process.env.NEXT_PUBLIC_APP_URL}/campaign/${params.id}`

    return {
      title,
      description,

      openGraph: {
        title,
        description,
        url,
        images: [{ url }],
      },

      twitter: {
        card: "summary_large_image",
        title,
        description,
        images: [image],
      },
    }

  } catch (error) {

    return {
      title: "ImpulsaSueños",
      description: "Apoya campañas reales",
    }
  }
}

export default function CampaignLayout({
  children
}: {
  children: ReactNode
}) {
  return children
}