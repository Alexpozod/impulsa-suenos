export interface PurchaseResource {

  title: string

  description: string

  storagePath: string

}

export interface PurchaseResourceDownload
  extends PurchaseResource {

  downloadUrl: string

  expiresInDays: number

}