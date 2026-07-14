import {
  createSignedDownloadLinks
}
from "./createSignedDownloadLinks"

export async function getResourcesForQuantity(
  quantity: number
) {

  return createSignedDownloadLinks(
    quantity
  )

}