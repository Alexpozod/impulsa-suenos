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
      "bg-[#EDE8FD] text-[#002314]",

    scheduled:
      "bg-blue-100/30 text-[#7048E8]",

    active:
      "bg-green-100/30 text-green-800",

    paused:
      "bg-yellow-100/30 text-yellow-800",

    ended:
      "bg-red-100/30 text-red-800",

    completed:
      "bg-purple-100/30 text-[#7048E8]",

    pending:
      "bg-yellow-100/30 text-yellow-800",

    paid:
      "bg-green-100/30 text-green-800",

    failed:
      "bg-red-100/30 text-red-800",

    cancelled:
      "bg-[#EDE8FD] text-[#002314]",

    available:
      "bg-green-100/30 text-green-800",

        reserved:
      "bg-yellow-100/30 text-yellow-800",

    complimentary:
      "bg-cyan-100/30 text-[#7048E8]",

    low:
      "bg-green-100/30 text-green-800",

    medium:
      "bg-yellow-100/30 text-yellow-800",

    high:
      "bg-red-100/30 text-red-800"

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

          "bg-[#EDE8FD] text-[#002314]"
        }
      `}
    >
      {status}
    </div>
  )
}