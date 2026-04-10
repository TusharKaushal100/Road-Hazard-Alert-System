import { useState } from "react";
import axios from "axios";

const ReportHazardModal = ({ isOpen, onClose, onPostCreated }) => {
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!text.trim()) return;

    setLoading(true);
    try {
      const res = await axios.post("http://localhost:4000/api/v1/posts", {
        text: text.trim(),
        source: "user",
      });

      alert("✅ Hazard reported successfully!");
      onPostCreated?.(res.data.post); // optional: refresh map immediately
      setText("");
      onClose();
    } catch (err) {
      console.error(err);
      alert("❌ Failed to report hazard. Try again.");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl w-full max-w-lg mx-4 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <h2 className="text-xl font-semibold">Report Road Hazard</h2>
          <button
            onClick={onClose}
            className="text-3xl leading-none text-gray-400 hover:text-gray-600"
          >
            &times;
          </button>
        </div>

        {/* Body - Twitter style */}
        <form onSubmit={handleSubmit} className="p-6">
          <textarea
            rows="4"
            className="w-full border border-gray-300 rounded-xl p-4 text-lg focus:outline-none focus:border-blue-500 resize-none"
            placeholder="Describe the hazard... (e.g. Big pothole near GS Road, Guwahati)"
            value={text}
            onChange={(e) => setText(e.target.value)}
          />

          <div className="mt-6 flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 text-gray-700 font-medium border border-gray-300 rounded-xl hover:bg-gray-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !text.trim()}
              className="flex-1 py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? "Posting..." : "Post Hazard"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ReportHazardModal;