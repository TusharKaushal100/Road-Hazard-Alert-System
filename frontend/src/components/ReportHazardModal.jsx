// frontend/src/components/ReportHazardModal.jsx
// Same as before but now sends the auth token so the backend
// can attach the logged-in username to the post instead of "anonymous".

import { useState } from "react";
import axios from "axios";

const ReportHazardModal = ({ onClose, onPostCreated }) => {
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!text.trim()) return;

    setLoading(true);
    try {
      // Get the token that was saved during login
      const token = localStorage.getItem("token");

      const res = await axios.post(
        "http://localhost:4000/api/v1/posts",
        { text: text.trim(), source: "user" },
        {
          // Send token in header so backend knows who is posting
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      alert("Hazard reported successfully!");
      onPostCreated?.(res.data.post);
      setText("");
      onClose();
    } catch (err) {
      console.error(err);
      if (err.response?.status === 401) {
        alert("Please login again to report a hazard.");
      } else {
        alert("Failed to report. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-3xl w-full max-w-lg shadow-xl border border-gray-100">

      <div className="flex items-center justify-between px-6 py-5 border-b">
        <div>
          <h2 className="text-xl font-semibold text-gray-800">Report Road Hazard</h2>
          {/* Show who is posting */}
          <p className="text-sm text-gray-400 mt-0.5">
            Posting as @{localStorage.getItem("username") || "anonymous"}
          </p>
        </div>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-3xl leading-none">
          ×
        </button>
      </div>

      <form onSubmit={handleSubmit} className="p-6">
        <textarea
          rows="6"
          autoFocus
          className="w-full border border-gray-200 rounded-2xl p-4 text-base focus:outline-none focus:border-blue-400 resize-none"
          placeholder="Describe the hazard... e.g. Big pothole near GS Road, Guwahati"
          value={text}
          onChange={(e) => setText(e.target.value)}
        />

        <div className="mt-5 flex gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-3 text-gray-600 font-medium border border-gray-200 rounded-2xl hover:bg-gray-50 transition"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading || !text.trim()}
            className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white font-semibold rounded-2xl transition"
          >
            {loading ? "Posting..." : "Post Hazard"}
          </button>
        </div>
      </form>

    </div>
  );
};

export default ReportHazardModal;