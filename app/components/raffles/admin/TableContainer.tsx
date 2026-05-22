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
        bg-slate-900
        border border-slate-800
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