import { PurchaseResource } from "./types"

export const DOWNLOAD_LINK_EXPIRATION_DAYS = 7

export const STORAGE_BUCKET =
  "raffles-digital-products"

export const PURCHASE_RESOURCES:
  Record<number, PurchaseResource[]> = {

  1: [

    {
      title:
        "Guía Principal",

      description:
        "Aprende a sacar el máximo provecho a tu participación.",

      storagePath:
        "guia-principal.pdf"
    }

  ],

  3: [

    {
      title:
        "Guía Principal",

      description:
        "Aprende a sacar el máximo provecho a tu participación.",

      storagePath:
        "guia-principal.pdf"
    },

    {
      title:
        "Checklist",

      description:
        "Lista práctica para organizar tus objetivos.",

      storagePath:
        "checklist.pdf"
    }

  ],

  5: [

    {
      title:
        "Guía Principal",

      description:
        "Aprende a sacar el máximo provecho a tu participación.",

      storagePath:
        "guia-principal.pdf"
    },

    {
      title:
        "Checklist",

      description:
        "Lista práctica para organizar tus objetivos.",

      storagePath:
        "checklist.pdf"
    },

    {
      title:
        "Plantillas",

      description:
        "Recursos adicionales para complementar tu compra.",

      storagePath:
        "plantillas.pdf"
    }

  ]

}