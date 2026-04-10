import { iconSizeClass, defaultStyle } from "./iconProps"

export const Plus = (props) => {

  const size = props.size || "lg"

  return (
    <div onClick={props.onClick} className="cursor-pointer">

      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth="1.5"
        stroke="currentColor"
        className={`${iconSizeClass[size]} ${defaultStyle}`}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M12 4.5v15m7.5-7.5h-15"
        />
      </svg>

    </div>
  )
}