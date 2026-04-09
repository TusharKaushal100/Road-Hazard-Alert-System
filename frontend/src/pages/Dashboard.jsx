import { SideBar } from "../components/sidebar"
import { MapView } from "../components/map-view"
import { SearchBar } from "../components/search-bar"

export const Dashboard = () => {

  return (
    <div className="flex">

      {/* Sidebar */}
      <SideBar />

      {/* Main Area */}
      <div className="flex-1 h-screen flex flex-col bg-gray-100">

        {/* Top Bar */}
         {/* Top Bar */}
        <div className="bg-white px-4 py-3 shadow">
          <SearchBar search={search} setSearch={setSearch} />
        </div>

        {/* Map */}
        <div className="flex-1 p-4">
          <div className="h-full rounded-lg overflow-hidden">
            <MapView />
          </div>
        </div>

      </div>

    </div>
  )
}