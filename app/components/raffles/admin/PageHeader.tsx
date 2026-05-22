import { ReactNode }
from "react"

type Props = {

  title: string

  description?: string

  actions?: ReactNode
}

export default function PageHeader({

  title,
  description,
  actions

}: Props) {

  return (

    <div
      className="
        flex
        items-start
        justify-between
        gap-4
        flex-wrap
      "
    >

      <div>

        <h1
          className="
            text-3xl
            font-bold
          "
        >
          {title}
        </h1>

        {description && (

          <p
            className="
              text-slate-400
              mt-1
            "
          >
            {description}
          </p>

        )}

      </div>

      {actions && (

        <div
          className="
            flex items-center
            gap-2
          "
        >
          {actions}
        </div>

      )}

    </div>
  )
}