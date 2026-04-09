import React from "react"

export const Input = React.forwardRef((props, ref) => {

  const placeholder = props.placeholder
  const type = props.type || "text"
  const defaultStyle = props.defaultStyle || ""

  return (
    <div className="w-full">

      <input
        ref={ref}
        type={type}
        placeholder={placeholder}
        className={`
          w-full
          px-3 py-2
          rounded-lg
          border border-gray-300
          bg-white
          text-black
          text-sm
          focus:outline-none
          focus:ring-2 focus:ring-yellow-400
          focus:border-yellow-400
          transition-all duration-200
          ${defaultStyle}
        `}
      />

    </div>
  )
})

Input.displayName = "Input"