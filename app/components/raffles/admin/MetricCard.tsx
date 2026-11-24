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
        bg-[#EDE8FD]
        border border-[#285143]
        rounded-xl
        p-4
      "
    >

      <p className="text-[#002314] text-sm">
        {title}
      </p>

      <h3
        className="
          text-2xl
          font-bold
          text-[#002314]
          mt-2
        "
      >
        {value}
      </h3>

      {subtitle && (

        <p
          className="
            text-xs
            text-[#002314]
            mt-2
          "
        >
          {subtitle}
        </p>

      )}

    </div>
  )
}