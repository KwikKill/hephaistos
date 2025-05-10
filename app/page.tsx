"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { DndProvider } from "react-dnd"
import { HTML5Backend } from "react-dnd-html5-backend"
import { Toaster } from "@/components/ui/toaster"
import { useToast } from "@/components/ui/use-toast"
import EditorCanvas from "@/components/editor-canvas"
import ComponentLibrary from "@/components/component-library"
import PropertyEditor from "@/components/property-editor"
import PageManager from "@/components/page-manager"
import ExportModal from "@/components/export-modal"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Save, FileUp, Download, Layers, Box, Code, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { useWebsiteStore } from "@/lib/store"

export default function WebsiteBuilder() {
  const { toast } = useToast()
  const [activeTab, setActiveTab] = useState("components")
  const [isMounted, setIsMounted] = useState(false)
  const [exportModalOpen, setExportModalOpen] = useState(false)

  const { website, setWebsite, selectedElementId, saveToLocalStorage, loadFromLocalStorage, setSelectedElementId, setCurrentPageId } = useWebsiteStore()

  useEffect(() => {
    setIsMounted(true)
    loadFromLocalStorage()
  }, [loadFromLocalStorage])

  const handleSave = () => {
    saveToLocalStorage()
    toast({
      title: "Saved",
      description: "Your website has been saved to local storage",
    })
  }

  const handleExportJson = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(website))
    const downloadAnchorNode = document.createElement("a")
    downloadAnchorNode.setAttribute("href", dataStr)
    downloadAnchorNode.setAttribute("download", "website.json")
    document.body.appendChild(downloadAnchorNode)
    downloadAnchorNode.click()
    downloadAnchorNode.remove()

    toast({
      title: "Exported",
      description: "Your website configuration has been exported as JSON",
    })
  }

  const handleImportJson = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target?.result as string)
        setWebsite(json)
        toast({
          title: "Imported",
          description: "Your website configuration has been imported",
        })
        // Load the first page
        const firstPage = json.pages[0].id
        setCurrentPageId(firstPage)
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to import website configuration",
          variant: "destructive",
        })
      }
    }
    reader.readAsText(file)
  }

  if (!isMounted) {
    return null // Prevent hydration errors
  }

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="flex h-screen w-screen overflow-hidden bg-background">
        {/* Left Sidebar */}
        <div className="w-64 border-r bg-muted/40 flex flex-col h-full overflow-scroll">
          <div className="p-4 border-b">
            <h1 className="text-xl font-bold">Hephaistos</h1>
            <p className="text-xs text-muted-foreground">Website Builder</p>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
            <TabsList className="grid grid-cols-2 mx-2 mt-2">
              <TabsTrigger value="components">
                <Box className="h-4 w-4 mr-2" />
                Components
              </TabsTrigger>
              <TabsTrigger value="pages">
                <Layers className="h-4 w-4 mr-2" />
                Pages
              </TabsTrigger>
            </TabsList>

            <TabsContent value="components" className="flex-1 overflow-y-auto p-2">
              <ComponentLibrary />
            </TabsContent>

            <TabsContent value="pages" className="flex-1 overflow-y-auto p-2">
              <PageManager />
            </TabsContent>
          </Tabs>

          <div className="p-4 border-t space-y-2">
            <Button onClick={handleSave} className="w-full">
              <Save className="h-4 w-4 mr-2" />
              Save in Browser
            </Button>
            <Button onClick={handleExportJson} variant="outline" className="w-full">
              <Download className="h-4 w-4 mr-2" />
              Export JSON
            </Button>
            <Button variant="outline" className="w-full" asChild>
              <label>
                <FileUp className="h-4 w-4 mr-2" />
                Import JSON
                <input type="file" accept=".json" className="hidden" onChange={handleImportJson} />
              </label>
            </Button>
            <Button onClick={() => setExportModalOpen(true)} variant="outline" className="w-full">
              <Code className="h-4 w-4 mr-2" />
              Export HTML
            </Button>
          </div>
        </div>

        {/* Main Canvas */}
        <div className="flex-1 overflow-auto bg-gray-100 dark:bg-gray-900">
          <EditorCanvas />
        </div>

        {/* Right Sidebar - Property Editor */}
        <div
          className={cn(
            "w-72 border-l bg-muted/40 transition-all duration-300 ease-in-out",
            !selectedElementId && "w-0 opacity-0",
          )}
        >
          {selectedElementId && (
            <div className="h-full flex flex-col">
              <div className="p-4 border-b">
                <h2 className="text-lg font-semibold">Properties</h2>
                {/* Close panel button */}
                <Button
                  variant="outline"
                  className="absolute top-4 right-4"
                  onClick={() => setSelectedElementId(null)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex-1 overflow-y-auto p-4">
                <PropertyEditor />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Export HTML Modal */}
      <ExportModal open={exportModalOpen} onOpenChange={setExportModalOpen} />

      <Toaster />
    </DndProvider>
  )
}
