'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function SuccessPage() {
  const router = useRouter()

  useEffect(() => {
    // Esperar un poco para asegurar que el webhook guarde
    setTimeout(() => {
      router.push('/')
      router.refresh()
    }, 3000)
  }, [router])

  return (
    <div style={{ textAlign: 'center', marginTop: '100px' }}>
      <h1>✅ Pago exitoso</h1>
      <p>Procesando tu donación...</p>
    </div>
  )
}
