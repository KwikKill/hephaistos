"use client"

import type React from "react"

import { useState } from "react"
import { useWebsiteStore } from "@/lib/store"
import { cn } from "@/lib/utils"
import { ChevronRight, ChevronDown } from "lucide-react"
import { ElementTypes } from "@/lib/types"

export default function ElementTree() {
  const { website, currentPageId, selectedElementId, setSelectedElementId } = useWebsiteStore()

  const currentPage = website.pages.find((page) => page.id === currentPageId)
  if (!currentPage) return null

  const rootElementId = currentPage.rootElementId

  return (
    <div className="p-3">
      <h3 className="text-sm font-medium mb-2">Element Tree</h3>
      <div className="text-xs">
        <ElementNode elementId={rootElementId} level={0} isExpanded={true} />
      </div>
    </div>
  )
}

interface ElementNodeProps {
  elementId: string
  level: number
  isExpanded?: boolean
}

function ElementNode({ elementId, level, isExpanded: defaultExpanded = false }: ElementNodeProps) {
  const { website, selectedElementId, setSelectedElementId } = useWebsiteStore()
  const [isExpanded, setIsExpanded] = useState(defaultExpanded)

  const element = website.elements[elementId]
  if (!element) return null

  const hasChildren = element.children.length > 0
  const isContainer = [ElementTypes.SECTION, ElementTypes.CONTAINER, ElementTypes.FLEX, ElementTypes.GRID].includes(
    element.type,
  )

  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation()
    setIsExpanded(!isExpanded)
  }

  const handleSelect = () => {
    setSelectedElementId(element.id)
  }

  return (
    <div>
      <div
        className={cn(
          "flex items-center py-1 px-1 rounded cursor-pointer hover:bg-muted/50",
          selectedElementId === element.id && "bg-muted text-primary",
        )}
        style={{ paddingLeft: `${level * 12}px` }}
        onClick={handleSelect}
      >
        {hasChildren ? (
          <button onClick={handleToggle} className="mr-1 p-0.5">
            {isExpanded ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
          </button>
        ) : (
          <span className="w-4 h-4 mr-1"></span>
        )}

        <span className="truncate">
          {element.name || element.type}
          {element.type === ElementTypes.TEXT && element.content
            ? `: ${element.content.substring(0, 15)}${element.content.length > 15 ? "..." : ""}`
            : ""}
        </span>
      </div>

      {isExpanded && hasChildren && (
        <div>
          {element.children.map((child) => (
            <ElementNode key={child} elementId={child} level={level + 1} />
          ))}
        </div>
      )}
    </div>
  )
}
