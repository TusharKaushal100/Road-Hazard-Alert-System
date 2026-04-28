export const SidebarItem = ({ onClick, icon, text, open, active }) => {
  return (
    <div
      onClick={onClick}
      className="flex items-center cursor-pointer transition-all duration-150 px-2 py-2 rounded-lg mb-1"
      style={{
        background: active ? "var(--bg2)" : "transparent",
        color: "var(--text)",
      }}
      onMouseEnter={(e) => { if (!active) e.currentTarget.style.background = "var(--bg2)"; }}
      onMouseLeave={(e) => { if (!active) e.currentTarget.style.background = "transparent"; }}
    >
      <div className="p-1">{icon}</div>
      {open && <span className="ml-2 text-sm font-medium">{text}</span>}
    </div>
  );
};