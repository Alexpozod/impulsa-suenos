import { supabaseAdmin }
from "@/lib/raffles/supabase/admin"

import {
  DOWNLOAD_LINK_EXPIRATION_DAYS,
  PURCHASE_RESOURCES,
  STORAGE_BUCKET
}
from "./config"

import {
  PurchaseResourceDownload
}
from "./types"

const DOWNLOAD_LINK_EXPIRATION_SECONDS =
  DOWNLOAD_LINK_EXPIRATION_DAYS * 24 * 60 * 60

export async function createSignedDownloadLinks(
  quantity: number
): Promise<PurchaseResourceDownload[]> {

  const resources =
    PURCHASE_RESOURCES[quantity] ?? []

  const downloads: PurchaseResourceDownload[] = []

  for (const resource of resources) {

    const {
      data,
      error
    } =
      await supabaseAdmin
        .storage
        .from(STORAGE_BUCKET)
        .createSignedUrl(
          resource.storagePath,
          DOWNLOAD_LINK_EXPIRATION_SECONDS
        )

    if (error) {

      console.error(
        "SIGNED URL ERROR",
        resource.storagePath,
        error
      )

      continue

    }

    downloads.push({

      ...resource,

      downloadUrl:
        data.signedUrl,

      expiresInDays:
        DOWNLOAD_LINK_EXPIRATION_DAYS

    })

  }

  return downloads

}