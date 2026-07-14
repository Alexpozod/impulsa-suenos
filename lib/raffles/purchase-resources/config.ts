import { PurchaseResource } from "./types"

export const DOWNLOAD_LINK_EXPIRATION_DAYS = 7

export const STORAGE_BUCKET =
  "raffles-digital-products"

export const PURCHASE_RESOURCES:
  Record<number, PurchaseResource[]> = {

  1: [

    {
      title: "Manual de Educación Financiera",
      description: "Aprende conceptos fundamentales para mejorar tu organización financiera.",
      storagePath: "Manual_Educacion_Financiera_ImpulsaSuenos.pdf"
    },

    {
      title: "Planificador Financiero en Excel",
      description: "Planifica ingresos, gastos y objetivos utilizando una plantilla práctica.",
      storagePath: "Planificador_Excel_ImpulsaSuenos_2.0.xlsx"
    },

    {
      title: "Guía y Carta de Negociación de Deudas",
      description: "Modelo práctico para preparar conversaciones y negociaciones con tus acreedores.",
      storagePath: "Guia_y_Carta_Negociacion_Deudas.pdf"
    },

    {
      title: "Planificador de Hábitos",
      description: "Herramienta para crear hábitos financieros positivos y hacer seguimiento de tu progreso.",
      storagePath: "Planificador_Habitos_ImpulsaSuenos.pdf"
    }

  ],

  3: [

    {
      title: "Manual de Educación Financiera",
      description: "Aprende conceptos fundamentales para mejorar tu organización financiera.",
      storagePath: "Manual_Educacion_Financiera_ImpulsaSuenos.pdf"
    },

    {
      title: "Planificador Financiero en Excel",
      description: "Planifica ingresos, gastos y objetivos utilizando una plantilla práctica.",
      storagePath: "Planificador_Excel_ImpulsaSuenos_2.0.xlsx"
    },

    {
      title: "Guía y Carta de Negociación de Deudas",
      description: "Modelo práctico para preparar conversaciones y negociaciones con tus acreedores.",
      storagePath: "Guia_y_Carta_Negociacion_Deudas.pdf"
    },

    {
      title: "Planificador de Hábitos",
      description: "Herramienta para crear hábitos financieros positivos y hacer seguimiento de tu progreso.",
      storagePath: "Planificador_Habitos_ImpulsaSuenos.pdf"
    }

  ],

  5: [

    {
      title: "Manual de Educación Financiera",
      description: "Aprende conceptos fundamentales para mejorar tu organización financiera.",
      storagePath: "Manual_Educacion_Financiera_ImpulsaSuenos.pdf"
    },

    {
      title: "Planificador Financiero en Excel",
      description: "Planifica ingresos, gastos y objetivos utilizando una plantilla práctica.",
      storagePath: "Planificador_Excel_ImpulsaSuenos_2.0.xlsx"
    },

    {
      title: "Guía y Carta de Negociación de Deudas",
      description: "Modelo práctico para preparar conversaciones y negociaciones con tus acreedores.",
      storagePath: "Guia_y_Carta_Negociacion_Deudas.pdf"
    },

    {
      title: "Planificador de Hábitos",
      description: "Herramienta para crear hábitos financieros positivos y hacer seguimiento de tu progreso.",
      storagePath: "Planificador_Habitos_ImpulsaSuenos.pdf"
    }

  ]

}