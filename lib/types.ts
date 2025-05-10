export enum ElementTypes {
  SECTION = "SECTION",
  CONTAINER = "CONTAINER",
  FLEX = "FLEX",
  GRID = "GRID",
  TEXT = "TEXT",
  BUTTON = "BUTTON",
  IMAGE = "IMAGE",
  HEADING = "HEADING",
  PARAGRAPH = "PARAGRAPH",
  LINK = "LINK",
}

export interface Position {
  x: number
  y: number
}

export interface Size {
  width: string | number
  height: string | number
}

export interface WebsiteElement {
  id: string
  type: ElementTypes
  name?: string
  style: Record<string, any>
  content: string
  children: string[]
  parentId: string | null
  // Layout specific properties
  layoutProps?: {
    // Flex properties
    flexDirection?: "row" | "column" | "row-reverse" | "column-reverse"
    justifyContent?: "flex-start" | "flex-end" | "center" | "space-between" | "space-around" | "space-evenly"
    alignItems?: "flex-start" | "flex-end" | "center" | "stretch" | "baseline"
    flexWrap?: "nowrap" | "wrap" | "wrap-reverse"
    gap?: string

    // Grid properties
    gridTemplateColumns?: string
    gridTemplateRows?: string
    gridGap?: string
    gridColumn?: string
    gridRow?: string

    // Common layout properties
    padding?: string
    margin?: string
  }
  href?: string
  onClick?: string
}

export interface Page {
  id: string
  name: string
  rootElementId: string
}

export interface Website {
  name: string
  pages: Page[]
  elements: Record<string, WebsiteElement>
}
