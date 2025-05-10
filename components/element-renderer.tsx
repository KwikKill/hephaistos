"use client"

import type React from "react"

import { useState, useRef } from "react"
import { useDrop } from "react-dnd"
import { useWebsiteStore } from "@/lib/store"
import { ElementTypes } from "@/lib/types"
import { cn, layoutPropsToStyle } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import Image from "next/image"
import { Trash2, Copy, Plus, Move } from "lucide-react"
import { useDrag } from "react-dnd"

interface ElementRendererProps {
  elementId: string
  isPreview: boolean
}

export default function ElementRenderer({ elementId, isPreview }: ElementRendererProps) {
  const {
    website,
    selectedElementId,
    hoveredElementId,
    setSelectedElementId,
    setHoveredElementId,
    updateElement,
    deleteElement,
    duplicateElement,
    addElement,
    moveElement,
  } = useWebsiteStore()

  const element = website.elements[elementId]
  const isSelected = selectedElementId === elementId
  const isHovered = hoveredElementId === elementId

  const [isEditing, setIsEditing] = useState(false)
  const [editContent, setEditContent] = useState(element?.content || "")
  const textRef = useRef<HTMLDivElement>(null)

  // If element doesn't exist, render nothing
  if (!element) return null

  // Combine regular style with layout props
  const combinedStyle = {
    ...element.style,
    ...layoutPropsToStyle(element.layoutProps),
  }

  // Set up drag for moving elements
  const canDrag = !isPreview && !isEditing
  const [{ isDragging }, drag, dragPreview] = useDrag(
    () => ({
      type: element.type,
      item: {
        id: element.id,
        type: element.type,
        isNew: false,
      },
      collect: (monitor) => ({
        isDragging: !!monitor.isDragging(),
      }),
      canDrag: canDrag,
    }),
    [element.id, element.type, isPreview, isEditing, canDrag],
  )

  // Fix the drop handling to properly handle nested elements
  // Set up drop for receiving elements
  const [{ isOver, canDrop }, drop] = useDrop(
    () => ({
      accept: Object.values(ElementTypes),
      drop: (item: { id?: string; type: ElementTypes; isNew: boolean; element?: any }, monitor) => {
        if (monitor.didDrop()) {
          return // Don't handle if a child already handled it
        }

        if (item.isNew) {
          // Add new element as a child
          addElement(item.element, element.id)
        } else if (item.id && item.id !== element.id) {
          // Prevent dropping an element into itself or its descendants
          let isDescendant = false
          const checkDescendant = (parentId: string) => {
            if (parentId === item.id) {
              isDescendant = true
              return
            }
            const parent = website.elements[parentId]
            if (parent && parent.children) {
              parent.children.forEach((child) => {
                checkDescendant(child)
              })
            }
          }

          checkDescendant(element.id)

          if (!isDescendant) {
            // Move existing element to this container
            moveElement(item.id, element.id)
          }
        }
      },
      collect: (monitor) => ({
        isOver: !!monitor.isOver({ shallow: true }),
        canDrop: !!monitor.canDrop(),
      }),
      // Only allow dropping into container elements
      canDrop: () =>
        [ElementTypes.SECTION, ElementTypes.CONTAINER, ElementTypes.FLEX, ElementTypes.GRID].includes(element.type),
    }),
    [element.id, element.type, website.elements],
  )

  const handleSelect = (e: React.MouseEvent) => {
    if (isPreview) return
    e.stopPropagation()
    setSelectedElementId(element.id)
  }

  const handleDoubleClick = (e: React.MouseEvent) => {
    if (
      isPreview ||
      ![
        ElementTypes.TEXT,
        ElementTypes.HEADING,
        ElementTypes.PARAGRAPH,
        ElementTypes.BUTTON,
        ElementTypes.LINK,
      ].includes(element.type)
    )
      return
    e.stopPropagation()
    setIsEditing(true)
  }

  const handleBlur = () => {
    setIsEditing(false)
    updateElement(element.id, {
      content: editContent,
    })
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      setIsEditing(false)
      updateElement(element.id, {
        content: editContent,
      })
    }
    if (e.key === "Escape") {
      setIsEditing(false)
      setEditContent(element.content || "")
    }
  }

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation()
    deleteElement(element.id)
  }

  const handleDuplicate = (e: React.MouseEvent) => {
    e.stopPropagation()
    duplicateElement(element.id)
  }

  // Render the element content based on its type
  const renderElementContent = () => {
    switch (element.type) {
      case ElementTypes.TEXT:
      case ElementTypes.HEADING:
      case ElementTypes.PARAGRAPH:
        return isEditing ? (
          <input
            className="w-full h-full outline-none bg-transparent text-center"
            value={editContent}
            onChange={(e) => setEditContent(e.target.value)}
            onBlur={handleBlur}
            onKeyDown={handleKeyDown}
          />
        ) : (
          <div dangerouslySetInnerHTML={{ __html: element.content }} />
        )

      case ElementTypes.BUTTON:
        return isEditing ? (
          <input
            className="w-full h-full outline-none bg-transparent text-center"
            value={editContent}
            onChange={(e) => setEditContent(e.target.value)}
            onBlur={handleBlur}
            onKeyDown={handleKeyDown}
          />
        ) : (
          <button
            className="pointer-events-none"
          >
              {element.content}
          </button>
        )

      case ElementTypes.LINK:
        return isEditing ? (
          <input
            className="w-full h-full outline-none bg-transparent"
            value={editContent}
            onChange={(e) => setEditContent(e.target.value)}
            onBlur={handleBlur}
            onKeyDown={handleKeyDown}
          />
        ) : (
          <a href="#" onClick={(e) => e.preventDefault()}>
            {element.content}
          </a>
        )

      case ElementTypes.IMAGE:
        return (
          <div className="relative w-full h-full">
            <Image src={element.content || "/placeholder.svg"} alt="Element image" fill className="object-cover" />
          </div>
        )

      default:
        return null
    }
  }

  // In preview mode, render elements differently
  if (isPreview) {
    // For container elements in preview mode
    if ([ElementTypes.SECTION, ElementTypes.CONTAINER, ElementTypes.FLEX, ElementTypes.GRID].includes(element.type)) {
      return (
        <div style={combinedStyle} className="element">
          {element.children.map((childRef) => (
            <ElementRenderer key={childRef} elementId={childRef} isPreview={isPreview} />
          ))}
        </div>
      )
    }

    // For non-container elements in preview mode
    return (
      <div style={combinedStyle} className={cn("element", element.type === ElementTypes.TEXT && "break-words")}>
        {renderElementContent()}
      </div>
    )
  }

  // In edit mode, handle containers differently to maintain proper nesting
  const containerTypes = [ElementTypes.SECTION, ElementTypes.CONTAINER, ElementTypes.FLEX, ElementTypes.GRID]
  const isContainer = containerTypes.includes(element.type)

  return (
    <div
      ref={(node) => {
        drag(drop(node))
      }}
      style={{
        ...combinedStyle,
        opacity: isDragging ? 0.5 : 1,
      }}
      className={cn(
        "element relative",
        isSelected && "outline outline-2 outline-primary",
        isHovered && !isSelected && "outline outline-1 outline-primary/50",
        element.type === ElementTypes.TEXT && "break-words",
      )}
      onClick={handleSelect}
      onDoubleClick={handleDoubleClick}
      onMouseEnter={() => setHoveredElementId(element.id)}
      onMouseLeave={() => setHoveredElementId(null)}
    >
      {/* Element controls */}
      {isSelected && (
        <div className="absolute -top-7 left-0 right-0 h-7 bg-primary text-white text-xs flex items-center justify-between px-2 z-10">
          <div className="flex items-center gap-1">
            <Move className="h-3 w-3 cursor-move" />
            <span>{element.name || element.type}</span>
          </div>
          <div className="flex items-center gap-1">
            <button onClick={handleDuplicate} className="p-1 hover:bg-primary-foreground/20 rounded" title="Duplicate">
              <Copy className="h-3 w-3" />
            </button>
            <button onClick={handleDelete} className="p-1 hover:bg-primary-foreground/20 rounded" title="Delete">
              <Trash2 className="h-3 w-3" />
            </button>
          </div>
        </div>
      )}

      {/* Render children directly inside the container */}
      {isContainer &&
        element.children.map((childRef) => (
          <ElementRenderer key={childRef} elementId={childRef} isPreview={isPreview} />
        ))}

      {/* Empty state message */}
      {isContainer && element.children.length === 0 && (
        <div className="w-full h-full min-h-[50px] flex items-center justify-center text-muted-foreground text-sm">
          Drag components here
        </div>
      )}

      {/* Add button for empty containers when selected */}
      {isSelected && isContainer && element.children.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center">
          <Button
            variant="outline"
            size="sm"
            className="bg-background/80"
            onClick={(e) => {
              e.stopPropagation()
              // Open component library
            }}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Component
          </Button>
        </div>
      )}

      {/* Element content */}
      {!isContainer && renderElementContent()}
    </div>
  )
}
