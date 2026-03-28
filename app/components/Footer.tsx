import Link from 'next/link'

export default function Footer() {

  return (
    <footer className="bg-white border-t mt-20">

      <div className="max-w-6xl mx-auto px-6 py-10 text-sm text-gray-500">

        <div className="flex flex-wrap justify-center gap-6 mb-6">

          <Link href="/terminos">Términos</Link>
          <Link href="/privacidad">Privacidad</Link>
          <Link href="/cookies">Cookies</Link>
          <Link href="/faq">FAQ</Link>
          <Link href="/contacto">Contacto</Link>

        </div>

        <p className="text-center">
          © {new Date().getFullYear()} ImpulsaSueños
        </p>

      </div>

    </footer>
  )
}
