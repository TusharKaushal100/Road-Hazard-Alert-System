export const SearchBar = ({ search, setSearch }) => {
  return (
    <div className="relative w-80">
      <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
        <svg className="w-4 h-4" style={{ color: "var(--text2)" }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
        </svg>
      </div>
      <input
        className="w-full pl-10 pr-10 py-2 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400 transition"
        style={{
          background: "var(--input)",
          borderColor: "var(--input-border)",
          color: "var(--text)",
        }}
        placeholder="Search hazard location..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />
      {search && (
        <button
          onClick={() => setSearch("")}
          className="absolute inset-y-0 right-3 flex items-center"
          style={{ color: "var(--text2)" }}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      )}
    </div>
  );
};