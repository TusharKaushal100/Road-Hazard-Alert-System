import { useState } from "react"
import { ProfileIcon } from "../icons/profile-icon"
import { SidebarItem } from "./sidebar-item"
import { Bars } from "../icons/sidebar"
import { Plus } from "../icons/plus"
import { DotLottieReact } from "@lottiefiles/dotlottie-react"

export const SideBar = (props) => {

  const [open, setOpen] = useState(true)

  return (
    <div className={`h-screen bg-white shadow-lg border-r flex flex-col ${open ? "w-72" : "w-14"} transition-all duration-300`}>

      {/* Top Section */}
      <div className="p-2">

        {/* Toggle Button */}
        <SidebarItem
          onClick={() => setOpen(!open)}
          icon={<Bars size="md" />}
          text=""
          open={open}
        />

        {/* Dashboard */}
        <SidebarItem
          icon={<ProfileIcon size="md" />}
          text="Dashboard"
          open={open}
        />

        {/* Send Post (IMPORTANT FEATURE) */}
        <SidebarItem
          onClick={() => props.setShowModal(true)}
          icon={<Plus size="md" />}
          text="Send Post"
          open={open}
        />

        {/* Profile */}
        <SidebarItem
          icon={<ProfileIcon size="md" />}
          text="Profile"
          open={open}
        />

      </div>

      {/* Bottom Animation */}
      {open ? (
        <div className="mt-auto flex flex-col items-center pb-10 px-4">
          <div className="w-40 h-40">
            <DotLottieReact src="/animations/TrafficLight.lottie" loop autoplay />
          </div>
          <p className="text-xs text-gray-400 text-center mt-1">
            Hazard Monitor
          </p>
        </div>
      ) : (
        <div className="mt-auto pb-4 flex justify-center">
          <div className="w-8 h-8">
            <DotLottieReact src="/animations/TrafficLight.lottie" loop autoplay />
          </div>
        </div>
      )}

    </div>
  )
}