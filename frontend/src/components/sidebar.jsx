import { useState } from "react";
import { Bars } from "../icons/sidebar";
import { Plus } from "../icons/plus";
import { Earth } from "../icons/earth";
import { ProfileIcon } from "../icons/profile-icon";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";
import { SidebarItem } from "./sidebar-item";

export const SideBar = ({ currentView, onShowMap, onShowReport, onShowLive }) => {
  const [open, setOpen] = useState(true);

  return (
    <div
      className={`h-screen flex flex-col flex-shrink-0 transition-all duration-300 border-r ${open ? "w-64" : "w-12"}`}
      style={{ background: "var(--sidebar)", borderColor: "var(--border)" }}
    >
      <div className="p-2 space-y-1">

        <SidebarItem onClick={() => setOpen(!open)} icon={<Bars size="lg" />} text="" open={open} />

        <div className="pt-1" />

        <SidebarItem
          onClick={onShowMap}
          icon={<ProfileIcon size="lg" />}
          text="Dashboard"
          open={open}
          active={currentView === "map"}
        />

        <SidebarItem
          onClick={onShowReport}
          icon={<Plus size="lg" />}
          text="Report Hazard"
          open={open}
          active={currentView === "report"}
        />

        <SidebarItem
          onClick={onShowLive}
          icon={<Earth size="lg" />}
          text="Live Hazards"
          open={open}
          active={currentView === "live"}
        />

      </div>

      <div className="mt-auto pb-4 flex flex-col items-center">
        <div className={open ? "w-40 h-40" : "w-8 h-8"}>
          <DotLottieReact src={open ? "/animations/Hazard.lottie" : "/animations/Roadmap.lottie"} loop autoplay />
        </div>
        {open && (
          <p className="text-xs tracking-widest uppercase text-center mt-1" style={{ color: "var(--text2)" }}>
            Hazard Monitor
          </p>
        )}
      </div>

    </div>
  );
};