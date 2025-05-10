"use client"

import { useEffect, useState } from "react"
import { useWebsiteStore } from "@/lib/store"
import { Button } from "@/components/ui/button"
import { Eye, EyeOff } from "lucide-react"
import ElementTree from "@/components/element-tree"
import ElementRenderer from "./element-renderer"

export default function EditorCanvas() {
  const { website, currentPageId, deleteSelectedElement, setSelectedElementId, deleteElement } = useWebsiteStore()

  const currentPage = website.pages.find((page) => page.id === currentPageId)

  const handleCanvasClick = () => {
    setSelectedElementId(null)
  }

  // Add global keydown event listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // If the target is an input or textarea, do not handle the keydown event
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return
      }
      if (e.key === "Escape") {
        e.preventDefault()
        setSelectedElementId(null)
      }
      // supr key to delete selected element
      if (e.key === "Delete" || e.key === "Backspace") {
        console.log("delete")
        deleteSelectedElement()
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => {
      window.removeEventListener("keydown", handleKeyDown)
    }
  }, [setSelectedElementId])

  if (!currentPage) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center p-6 max-w-md">
          <h2 className="text-2xl font-bold mb-4">No Page Selected</h2>
          <p className="text-muted-foreground mb-6">
            Create a new page or select an existing one from the Pages tab to start building.
          </p>
        </div>
      </div>
    )
  }

  const rootElementId = currentPage.rootElementId
  const rootElement = website.elements[rootElementId]

  if (!rootElement) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center p-6 max-w-md">
          <h2 className="text-2xl font-bold mb-4">Page Structure Error</h2>
          <p className="text-muted-foreground mb-6">The root element for this page could not be found.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col">
      <div className="p-2 border-b flex justify-between items-center bg-background">
        <div>
          <h2 className="font-medium">{website.name} - {currentPage.name}</h2>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Element Tree (only in edit mode) */}
        <div className="w-64 border-r bg-muted/20 overflow-y-auto">
          <ElementTree />
        </div>

        {/* Canvas */}
        <div className="flex-1 overflow-auto" onClick={handleCanvasClick}>
          <ElementRenderer elementId={rootElementId} isPreview={false} />
        </div>
      </div>
    </div>
  )
}
