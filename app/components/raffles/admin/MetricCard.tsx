type Props = {

  title: string

  value: string | number

  subtitle?: string
}

export default function MetricCard({

  title,
  value,
  subtitle

}: Props) {

  return (

    <div
      className="
        bg-slate-900
        border border-slate-800
        rounded-xl
        p-4
      "
    >

      <p className="text-slate-400 text-sm">
        {title}
      </p>

      <h3
        className="
          text-2xl
          font-bold
          mt-2
        "
      >
        {value}
      </h3>

      {subtitle && (

        <p
          className="
            text-xs
            text-slate-500
            mt-2
          "
        >
          {subtitle}
        </p>

      )}

    </div>
  )
}