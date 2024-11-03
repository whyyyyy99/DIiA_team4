"use client"

import { useCallback } from "react"
import { Textarea } from "@/components/ui/textarea"

export default function Component() {
  // Debounce the onChange handler to prevent excessive UI updates
  const handleChange = useCallback((event: React.ChangeEvent<HTMLTextAreaElement>) => {
    // Use requestAnimationFrame to batch updates
    requestAnimationFrame(() => {
      // Handle the textarea change here
      console.log(event.target.value)
    })
  }, [])

  return (
    <Textarea
      id="description"
      placeholder="Enter your description..."
      className="min-h-[100px]"
      onChange={handleChange}
    />
  )
}