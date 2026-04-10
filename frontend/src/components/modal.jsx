import { useRef, useState } from "react"
import axios from "axios"
import { Input } from "./input"
import { Button } from "./button"
import { Cross } from "../icons/cross"
import { Plus } from "../icons/plus"

export const Modal = ({ open, onClose, onSuccess }) => {
  const textRef = useRef(null)
  const [loading, setLoading]   = useState(false)
  const [result,  setResult]    = useState(null)
  const [error,   setError]     = useState(null)

  const handleSubmit = async () => {
    const text = textRef.current?.value?.trim()
    if (!text) { alert("Please enter a description"); return }

    try {
      setLoading(true)
      setResult(null)
      setError(null)

      const res = await axios.post("/api/v1/posts", { text })
      setResult(res.data.post)

      if (textRef.current) textRef.current.value = ""
      if (onSuccess) onSuccess()

    } catch (err) {
      console.error(err)
      setError("Failed to submit. Make sure the backend is running.")
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    setResult(null)
    setError(null)
    onClose()
  }

  if (!open) return null

  const LABEL_ICONS = {
    pothole: "🕳️", flood: "🌊", accident: "💥",
    traffic: "🚗", road_damage: "🚧", animal: "🐘"
  }

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50">
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/40" onClick={handleClose} />

      {/* Card */}
      <div className="relative bg-white w-96 p-6 rounded-xl shadow-xl z-10">

        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-semibold text-gray-800">Report a Hazard</h2>
          <Cross size="md" onClick={handleClose} />
        </div>

        {/* Input */}
        <Input
          ref={textRef}
          placeholder="Describe the hazard (e.g. flood near Mumbai, accident on NH 48...)"
        />

        <p className="text-xs text-gray-400 mt-1.5 mb-4">
          Our ML model will classify it and plot it on the map.
        </p>

        {/* Result */}
        {result && (
          <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg text-sm">
            <p className="font-medium text-green-700">
              {LABEL_ICONS[result.label]} Classified as: <strong>{result.label}</strong>
            </p>
            <p className="text-green-600 text-xs mt-0.5">
              Confidence: {Math.round(result.confidence * 100)}% ·
              Location: {result.location?.name}
            </p>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-600">
            {error}
          </div>
        )}

        {/* Submit */}
        <Button
          variant="primary"
          size="md"
          text={loading ? "Analyzing..." : "Submit Report"}
          startIcon={<Plus size="sm" />}
          className="w-full"
          onClick={!loading ? handleSubmit : undefined}
        />

      </div>
    </div>
  )
}
