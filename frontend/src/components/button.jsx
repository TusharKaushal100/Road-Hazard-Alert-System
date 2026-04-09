export const Button = (props) => {

  const buttonSizeClass = {
    sm: "px-2 py-1 text-sm",
    md: "px-3 py-2 text-md",
    lg: "px-4 py-2 text-lg"
  }

  const variantClass = {
    primary: "bg-yellow-400 text-slate-900 rounded-md font-semibold hover:bg-yellow-300",
    secondary: "bg-slate-700 text-white rounded-md hover:bg-slate-600"
  }

  const defaultStyle = "transition-all duration-200 flex items-center justify-center"

  return (
    <button
      onClick={props.onClick}
      className={`${buttonSizeClass[props.size]} ${variantClass[props.variant]} ${defaultStyle} ${props.className || ""}`}
    >

      {props.startIcon && <span className="mr-1">{props.startIcon}</span>}

      <span>{props.text}</span>

      {props.endIcon && <span className="ml-1">{props.endIcon}</span>}

    </button>
  )
}