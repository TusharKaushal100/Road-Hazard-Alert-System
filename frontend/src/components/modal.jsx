import { useRef, useState } from "react"
import axios from "axios"
import { Input } from "./input"
import { Button } from "./button"
import { Cross } from "../icons/cross"
import { Plus } from "../icons/plus"

export const Modal = (props) => {

  const textRef = useRef(null)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async () => {
    const text = textRef.current.value

    if (!text || text.trim() === "") {
      alert("Please enter a description")
      return
    }

    try {
      setLoading(true)

      const response = await axios.post(
        "http://localhost:4000/api/v1/posts",
        { text }
      )

      console.log("Post created:", response.data)

      textRef.current.value = ""

      props.onClose()

    } catch (err) {
      console.log("Error:", err)
      alert("Failed to create post")
    } finally {
      setLoading(false)
    }
  }

  if (!props.open) return null

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50">

      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black opacity-40"
        onClick={props.onClose}
      ></div>

      {/* Modal */}
      <div className="relative bg-white w-96 p-6 rounded-lg shadow-lg">

        {/* Close */}
        <div className="flex justify-end">
          <Cross size="md" onClick={props.onClose} />
        </div>

        {/* Title */}
        <h2 className="text-lg font-semibold mb-4 text-center">
          Report Hazard
        </h2>

        {/* Input */}
        <Input
          ref={textRef}
          placeholder="Describe the hazard (e.g. flood near Mumbai)"
        />

        {/* Button */}
        <div className="mt-5">
          <Button
            variant="primary"
            size="md"
            text={loading ? "Submitting..." : "Submit"}
            startIcon={<Plus size="sm" />}
            className="w-full"
            onClick={!loading ? handleSubmit : null}
          />
        </div>

      </div>

    </div>
  )
}