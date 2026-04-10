import { useState } from "react"
import { Bars } from "../icons/sidebar"
import { Plus } from "../icons/plus"
import { Earth } from "../icons/earth"
import { ProfileIcon } from "../icons/profile-icon"
import { DotLottieReact } from "@lottiefiles/dotlottie-react"
import { SidebarItem } from "./sidebar-item"

const defaultStyle = "h-screen bg-white shadow-lg flex flex-col"

export const SideBar = ({ currentView, onShowMap, onShowReport, onShowLive }) => {

  const [open, setOpen] = useState(true)

  return (
    <div className={`${defaultStyle} ${open ? "w-72" : "w-12"} transition-all duration-300`}>

      {/* TOP SECTION */}
      <div>

        {/* Toggle */}
        <div className="mb-3">
          <SidebarItem
            onClick={() => setOpen(!open)}
            icon={<Bars size={"lg"} />}
            text={""}
            open={open}
          />
        </div>

        {/* Dashboard */}
        <SidebarItem
          onClick={onShowMap}
          icon={<ProfileIcon size={"lg"} />}
          text={"Dashboard"}
          open={open}
        />

        {/* Report Hazard */}
        <SidebarItem
          onClick={onShowReport}
          icon={<Plus size={"lg"} />}
          text={"Report Hazard"}
          open={open}
        />

        {/* Live Hazards */}
        <SidebarItem
          onClick={onShowLive}
          icon={<Earth size={"lg"} />}
          text={"Live Hazards"}
          open={open}
        />

      </div>

      {/* BOTTOM SECTION */}
      {open && (
        <div className="mt-auto flex flex-col items-center pb-16 px-4">

          <div className="w-52 h-52">
            <DotLottieReact src="/animations/Hazard.lottie" loop autoplay />
          </div>

          <p className="text-xs text-gray-400 tracking-widest uppercase text-center mt-1">
            Hazard Monitor
          </p>

        </div>
      )}

      {!open && (
        <div className="mt-auto pb-4 flex justify-center">
          <div className="w-8 h-8">
            <DotLottieReact src="/animations/Roadmap.lottie" loop autoplay />
          </div>
        </div>
      )}

    </div>
  )
}