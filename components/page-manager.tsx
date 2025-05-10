"use client"

import { useState } from "react"
import { useWebsiteStore } from "@/lib/store"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Plus, Trash2, Edit, Check, X } from "lucide-react"
import { cn } from "@/lib/utils"

export default function PageManager() {
  const { website, currentPageId, setCurrentPageId, addPage, updatePage, deletePage } = useWebsiteStore()

  const [newPageName, setNewPageName] = useState("")
  const [editingPageId, setEditingPageId] = useState<string | null>(null)
  const [editingPageName, setEditingPageName] = useState("")

  const handleAddPage = () => {
    if (newPageName.trim()) {
      addPage(newPageName)
      setNewPageName("")
    }
  }

  const startEditingPage = (pageId: string, pageName: string) => {
    setEditingPageId(pageId)
    setEditingPageName(pageName)
  }

  const savePageEdit = () => {
    if (editingPageId && editingPageName.trim()) {
      updatePage(editingPageId, { name: editingPageName })
    }
    setEditingPageId(null)
  }

  const cancelPageEdit = () => {
    setEditingPageId(null)
  }

  const handleDeletePage = (pageId: string) => {
    if (website.pages.length <= 1) {
      return // Don't delete the last page
    }

    deletePage(pageId)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Input
          placeholder="New page name"
          value={newPageName}
          onChange={(e) => setNewPageName(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              handleAddPage()
            }
          }}
        />
        <Button size="sm" onClick={handleAddPage}>
          <Plus className="h-4 w-4" />
        </Button>
      </div>

      <div className="space-y-1">
        {website.pages.map((page) => (
          <div
            key={page.id}
            className={cn(
              "flex items-center justify-between p-2 rounded-md",
              currentPageId === page.id ? "bg-muted" : "hover:bg-muted/50",
            )}
          >
            {editingPageId === page.id ? (
              <div className="flex items-center gap-2 flex-1">
                <Input
                  value={editingPageName}
                  onChange={(e) => setEditingPageName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      savePageEdit()
                    } else if (e.key === "Escape") {
                      cancelPageEdit()
                    }
                  }}
                  autoFocus
                />
                <Button size="icon" variant="ghost" onClick={savePageEdit}>
                  <Check className="h-4 w-4" />
                </Button>
                <Button size="icon" variant="ghost" onClick={cancelPageEdit}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <>
                <button
                  className="flex-1 text-left px-2 py-1 rounded hover:bg-muted/80"
                  onClick={() => setCurrentPageId(page.id)}
                >
                  {page.name}
                </button>
                <div className="flex items-center gap-1">
                  <Button size="icon" variant="ghost" onClick={() => startEditingPage(page.id, page.name)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => handleDeletePage(page.id)}
                    disabled={website.pages.length <= 1}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </>
            )}
          </div>
        ))}
      </div>

      {website.pages.length === 0 && (
        <div className="text-center p-4 text-muted-foreground">No pages yet. Create your first page above.</div>
      )}
    </div>
  )
}
