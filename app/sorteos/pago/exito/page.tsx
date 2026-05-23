export default function RafflePaymentSuccessPage() {

  return (

    <main className="min-h-screen flex items-center justify-center bg-black text-white p-6">

      <div className="max-w-lg w-full bg-zinc-900 border border-zinc-800 rounded-2xl p-8 text-center">

        <h1 className="text-3xl font-bold mb-4">
          Pago recibido
        </h1>

        <p className="text-zinc-300 mb-6">
          Estamos validando tu pago y asignando tus tickets.
        </p>

        <p className="text-sm text-zinc-500">
          Si el pago fue aprobado correctamente,
          recibirás un correo con tus tickets.
        </p>

      </div>

    </main>
  )
}