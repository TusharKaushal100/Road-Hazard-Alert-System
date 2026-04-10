export const SidebarItem = ({ onClick, icon, text, open, active }) => {
  return (
    <div
      onClick={onClick}
      className={`flex items-center cursor-pointer transition-all duration-150
        px-2 py-1 rounded-md mb-1

        ${active
          ? "bg-gray-200"
          : "hover:bg-gray-200"
        }
      `}
    >
      {/* Icon */}
      <div className="p-1 text-black">
        {icon}
      </div>

      {/* Text */}
      {open && (
        <span className="ml-2 text-md text-black">
          {text}
        </span>
      )}
    </div>
  )
}