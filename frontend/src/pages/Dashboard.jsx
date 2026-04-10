import { useState, useEffect } from "react";
import axios from "axios";

import { SideBar } from "../components/sidebar";
import { MapView } from "../components/map-view";
import { SearchBar } from "../components/search-bar";
import ReportHazardModal from "../components/ReportHazardModal";   // ← new
import LiveHazardsPanel from "../components/LiveHazardsPanel";     // ← new

export const Dashboard = () => {
  const [search, setSearch] = useState("");
  const [hazards, setHazards] = useState([]);
  const [selectedHazard, setSelectedHazard] = useState(null);

  // Modal states
  const [showReportModal, setShowReportModal] = useState(false);
  const [showLivePanel, setShowLivePanel] = useState(false);

  // Load initial hazards
  const loadHazards = async () => {
    try {
      const res = await axios.get("http://localhost:4000/api/v1/posts");
      if (Array.isArray(res.data)) {
        setHazards(res.data);
      } else {
        setHazards([]);
      }
    } catch (err) {
      console.log("Error loading hazards:", err);
      setHazards([]);
    }
  };

  useEffect(() => {
    loadHazards();
  }, []);

  // When a new post is created from modal, add it to the list immediately
  const handlePostCreated = (newPost) => {
    setHazards((prev) => [newPost, ...prev]);
  };

  // Simple filter
  const filteredHazards = hazards.filter((h) => {
    if (!search) return true;
    return (
      h.text?.toLowerCase().includes(search.toLowerCase()) ||
      h.location?.name?.toLowerCase().includes(search.toLowerCase())
    );
  });

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar */}
      <SideBar 
        setShowReportModal={setShowReportModal}
        setShowLivePanel={setShowLivePanel}
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col bg-gray-100">
        {/* Top Bar */}
        <div className="bg-white px-4 py-3 shadow-sm">
          <SearchBar search={search} setSearch={setSearch} />
        </div>

        {/* Map Area */}
        <div className="flex-1 p-4 relative">
          <div className="h-full rounded-xl overflow-hidden shadow">
            <MapView 
              hazards={filteredHazards} 
              selected={selectedHazard}
              setSelected={setSelectedHazard}
            />
          </div>
        </div>
      </div>

      {/* Report Hazard Modal */}
      <ReportHazardModal 
        isOpen={showReportModal}
        onClose={() => setShowReportModal(false)}
        onPostCreated={handlePostCreated}
      />

      {/* Live Hazards Panel */}
      <LiveHazardsPanel 
        isOpen={showLivePanel}
        onClose={() => setShowLivePanel(false)}
      />
    </div>
  );
};