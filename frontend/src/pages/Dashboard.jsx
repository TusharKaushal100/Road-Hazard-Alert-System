import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";

import { SideBar } from "../components/sidebar";
import { MapView } from "../components/map-view";
import { SearchBar } from "../components/search-bar";
import ReportHazardModal from "../components/ReportHazardModal";
import LiveHazardsPanel from "../components/LiveHazardsPanel";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";

const VIEW = { MAP: "map", REPORT: "report", LIVE: "live" };

export const Dashboard = ({ dark, toggleDark }) => {
  const [search, setSearch] = useState("");
  const [hazards, setHazards] = useState([]);
  const [selectedHazard, setSelectedHazard] = useState(null);
  const [currentView, setCurrentView] = useState(VIEW.MAP);
  const [showAnimation, setShowAnimation] = useState(false);

  const navigate = useNavigate();
  const username = localStorage.getItem("username") || "User";

  const loadHazards = async () => {
    try {
      const res = await axios.get("http://localhost:4000/api/v1/posts");
      setHazards(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      setHazards([]);
    }
  };

  useEffect(() => { loadHazards(); }, []);

  const handlePostCreated = (newPost) => {
    if (newPost) setHazards((prev) => [newPost, ...prev]);
    setCurrentView(VIEW.MAP);
  };

  const handleViewChange = (view) => {
    setShowAnimation(true);
    setTimeout(() => {
      setCurrentView(view);
      setTimeout(() => setShowAnimation(false), 1500);
    }, 50);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("username");
    navigate("/login");
  };

  const filteredHazards = hazards.filter(
    (h) =>
      !search ||
      h.text?.toLowerCase().includes(search.toLowerCase()) ||
      h.location?.name?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: "var(--bg)" }}>

      <SideBar
        currentView={currentView}
        onShowMap={() => handleViewChange(VIEW.MAP)}
        onShowReport={() => handleViewChange(VIEW.REPORT)}
        onShowLive={() => handleViewChange(VIEW.LIVE)}
      />

      <div className="flex-1 flex flex-col min-w-0">

        <div
          className="flex items-center justify-between px-6 py-3 flex-shrink-0 border-b"
          style={{ background: "var(--topbar)", borderColor: "var(--border)" }}
        >
          <SearchBar search={search} setSearch={setSearch} />

          <div className="flex items-center gap-3 ml-4">

            <button
              onClick={toggleDark}
              className="w-9 h-9 rounded-full flex items-center justify-center border transition hover:opacity-80"
              style={{ borderColor: "var(--border)", background: "var(--bg2)", color: "var(--text)" }}
              title={dark ? "Switch to light mode" : "Switch to dark mode"}
            >
              {dark ? "☀" : "🌙"}
            </button>

            <span className="text-sm font-medium" style={{ color: "var(--text2)" }}>
              @{username}
            </span>

            <Link
              to="/login"
              onClick={handleLogout}
              className="text-sm px-3 py-1.5 rounded-lg border font-medium transition hover:opacity-80"
              style={{ borderColor: "var(--border)", color: "var(--text)", background: "var(--bg2)" }}
            >
              Logout
            </Link>

          </div>
        </div>

        <div className="flex-1 overflow-hidden relative" style={{ background: "var(--bg2)" }}>

          {showAnimation && (
            <div
              className="absolute inset-0 flex items-center justify-center z-50"
              style={{ background: "var(--bg)" }}
            >
              <div className="w-60 h-60">
                <DotLottieReact src="/animations/Roadmap.lottie" loop autoplay />
              </div>
            </div>
          )}

          {currentView === VIEW.MAP && (
            <div className="absolute inset-0 p-4">
              <div className="w-full h-full rounded-2xl overflow-hidden shadow border" style={{ borderColor: "var(--border)" }}>
                <MapView
                  hazards={filteredHazards}
                  selected={selectedHazard}
                  setSelected={setSelectedHazard}
                />
              </div>
            </div>
          )}

          {currentView === VIEW.REPORT && (
            <div className="absolute inset-0 flex items-center justify-center p-8" style={{ background: "var(--bg)" }}>
              <ReportHazardModal
                onClose={() => setCurrentView(VIEW.MAP)}
                onPostCreated={handlePostCreated}
              />
            </div>
          )}

          {currentView === VIEW.LIVE && (
            <div className="absolute inset-0" style={{ background: "var(--bg)" }}>
              <LiveHazardsPanel onClose={() => setCurrentView(VIEW.MAP)} />
            </div>
          )}

        </div>
      </div>
    </div>
  );
};