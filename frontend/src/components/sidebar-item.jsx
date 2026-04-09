export const SidebarItem = (props) => {
  return (
    <div
      onClick={props.onClick}
      className="flex items-center gap-2 px-2 py-2 rounded-md hover:bg-gray-200 transition cursor-pointer"
    >
      {/* Icon */}
      <div>
        {props.icon}
      </div>

      {/* Text */}
      {props.open && (
        <div className="text-sm font-medium">
          {props.text}
        </div>
      )}
    </div>
  )
}