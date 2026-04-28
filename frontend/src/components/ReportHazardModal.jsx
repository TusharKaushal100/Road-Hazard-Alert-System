import { useState } from "react";
import axios from "axios";

const ReportHazardModal = ({ onClose, onPostCreated }) => {
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    setError("");
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await axios.post(
        "http://localhost:4000/api/v1/posts",
        { text: text.trim(), source: "user" },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      onPostCreated?.(res.data.post);
      setText("");
      onClose();
    } catch (err) {
      setError(err.response?.status === 401
        ? "Please login again to report a hazard."
        : "Failed to report. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="rounded-3xl w-full max-w-lg border shadow-xl"
      style={{ background: "var(--card)", borderColor: "var(--border)" }}
    >
      <div className="flex items-center justify-between px-6 py-5 border-b" style={{ borderColor: "var(--border)" }}>
        <div>
          <h2 className="text-xl font-semibold" style={{ color: "var(--text)" }}>Report Road Hazard</h2>
          <p className="text-sm mt-0.5" style={{ color: "var(--text2)" }}>
            Posting as @{localStorage.getItem("username") || "anonymous"}
          </p>
        </div>
        <button onClick={onClose} className="text-3xl leading-none" style={{ color: "var(--text2)" }}>×</button>
      </div>

      <form onSubmit={handleSubmit} className="p-6">
        <textarea
          rows="6"
          autoFocus
          className="w-full rounded-2xl p-4 text-base focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none border transition"
          style={{
            background: "var(--input)",
            borderColor: "var(--input-border)",
            color: "var(--text)",
          }}
          placeholder="Describe the hazard... e.g. Big pothole near GS Road, Guwahati"
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
        {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
        <div className="mt-5 flex gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-3 font-medium rounded-2xl border transition hover:opacity-80"
            style={{ borderColor: "var(--border)", color: "var(--text)", background: "var(--bg2)" }}
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading || !text.trim()}
            className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold rounded-2xl transition"
          >
            {loading ? "Posting..." : "Post Hazard"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ReportHazardModal;