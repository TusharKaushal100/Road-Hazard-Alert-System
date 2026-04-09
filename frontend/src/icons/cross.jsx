export const Cross = (props) => {

  const iconSizeClass = {
    sm: "w-4 h-4",
    md: "w-6 h-6",
    lg: "w-8 h-8"
  }

  const defaultStyle = "cursor-pointer text-gray-600 hover:text-black transition"

  return (
    <div onClick={props.onClick} className="cursor-pointer">

      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth="1.5"
        stroke="currentColor"
        className={`${iconSizeClass[props.size]} ${defaultStyle}`}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M6 18 18 6M6 6l12 12"
        />
      </svg>

    </div>
  )
}