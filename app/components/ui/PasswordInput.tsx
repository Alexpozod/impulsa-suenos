"use client"

import { useState } from "react"

type PasswordInputProps = {
  value: string
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  placeholder?: string
  className?: string
  autoComplete?: string
  disabled?: boolean
}

export default function PasswordInput({
  value,
  onChange,
  placeholder,
  className = "",
  autoComplete,
  disabled
}: PasswordInputProps) {

  const [showPassword, setShowPassword] = useState(false)

  return (
    <div className="relative">

      <input
        type={showPassword ? "text" : "password"}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        autoComplete={autoComplete}
        disabled={disabled}
        className={`${className} pr-12`}
      />

      <button
        type="button"
        onClick={() => setShowPassword(v => !v)}
        className="
          absolute
          right-3
          top-1/2
          -translate-y-1/2
          text-slate-400
          hover:text-white
          transition
        "
        aria-label={
          showPassword
            ? "Ocultar contraseña"
            : "Mostrar contraseña"
        }
      >
        {showPassword ? "🙈" : "👁️"}
      </button>

    </div>
  )
}