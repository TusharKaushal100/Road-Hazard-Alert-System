import { useState, useEffect } from "react"
import axios from "axios"
import { SideBar } from "../components/sidebar"
import { MapView } from "../components/map-view"
import { SearchBar } from "../components/search-bar"
import { Modal } from "../components/modal"

export const Dashboard = () => {

  const [search, setSearch] = useState("")
  const [hazards, setHazards] = useState([])
  const [showModal, setShowModal] = useState(false)

  // 🔹 Load data from backend
  const loadHazards = async () => {
    try {
      const res = await axios.get("http://localhost:4000/api/v1/posts")

      console.log("API:", res.data)

      // ✅ fix: always set array
      if (Array.isArray(res.data)) {
        setHazards(res.data)
      } else {
        setHazards([])
      }

    } catch (err) {
      console.log("Error:", err)
      setHazards([])
    }
  }

  useEffect(() => {
    loadHazards()
  }, [])

  // 🔹 Filter (simple)
  const filtered = hazards.filter((h) => {
    if (!search) return true

    return (
      h.text?.toLowerCase().includes(search.toLowerCase()) ||
      h.location?.name?.toLowerCase().includes(search.toLowerCase())
    )
  })

  return (
    <div className="flex">

      {/* Sidebar */}
      <SideBar setShowModal={setShowModal} />

      {/* Main Area */}
      <div className="flex-1 h-screen flex flex-col bg-gray-100">

        {/* Top Bar */}
        <div className="bg-white px-4 py-3 shadow">
          <SearchBar search={search} setSearch={setSearch} />
        </div>

        {/* Map */}
        <div className="flex-1 p-4">
          <div className="h-full rounded-lg overflow-hidden">

            <MapView hazards={filtered} />

          </div>
        </div>

      </div>

      {/* Modal */}
      <Modal
        open={showModal}
        onClose={() => setShowModal(false)}
      />

    </div>
  )
}