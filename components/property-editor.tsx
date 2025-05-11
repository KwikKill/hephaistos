"use client"

import { useState, useEffect } from "react"
import { useWebsiteStore } from "@/lib/store"
import { ElementTypes } from "@/lib/types"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ColorPicker } from "./color-picker"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "./ui/textarea"

export default function PropertyEditor() {
  const { website, selectedElementId, updateElement } = useWebsiteStore()
  const [activeTab, setActiveTab] = useState("style")

  const selectedElement = selectedElementId ? website.elements[selectedElementId] : null

  const [style, setStyle] = useState<Record<string, any>>({})
  const [layoutProps, setLayoutProps] = useState<Record<string, any>>({})

  useEffect(() => {
    if (selectedElement) {
      setStyle(selectedElement.style || {})
      setLayoutProps(selectedElement.layoutProps || {})
    }
  }, [selectedElement])

  if (!selectedElement) return null

  const updateStyle = (newStyle: Record<string, any>) => {
    const updatedStyle = { ...style, ...newStyle }
    setStyle(updatedStyle)

    updateElement(selectedElement.id, {
      style: updatedStyle,
    })
  }

  const updateLayoutProps = (newProps: Record<string, any>) => {
    const updatedProps = { ...layoutProps, ...newProps }
    setLayoutProps(updatedProps)

    updateElement(selectedElement.id, {
      layoutProps: updatedProps,
    })
  }

  const updateContent = (content: string) => {
    updateElement(selectedElement.id, {
      content,
    })
  }

  const updateName = (name: string) => {
    updateElement(selectedElement.id, {
      name,
    })
  }

  const updateHref = (href: string) => {
    updateElement(selectedElement.id, {
      href,
    })
  }

  const updateOnClick = (onClick: string) => {
    updateElement(selectedElement.id, {
      onClick,
    })
  }

  return (
    <div className="space-y-6">
      {/* Element name */}
      <div className="space-y-2">
        <Label htmlFor="elementName" className="text-xs">
          Element Name
        </Label>
        <Input
          id="elementName"
          value={selectedElement.name || ""}
          onChange={(e) => updateName(e.target.value)}
          placeholder={selectedElement.type}
        />
      </div>

      {/* Debugging
      <div className="text-xs text-muted-foreground">
        {JSON.stringify(style)}
        {JSON.stringify(layoutProps)}
        {JSON.stringify(selectedElement)}
      </div>*/}

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="style">Style</TabsTrigger>
          <TabsTrigger value="layout">Layout</TabsTrigger>
        </TabsList>

        <TabsContent value="style" className="space-y-4">
          {/* Background */}
          <div className="space-y-2">
            <h3 className="text-sm font-medium">Background</h3>
            <ColorPicker
              color={style.backgroundColor || "transparent"}
              onChange={(color) => updateStyle({ backgroundColor: color })}
            />
          </div>

          {/* Dimensions */}
          <div className="space-y-2">
            <h3 className="text-sm font-medium">Dimensions</h3>
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <Label htmlFor="width" className="text-xs">
                  Width
                </Label>
                <Input
                  id="width"
                  value={style.width || ""}
                  onChange={(e) => updateStyle({ width: e.target.value })}
                  placeholder="auto"
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="height" className="text-xs">
                  Height
                </Label>
                <Input
                  id="height"
                  value={style.height || ""}
                  onChange={(e) => updateStyle({ height: e.target.value })}
                  placeholder="auto"
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="min-width" className="text-xs">
                  Min Width
                </Label>
                <Input
                  id="min-width"
                  value={style.minWidth || ""}
                  onChange={(e) => updateStyle({ minwidth: e.target.value })}
                  placeholder="auto"
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="min-height" className="text-xs">
                  Min Height
                </Label>
                <Input
                  id="min-height"
                  value={style.minHeight || ""}
                  onChange={(e) => updateStyle({ minHeight: e.target.value })}
                  placeholder="auto"
                />
              </div>
            </div>
          </div>

          {/* Border */}
          <div className="space-y-2">
            <h3 className="text-sm font-medium">Border</h3>
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <Label htmlFor="borderWidth" className="text-xs">
                  Width
                </Label>
                <Input
                  id="borderWidth"
                  value={style.borderWidth || ""}
                  onChange={(e) => updateStyle({ borderWidth: e.target.value || "0px" })}
                  placeholder="0px"
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="borderRadius" className="text-xs">
                  Radius
                </Label>
                <Input
                  id="borderRadius"
                  value={style.borderRadius || ""}
                  onChange={(e) => updateStyle({ borderRadius: e.target.value })}
                  placeholder="0px"
                />
              </div>
            </div>
            <div className="space-y-1 mt-2">
              <Label htmlFor="borderColor" className="text-xs">
                Color
              </Label>
              <ColorPicker
                color={style.borderColor || "#000000"}
                onChange={(color) => updateStyle({ borderColor: color })}
              />
            </div>
            <div className="space-y-1 mt-2">
              <Label htmlFor="borderStyle" className="text-xs">
                Style
              </Label>
              <Select
                value={style.borderStyle || "solid"}
                onValueChange={(value) => updateStyle({ borderStyle: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Border style" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  <SelectItem value="solid">Solid</SelectItem>
                  <SelectItem value="dashed">Dashed</SelectItem>
                  <SelectItem value="dotted">Dotted</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Text Styling (only for text elements) */}
          {[
            ElementTypes.TEXT,
            ElementTypes.HEADING,
            ElementTypes.PARAGRAPH,
            ElementTypes.BUTTON,
            ElementTypes.LINK,
          ].includes(selectedElement.type) && (
            <div className="space-y-2">
              <h3 className="text-sm font-medium">Text</h3>
              <div className="space-y-1">
                <Label htmlFor="fontSize" className="text-xs">
                  Font Size
                </Label>
                <Input
                  id="fontSize"
                  value={style.fontSize || ""}
                  onChange={(e) => updateStyle({ fontSize: e.target.value })}
                  placeholder="16px"
                />
              </div>
              <div className="space-y-1 mt-2">
                <Label htmlFor="fontWeight" className="text-xs">
                  Font Weight
                </Label>
                <Select
                  value={style.fontWeight || "normal"}
                  onValueChange={(value) => updateStyle({ fontWeight: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Font weight" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="normal">Normal</SelectItem>
                    <SelectItem value="bold">Bold</SelectItem>
                    <SelectItem value="lighter">Lighter</SelectItem>
                    <SelectItem value="bolder">Bolder</SelectItem>
                    <SelectItem value="100">100</SelectItem>
                    <SelectItem value="200">200</SelectItem>
                    <SelectItem value="300">300</SelectItem>
                    <SelectItem value="400">400</SelectItem>
                    <SelectItem value="500">500</SelectItem>
                    <SelectItem value="600">600</SelectItem>
                    <SelectItem value="700">700</SelectItem>
                    <SelectItem value="800">800</SelectItem>
                    <SelectItem value="900">900</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1 mt-2">
                <Label htmlFor="textAlign" className="text-xs">
                  Text Align
                </Label>
                <Select value={style.textAlign || "left"} onValueChange={(value) => updateStyle({ textAlign: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Text align" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="left">Left</SelectItem>
                    <SelectItem value="center">Center</SelectItem>
                    <SelectItem value="right">Right</SelectItem>
                    <SelectItem value="justify">Justify</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1 mt-2">
                <Label htmlFor="color" className="text-xs">
                  Color
                </Label>
                <ColorPicker color={style.color || "#000000"} onChange={(color) => updateStyle({ color })} />
              </div>
            </div>
          )}

          {/* Image Object Fit Properties */}
          {selectedElement.type === ElementTypes.IMAGE && (
            <div className="space-y-2">
              <h3 className="text-sm font-medium">Image Properties</h3>
              <div className="space-y-1 mt-2">
                <Label htmlFor="objectFit" className="text-xs">
                  Object Fit
                </Label>
                <Select
                  value={layoutProps.objectFit || "cover"}
                  onValueChange={(value) => updateLayoutProps({ objectFit: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Object Fit" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="contain">Contain</SelectItem>
                    <SelectItem value="cover">Cover</SelectItem>
                    <SelectItem value="fill">Fill</SelectItem>
                    <SelectItem value="none">None</SelectItem>
                    <SelectItem value="scale-down">Scale Down</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
        </TabsContent>

        <TabsContent value="layout" className="space-y-4">
          {/* Padding & Margin */}
          <div className="space-y-2">
            <h3 className="text-sm font-medium">Spacing</h3>
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <Label htmlFor="padding" className="text-xs">
                  Padding
                </Label>
                <Input
                  id="padding"
                  value={layoutProps.padding || ""}
                  onChange={(e) => updateLayoutProps({ padding: e.target.value })}
                  placeholder="0px"
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="margin" className="text-xs">
                  Margin
                </Label>
                <Input
                  id="margin"
                  value={layoutProps.margin || ""}
                  onChange={(e) => updateLayoutProps({ margin: e.target.value })}
                  placeholder="0px"
                />
              </div>
            </div>
          </div>

          {/* Flex Container Properties */}
          {selectedElement.type === ElementTypes.FLEX && (
            <div className="space-y-2">
              <h3 className="text-sm font-medium">Flex Container</h3>
              <div className="space-y-1">
                <Label htmlFor="flexDirection" className="text-xs">
                  Direction
                </Label>
                <Select
                  value={layoutProps.flexDirection || "row"}
                  onValueChange={(value) => updateLayoutProps({ flexDirection: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Direction" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="row">Row</SelectItem>
                    <SelectItem value="column">Column</SelectItem>
                    <SelectItem value="row-reverse">Row Reverse</SelectItem>
                    <SelectItem value="column-reverse">Column Reverse</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1 mt-2">
                <Label htmlFor="justifyContent" className="text-xs">
                  Justify Content
                </Label>
                <Select
                  value={layoutProps.justifyContent || "flex-start"}
                  onValueChange={(value) => updateLayoutProps({ justifyContent: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Justify Content" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="flex-start">Start</SelectItem>
                    <SelectItem value="flex-end">End</SelectItem>
                    <SelectItem value="center">Center</SelectItem>
                    <SelectItem value="space-between">Space Between</SelectItem>
                    <SelectItem value="space-around">Space Around</SelectItem>
                    <SelectItem value="space-evenly">Space Evenly</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1 mt-2">
                <Label htmlFor="alignItems" className="text-xs">
                  Align Items
                </Label>
                <Select
                  value={layoutProps.alignItems || "stretch"}
                  onValueChange={(value) => updateLayoutProps({ alignItems: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Align Items" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="flex-start">Start</SelectItem>
                    <SelectItem value="flex-end">End</SelectItem>
                    <SelectItem value="center">Center</SelectItem>
                    <SelectItem value="stretch">Stretch</SelectItem>
                    <SelectItem value="baseline">Baseline</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1 mt-2">
                <Label htmlFor="flexWrap" className="text-xs">
                  Flex Wrap
                </Label>
                <Select
                  value={layoutProps.flexWrap || "nowrap"}
                  onValueChange={(value) => updateLayoutProps({ flexWrap: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Flex Wrap" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="nowrap">No Wrap</SelectItem>
                    <SelectItem value="wrap">Wrap</SelectItem>
                    <SelectItem value="wrap-reverse">Wrap Reverse</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1 mt-2">
                <Label htmlFor="gap" className="text-xs">
                  Gap
                </Label>
                <Input
                  id="gap"
                  value={layoutProps.gap || ""}
                  onChange={(e) => updateLayoutProps({ gap: e.target.value })}
                  placeholder="0px"
                />
              </div>
            </div>
          )}

          {/* Grid Container Properties */}
          {selectedElement.type === ElementTypes.GRID && (
            <div className="space-y-2">
              <h3 className="text-sm font-medium">Grid Container</h3>
              <div className="space-y-1">
                <Label htmlFor="gridTemplateColumns" className="text-xs">
                  Grid Template Columns
                </Label>
                <Input
                  id="gridTemplateColumns"
                  value={layoutProps.gridTemplateColumns || ""}
                  onChange={(e) => updateLayoutProps({ gridTemplateColumns: e.target.value })}
                  placeholder="repeat(3, 1fr)"
                />
              </div>
              <div className="space-y-1 mt-2">
                <Label htmlFor="gridTemplateRows" className="text-xs">
                  Grid Template Rows
                </Label>
                <Input
                  id="gridTemplateRows"
                  value={layoutProps.gridTemplateRows || ""}
                  onChange={(e) => updateLayoutProps({ gridTemplateRows: e.target.value })}
                  placeholder="auto"
                />
              </div>
              <div className="space-y-1 mt-2">
                <Label htmlFor="gridGap" className="text-xs">
                  Grid Gap
                </Label>
                <Input
                  id="gridGap"
                  value={layoutProps.gridGap || ""}
                  onChange={(e) => updateLayoutProps({ gridGap: e.target.value })}
                  placeholder="0px"
                />
              </div>
            </div>
          )}

        </TabsContent>
      </Tabs>

      {/* Content Tab */}
      {[
        ElementTypes.TEXT,
        ElementTypes.HEADING,
        ElementTypes.PARAGRAPH,
        ElementTypes.BUTTON,
        ElementTypes.LINK,
        ElementTypes.IMAGE,
      ].includes(selectedElement.type) && (
        <div className="space-y-2 mt-4 pt-4 border-t">
          <h3 className="text-sm font-medium">Content</h3>

          {selectedElement.type === ElementTypes.IMAGE ? (
            <div className="space-y-1">
              <Label htmlFor="imageUrl" className="text-xs">
                Image URL
              </Label>
              <Input
                id="imageUrl"
                value={selectedElement.content}
                onChange={(e) => updateContent(e.target.value)}
                placeholder="Enter image URL"
              />
              <p className="text-xs text-muted-foreground mt-1">Enter a URL or use a placeholder image</p>
            </div>
          ) : (
            <div className="space-y-1">
              <Label htmlFor="textContent" className="text-xs">
                Text Content
              </Label>
              <textarea
                id="textContent"
                className="w-full min-h-[100px] p-2 border rounded-md text-black"
                value={selectedElement.content}
                onChange={(e) => updateContent(e.target.value)}
              />
            </div>
          )}
        </div>
      )}

      {/* Link Properties */}
      {selectedElement.type === ElementTypes.LINK && (
        <div className="space-y-2">
          <div className="space-y-1">
            <Label htmlFor="href" className="text-xs">
              Href
            </Label>
            <Input
              id="href"
              value={selectedElement.href || ""}
              onChange={(e) => updateHref(e.target.value)}
              placeholder="https://example.com"
            />
          </div>
        </div>
      )}

      {/* Button click Properties */}
      {selectedElement.type === ElementTypes.BUTTON && (
        <div className="space-y-2">
          <div className="space-y-1">
            <Label htmlFor="onClick" className="text-xs">
              On Click
            </Label>
            <Textarea
              id="onClick"
              value={selectedElement.onClick || ""}
              onChange={(e) => updateOnClick(e.target.value)}
              placeholder="console.log('Button clicked')"
            />
          </div>
        </div>
      )}
    </div>
  )
}
