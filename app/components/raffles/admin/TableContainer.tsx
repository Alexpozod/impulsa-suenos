import { ReactNode }
from "react"

type Props = {

  children: ReactNode
}

export default function TableContainer({
  children
}: Props) {

  return (

    <div
      className="
        bg-[#EDE8FD]
        border border-[#002314]/20
        rounded-xl
        overflow-hidden
      "
    >

      <div className="overflow-x-auto">

        {children}

      </div>

    </div>
  )
}