import RaffleCheckoutForm from "@/app/components/raffles/public/RaffleCheckoutForm"

export default function CheckoutPage() {

  return (

    <div
      className="
        min-h-screen
        bg-slate-950
        text-white
        py-12
        px-4
      "
    >

      <div
        className="
          max-w-3xl
          mx-auto
        "
      >

        <RaffleCheckoutForm />

      </div>

    </div>

  )
}