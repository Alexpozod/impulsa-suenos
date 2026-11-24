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
        bg-[#05291B]
        border border-[#285143]
        rounded-xl
        p-4
      "
    >

      <p className="text-[#C3C8C2] text-sm">
        {title}
      </p>

      <h3
        className="
          text-2xl
          font-bold
          text-[#FAF9F5]
          mt-2
        "
      >
        {value}
      </h3>

      {subtitle && (

        <p
          className="
            text-xs
            text-[#B3BDB7]
            mt-2
          "
        >
          {subtitle}
        </p>

      )}

    </div>
  )
}