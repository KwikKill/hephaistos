"use client"

import { useEffect, useState } from "react"
import { useWebsiteStore } from "@/lib/store"
import { Button } from "@/components/ui/button"
import { Pencil } from "lucide-react"
import ElementTree from "@/components/element-tree"
import ElementRenderer from "./element-renderer"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ColorPicker } from "@/components/color-picker"

export default function EditorCanvas() {
  const { website, currentPageId, deleteSelectedElement, setSelectedElementId, deleteElement, setWebsite } = useWebsiteStore()

  const [isEditMode, setIsEditMode] = useState(false)
  const [websiteCopy, setWebsiteCopy] = useState({ ...website });


  const currentPage = website.pages.find((page) => page.id === currentPageId)

  const handleCanvasClick = () => {
    setSelectedElementId(null)
  }

  useEffect(() => {
    setWebsiteCopy({ ...website });
  }, [website]);

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

  const handleInputChange = (field: string, value: string) => {
    setWebsiteCopy((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleMetadataChange = (field: string, value: string) => {
    setWebsiteCopy((prev) => ({
      ...prev,
      metadata: {
        ...prev.metadata,
        [field]: value,
      },
    }));
  };

  const saveChanges = () => {
    setWebsite(websiteCopy);
    setIsEditMode(false);
  };

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
        <div className="flex items-center justify-between w-full ml-2">
          <h2 className="font-medium">{website.name} - {currentPage.name}</h2>
          <Button
            variant="default"
            onClick={() => {
              setIsEditMode(true)
            }}
          >
            <Pencil className="h-4 w-4 mr-2" />
            Edit Website
          </Button>
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

      {/* Edit Website Modal */}
      <Dialog open={isEditMode} onOpenChange={(open) => {setIsEditMode(open)}}>
        <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle>Edit Website</DialogTitle>
            <DialogDescription>Modify the website settings and metadatas.</DialogDescription>
          </DialogHeader>

          <div
            className="flex flex-col flex-1 overflow-auto py-2 border-y"
          >
            <div>
              <Label htmlFor="website-name">Website Name</Label>
              <Input
                id="website-name"
                value={websiteCopy.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                className="mt-2"
                placeholder="Enter website name"
              />
            </div>
            <div>
              <Label htmlFor="website-description">Website Description</Label>
              <Input
                id="website-description"
                value={websiteCopy.metadata.description}
                onChange={(e) => handleMetadataChange("description", e.target.value)}
                className="mt-2"
                placeholder="Enter website description"
              />
            </div>
            <div>
              <Label htmlFor="website-favicon">Favicon URL</Label>
              <Input
                id="website-favicon"
                value={websiteCopy.metadata.favicon}
                onChange={(e) => handleMetadataChange("favicon", e.target.value)}
                className="mt-2"
                placeholder="Enter favicon URL - Leave empty for no favicon"
              />
            </div>
            <div>
              <Label>Theme Color</Label>
              <ColorPicker
                color={websiteCopy.metadata.NavigationThemeColor}
                onChange={(color) => {
                  handleMetadataChange("NavigationThemeColor", color)
                }}
              />
            </div>
            <div>
              <Label htmlFor="website-text-color">Text Color</Label>
              <ColorPicker
                color={websiteCopy.metadata.NavigationTextColor}
                onChange={(color) => {
                  handleMetadataChange("NavigationTextColor", color)
                }}
              />
            </div>
          </div>

          <div className="flex justify-center items-center pt-4 gap-2">
            <Button variant="default" onClick={saveChanges}>
              <Pencil className="h-4 w-4 mr-2" />
              Edit Website
            </Button>
            <DialogClose asChild>
              <Button variant="outline">
                Close
              </Button>
            </DialogClose>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
