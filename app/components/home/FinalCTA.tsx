'use client'

type Props = {
  onCreate: () => void
}

export default function FinalCTA({ onCreate }: Props) {
  return (
    <section className="py-28 text-center bg-green-600 text-white">

      <h2 className="text-3xl font-bold mb-6">
        Tú puedes cambiar una vida hoy
      </h2>

      <p className="mb-8 opacity-90">
        Crea una campaña o apoya una causa real.
      </p>

      <button
        onClick={onCreate}
        className="bg-white text-green-600 px-8 py-4 rounded-xl font-semibold"
      >
        Crear campaña
      </button>

    </section>
  )
}