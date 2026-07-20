type Props = {
  status: string
}

export default function StatusBadge({
  status
}: Props) {

  const colors: Record<
    string,
    string
  > = {

    draft:
      "bg-slate-700 text-slate-200",

    scheduled:
      "bg-blue-900/30 text-blue-300",

    active:
      "bg-green-900/30 text-green-300",

    paused:
      "bg-yellow-900/30 text-yellow-300",

    ended:
      "bg-red-900/30 text-red-300",

    completed:
      "bg-purple-900/30 text-purple-300",

    pending:
      "bg-yellow-900/30 text-yellow-300",

    paid:
      "bg-green-900/30 text-green-300",

    failed:
      "bg-red-900/30 text-red-300",

    cancelled:
      "bg-slate-700 text-slate-300",

    available:
      "bg-green-900/30 text-green-300",

        reserved:
      "bg-yellow-900/30 text-yellow-300",

    complimentary:
      "bg-cyan-900/30 text-cyan-300",

    low:
      "bg-green-900/30 text-green-300",

    medium:
      "bg-yellow-900/30 text-yellow-300",

    high:
      "bg-red-900/30 text-red-300"

  }

  return (

    <div
      className={`
        inline-flex
        items-center
        px-3 py-1
        rounded-full
        text-xs
        font-medium
        border border-white/10

        ${
          colors[status] ||

          "bg-slate-800 text-slate-300"
        }
      `}
    >
      {status}
    </div>
  )
}