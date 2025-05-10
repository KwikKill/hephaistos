"use client"

import type React from "react"

import { useDrag } from "react-dnd"
import { ElementTypes } from "@/lib/types"
import { getDefaultElement } from "@/lib/utils"
import { Card, CardContent } from "@/components/ui/card"
import {
  LayoutGrid,
  Type,
  ImageIcon,
  Square,
  MousePointer2,
  Heading1,
  AlignLeft,
  Link,
  LayoutIcon,
  BoxSelect,
} from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function ComponentLibrary() {
  return (
    <div className="space-y-4">
      <Tabs defaultValue="layout">
        <TabsList className="w-full">
          <TabsTrigger value="layout">Layout</TabsTrigger>
          <TabsTrigger value="content">Content</TabsTrigger>
        </TabsList>

        <TabsContent value="layout" className="pt-4 overflow-y-auto">
          <div className="grid grid-cols-2 gap-2">
            <DraggableComponent type={ElementTypes.SECTION} icon={<LayoutIcon />} label="Section" />
            <DraggableComponent type={ElementTypes.CONTAINER} icon={<Square />} label="Container" />
            <DraggableComponent type={ElementTypes.FLEX} icon={<BoxSelect />} label="Flex" />
            <DraggableComponent type={ElementTypes.GRID} icon={<LayoutGrid />} label="Grid" />
          </div>
        </TabsContent>

        <TabsContent value="content" className="pt-4 overflow-y-auto">
          <div className="grid grid-cols-2 gap-2">
            <DraggableComponent type={ElementTypes.HEADING} icon={<Heading1 />} label="Heading" />
            <DraggableComponent type={ElementTypes.PARAGRAPH} icon={<AlignLeft />} label="Paragraph" />
            <DraggableComponent type={ElementTypes.TEXT} icon={<Type />} label="Text" />
            <DraggableComponent type={ElementTypes.BUTTON} icon={<MousePointer2 />} label="Button" />
            <DraggableComponent type={ElementTypes.IMAGE} icon={<ImageIcon />} label="Image" />
            <DraggableComponent type={ElementTypes.LINK} icon={<Link />} label="Link" />
          </div>
        </TabsContent>
      </Tabs>

      <div className="mt-8">
        <h3 className="text-sm font-medium mb-2">How to use</h3>
        <ul className="text-xs text-muted-foreground space-y-2">
          <li>• Drag components onto the canvas</li>
          <li>• Nest elements inside containers</li>
          <li>• Use Flex and Grid for layouts</li>
          <li>• Click to select an element</li>
          <li>• Double-click text to edit</li>
        </ul>
      </div>
    </div>
  )
}

interface DraggableComponentProps {
  type: ElementTypes
  icon: React.ReactNode
  label: string
}

function DraggableComponent({ type, icon, label }: DraggableComponentProps) {
  const [{ isDragging }, drag] = useDrag(() => ({
    type,
    item: {
      type,
      isNew: true,
      element: getDefaultElement(type),
    },
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
  }))

  return (
    <Card
      ref={drag as unknown as React.Ref<HTMLDivElement>}
      className="cursor-grab active:cursor-grabbing transition-opacity"
      style={{ opacity: isDragging ? 0.5 : 1 }}
    >
      <CardContent className="p-3 flex flex-col items-center justify-center gap-2">
        <div className="text-muted-foreground">{icon}</div>
        <span className="text-xs font-medium">{label}</span>
      </CardContent>
    </Card>
  )
}
