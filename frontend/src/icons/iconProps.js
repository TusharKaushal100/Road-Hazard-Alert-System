import { iconSizeClass, defaultStyle } from "./iconProps"

export const Cross = (props) => {

  const size = props.size || "md"

  return (
    <div onClick={props.onClick}>

      <svg
        className={`${iconSizeClass[size]} ${defaultStyle}`}
        stroke="currentColor"
        strokeWidth="1.5"
        viewBox="0 0 24 24"
        fill="none"
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