"use client"

import { useState } from "react"
import { useWebsiteStore } from "@/lib/store"
import { Button } from "@/components/ui/button"
import { Eye, EyeOff } from "lucide-react"
import ElementTree from "@/components/element-tree"
import ElementRenderer from "./element-renderer"

export default function EditorCanvas() {
  const { website, currentPageId, setSelectedElementId } = useWebsiteStore()

  const currentPage = website.pages.find((page) => page.id === currentPageId)

  const handleCanvasClick = () => {
    setSelectedElementId(null)
  }

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
