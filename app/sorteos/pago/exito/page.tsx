export default function RafflePaymentSuccessPage() {

  return (

    <main className="min-h-screen bg-white flex items-center justify-center px-6">

      <div className="max-w-lg w-full border border-zinc-200 rounded-2xl bg-white shadow-sm p-10 text-center">

        <h1 className="text-4xl font-bold text-zinc-900 mb-4">
          Pago recibido
        </h1>

        <p className="text-zinc-600 text-lg mb-6">
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