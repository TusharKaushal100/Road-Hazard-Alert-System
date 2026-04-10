import { useState, useEffect } from "react";
import axios from "axios";

import { SideBar } from "../components/sidebar";
import { MapView } from "../components/map-view";
import { SearchBar } from "../components/search-bar";
import ReportHazardModal from "../components/ReportHazardModal";
import LiveHazardsPanel from "../components/LiveHazardsPanel";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";

// Views
const VIEW = {
  MAP: "map",
  REPORT: "report",
  LIVE: "live",
};

export const Dashboard = () => {
  const [search, setSearch] = useState("");
  const [hazards, setHazards] = useState([]);
  const [selectedHazard, setSelectedHazard] = useState(null);
  const [currentView, setCurrentView] = useState(VIEW.MAP);

  // 🔥 NEW: animation state
  const [showAnimation, setShowAnimation] = useState(false);

  // Load hazards
  const loadHazards = async () => {
    try {
      const res = await axios.get("http://localhost:4000/api/v1/posts");
      setHazards(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("Error loading hazards:", err);
      setHazards([]);
    }
  };

  useEffect(() => {
    loadHazards();
  }, []);

  // When new post is created
  const handlePostCreated = (newPost) => {
    if (newPost) setHazards((prev) => [newPost, ...prev]);
    setCurrentView(VIEW.MAP);
  };

  const handleViewChange = (view) => {
  setShowAnimation(true)

  // 🔥 Force React to render animation first
  setTimeout(() => {
    setCurrentView(view)

    // hide animation after delay
    setTimeout(() => {
      setShowAnimation(false)
    }, 1500)

  }, 50) // small delay to allow render
}

  // Filter hazards
  const filteredHazards = hazards.filter(
    (h) =>
      !search ||
      h.text?.toLowerCase().includes(search.toLowerCase()) ||
      h.location?.name?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex h-screen overflow-hidden bg-white">

      {/* Sidebar */}
      <SideBar
        currentView={currentView}
        onShowMap={() => handleViewChange(VIEW.MAP)}
        onShowReport={() => handleViewChange(VIEW.REPORT)}
        onShowLive={() => handleViewChange(VIEW.LIVE)}
      />

      {/* Main Area */}
      <div className="flex-1 flex flex-col min-w-0 bg-white">

        {/* Top Bar */}
        <div className="bg-white border-b px-6 py-4 flex-shrink-0">
          <SearchBar search={search} setSearch={setSearch} />
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden relative">

          {/* 🔥 LOTTIE ANIMATION OVERLAY */}
          {showAnimation && (
           <div className="absolute inset-0 flex items-center justify-center bg-white z-50">

              <div className="w-60 h-60">
                <DotLottieReact
                  src="/animations/Roadmap.lottie"
                  loop
                  autoplay
                />
              </div>

            </div>
          )}

          {/* MAP VIEW */}
          {currentView === VIEW.MAP && (
            <div className="absolute inset-0 p-4">
              <div className="w-full h-full rounded-2xl overflow-hidden shadow border">
                <MapView
                  hazards={filteredHazards}
                  selected={selectedHazard}
                  setSelected={setSelectedHazard}
                />
              </div>
            </div>
          )}

          {/* REPORT VIEW */}
          {currentView === VIEW.REPORT && (
            <div className="absolute inset-0 flex items-center justify-center bg-white p-8">
              <ReportHazardModal
                onClose={() => setCurrentView(VIEW.MAP)}
                onPostCreated={handlePostCreated}
              />
            </div>
          )}

          {/* LIVE VIEW */}
          {currentView === VIEW.LIVE && (
            <div className="absolute inset-0 bg-white">
              <LiveHazardsPanel onClose={() => setCurrentView(VIEW.MAP)} />
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

