"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { DndProvider } from "react-dnd"
import { HTML5Backend } from "react-dnd-html5-backend"
import { Toaster } from "@/components/ui/toaster"
import { useToast } from "@/hooks/use-toast"
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
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog"

export default function WebsiteBuilder() {
  const { toast } = useToast()
  const [isMenu, setIsMenu] = useState(true)
  const [isExiting, setIsExiting] = useState(false)
  const [activeTab, setActiveTab] = useState("components")
  const [isMounted, setIsMounted] = useState(false)
  const [exportModalOpen, setExportModalOpen] = useState(false)

  const { website, setWebsite, CreateDefaultWebsite, selectedElementId, isFromLocalStorage, saveToLocalStorage, loadFromLocalStorage, setSelectedElementId, setCurrentPageId } = useWebsiteStore()

  useEffect(() => {
    setIsMounted(true)
  }, [])

  const handleSave = () => {
    saveToLocalStorage()
    toast({
      title: "Saved",
      description: "Your website has been saved to local storage",
    })
  }

  const StartBulding = (WebsiteName: string) => {
    if (WebsiteName.trim() === "") {
      toast({
        title: "Error",
        description: "Please enter a website name",
        variant: "destructive",
      })
      return
    }

    CreateDefaultWebsite(WebsiteName)
    setIsMenu(false)
    toast({
      title: "Started Building",
      description: "You can now start building your website",
    })
  }

  const LoadWebsite = () => {
    loadFromLocalStorage()
    setIsMenu(false)
    toast({
      title: "Loaded",
      description: "Your website has been loaded from local storage",
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

        setIsMenu(false)
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

  if (isMenu) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center inset-0 z-50 p-4 dark">
        <div className="fixed inset-0 overflow-hidden bg-gradient-to-br from-black via-red-900 to-black">
          <div className="absolute inset-0 opacity-20">
            <div className="bggrid absolute left-0 top-0 grid size-full grid-cols-12 grid-rows-12 gap-4">
              {Array.from({ length: 144 }).map((_, i) => (
                <div key={i} className="rounded-md bg-white" />
              ))}
            </div>
          </div>
          <div className="absolute inset-0 bg-black/40" />
        </div>
        <div className="text-center relative bg-background/80 backdrop-blur-md rounded-lg px-8 pt-8 shadow-lg z-10 flex flex-col items-center gap-2">
          <h1 className="text-2xl font-bold">Welcome to Hephaistos</h1>
          <p className="text-muted-foreground">Click the button below to start building your website.</p>
          <div
            className="flex items-center justify-center w-full gap-4"
          >
            <div
              className="flex-1 border-t border-muted/50"
            />
          </div>
          {isFromLocalStorage() && (
            <div
              className="flex flex-col items-center justify-center w-full gap-4"
            >
              <Button
                onClick={LoadWebsite}
              >
                Load from Local Storage
              </Button>
              <div
                className="flex items-center justify-center w-full gap-4"
              >
                <div
                  className="flex-1 border-t border-muted/50"
                />
                <p className="text-muted-foreground">Or</p>
                <div
                  className="flex-1 border-t border-muted/50"
                />
              </div>
            </div>
          )}
          <Button variant="outline" className="w-full" asChild>
            <label>
              <FileUp className="h-4 w-4 mr-2" />
              Import JSON
              <input type="file" accept=".json" className="hidden" onChange={handleImportJson} />
            </label>
          </Button>
          <div
            className="flex items-center justify-center w-full gap-4"
          >
            <div
              className="flex-1 border-t border-muted/50"
            />
            <p className="text-muted-foreground">Or</p>
            <div
              className="flex-1 border-t border-muted/50"
            />
          </div>
          <div className="flex items-center justify-center w-full gap-4">
            <Input
              placeholder="Enter your website name"
              className="w-full"
              onChange={(e) => setWebsite({ ...website, name: e.target.value })}
            />
            <Button
              onClick={() => StartBulding(website.name)}
            >
              Start Building
            </Button>
          </div>
          <div>
            <p className="text-muted-foreground mt-8 mb-2">Hephaistos - KwikKill</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="flex h-screen w-screen overflow-hidden bg-background">
        {/* Left Sidebar */}
        <div className="w-64 border-r bg-muted/40 flex flex-col h-full overflow-scroll">
          <div
            onClick={() => setIsExiting(true)}
            className="p-4 border-b text-center cursor-pointer hover:bg-muted/50 transition-colors duration-200 ease-in-out"
          >
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

      {/* Confirmation Exit Modal */}
      <Dialog open={isExiting} onOpenChange={setIsExiting}>
        <DialogContent className="flex flex-col">
          <DialogHeader>
            <DialogTitle>Are you sure you want to exit ?</DialogTitle>
            <DialogDescription>Your changes will not be saved.</DialogDescription>
          </DialogHeader>

          <div className="flex justify-end items-center pt-4">
            <Button
              variant="destructive"
              onClick={() => {
                setIsExiting(false)
                setIsMenu(true)
                setSelectedElementId(null)
              }}
              className="mr-2"
            >
              Exit
            </Button>
            <DialogClose asChild>
              <Button variant="outline">
                Cancel
              </Button>
            </DialogClose>
          </div>
        </DialogContent>
      </Dialog>

      <Toaster />
    </DndProvider>
  )
}
