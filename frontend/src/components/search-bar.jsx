export const SearchBar = (props) => {

  const search = props.search
  const setSearch = props.setSearch

  return (
    <div className="flex items-center mb-4">

      <div className="relative w-96">

        {/* Search Icon */}
        <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
          <svg
            className="w-4 h-4 text-slate-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z"
            />
          </svg>
        </div>

        {/* Input */}
        <input
          className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-slate-200 bg-white shadow-sm text-slate-700 placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400"
          placeholder="Search hazard location..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        {/* Clear Button */}
        {search && (
          <button
            onClick={() => setSearch("")}
            className="absolute inset-y-0 right-3 flex items-center text-slate-400 hover:text-slate-600"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        )}

      </div>

    </div>
  )
}