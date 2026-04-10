import { useState, useEffect } from "react";
import axios from "axios";

import { SideBar } from "../components/sidebar";
import { MapView } from "../components/map-view";
import { SearchBar } from "../components/search-bar";

import ReportHazardModal from "../components/ReportHazardModal";
import LiveHazardsPanel from "../components/LiveHazardsPanel";

export const Dashboard = () => {
  const [search, setSearch] = useState("");
  const [hazards, setHazards] = useState([]);
  const [selectedHazard, setSelectedHazard] = useState(null);

  const [showReportModal, setShowReportModal] = useState(false);
  const [showLivePanel, setShowLivePanel] = useState(false);

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

  const handlePostCreated = (newPost) => {
    if (newPost) setHazards((prev) => [newPost, ...prev]);
  };

  const filteredHazards = hazards.filter((h) =>
    !search ||
    h.text?.toLowerCase().includes(search.toLowerCase()) ||
    h.location?.name?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar - Fixed width */}
      <SideBar 
        setShowReportModal={setShowReportModal}
        setShowLivePanel={setShowLivePanel}
      />

      {/* Main Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Bar */}
        <div className="bg-white border-b px-6 py-4">
          <SearchBar search={search} setSearch={setSearch} />
        </div>

        {/* Map Area - Takes remaining space */}
        <div className="flex-1 p-4 relative bg-gray-100">
          <div className="absolute inset-4 rounded-2xl overflow-hidden shadow border">
            <MapView 
              hazards={filteredHazards} 
              selected={selectedHazard}
              setSelected={setSelectedHazard}
            />
          </div>
        </div>
      </div>

      {/* Report Hazard Modal - Full overlay */}
      <ReportHazardModal 
        isOpen={showReportModal}
        onClose={() => setShowReportModal(false)}
        onPostCreated={handlePostCreated}
      />

      {/* Live Hazards Panel - Slides from left after sidebar */}
      <LiveHazardsPanel 
        isOpen={showLivePanel}
        onClose={() => setShowLivePanel(false)}
      />
    </div>
  );
};