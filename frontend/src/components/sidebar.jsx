import { useState } from "react"
import { ProfileIcon } from "../icons/profile-icon"
import { SidebarItem } from "./sidebar-item"
import { Bars } from "../icons/sidebar"
import { Plus } from "../icons/plus"
import { DotLottieReact } from "@lottiefiles/dotlottie-react"
import { Earth } from "../icons/earth"

export const SideBar = ({ setShowModal }) => {
  const [open, setOpen] = useState(true)

  return (
    <div className={`h-screen bg-white shadow-lg  flex flex-col
      ${open ? "w-64" : "w-14"} transition-all duration-300 flex-shrink-0`}>

      {/* Top section */}
      <div className="p-2 space-y-1">

        {/* Toggle */}
        <SidebarItem
          onClick={() => setOpen(!open)}
          icon={<Bars size="md" />}
          text=""
          open={open}
        />

        

        <div className=" pt-1" />

        {/* Dashboard */}
        <SidebarItem
          icon={<ProfileIcon size="md" />}
          text="Dashboard"
          open={open}
        />

        {/* Report Hazard */}
        <SidebarItem
          onClick={() => setShowModal(true)}
          icon={<Plus size="md" />}
          text="Report Hazard"
          open={open}
        />

        <SidebarItem
          onClick={() => setShowModal(true)}
          icon={<Earth size="md" />}
          text="Show Live Hazard"
          open={open}
        />

      </div>

      {/* Bottom animation */}
      <div className="mt-auto pb-6 flex flex-col items-center">
        <div className={open ? "w-32 h-32" : "w-8 h-8"}>
          <DotLottieReact src="/animations/Roadmap.lottie" loop autoplay />
        </div>
        {open && (
          <p className="text-xs text-gray-400 text-center mt-1">Hazard Monitor</p>
        )}
      </div>

    </div>
  )
}
