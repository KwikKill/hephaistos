import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import { ElementTypes, type WebsiteElement } from "./types"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Fix the ID generation to ensure unique IDs for all elements
export function generateId(): string {
  // Use a combination of random string and timestamp for uniqueness
  const randomPart = Math.random().toString(36).substring(2, 9)
  const timestampPart = Date.now().toString(36)
  return `el-${randomPart}-${timestampPart}`
}

export function getDefaultElement(type: ElementTypes, parentId: string | null = null): WebsiteElement {
  const baseElement: WebsiteElement = {
    id: generateId(),
    type,
    style: {},
    content: "",
    children: [],
    parentId,
  }

  switch (type) {
    case ElementTypes.SECTION:
      return {
        ...baseElement,
        name: "Section",
        style: {
          minHeight: "200px",
          backgroundColor: "#f9fafb",
          borderStyle: "dashed",
          borderWidth: "1px",
          borderColor: "#e5e7eb",
        },
        layoutProps: {
          padding: "1rem",
        },
      }

    case ElementTypes.CONTAINER:
      return {
        ...baseElement,
        name: "Container",
        style: {
          maxWidth: "1200px",
          margin: "0 auto",
          minHeight: "100px",
          borderStyle: "dashed",
          borderWidth: "1px",
          borderColor: "#e5e7eb",
        },
        layoutProps: {
          padding: "1rem",
        },
      }

    case ElementTypes.FLEX:
      return {
        ...baseElement,
        name: "Flex Container",
        style: {
          display: "flex",
          minHeight: "100px",
          borderStyle: "dashed",
          borderWidth: "1px",
          borderColor: "#e5e7eb",
        },
        layoutProps: {
          flexDirection: "row",
          justifyContent: "flex-start",
          alignItems: "stretch",
          gap: "1rem",
          padding: "1rem",
        },
      }

    case ElementTypes.GRID:
      return {
        ...baseElement,
        name: "Grid Container",
        style: {
          display: "grid",
          minHeight: "100px",
          borderStyle: "dashed",
          borderWidth: "1px",
          borderColor: "#e5e7eb",
        },
        layoutProps: {
          gridTemplateColumns: "repeat(3, 1fr)",
          gridGap: "1rem",
          padding: "1rem",
        },
      }

    case ElementTypes.TEXT:
      return {
        ...baseElement,
        name: "Text",
        content: "Edit this text",
        style: {
          fontSize: "16px",
          color: "#374151",
        },
      }

    case ElementTypes.HEADING:
      return {
        ...baseElement,
        name: "Heading",
        content: "Heading",
        style: {
          fontSize: "24px",
          fontWeight: "bold",
          color: "#111827",
          marginBottom: "0.5rem",
        },
      }

    case ElementTypes.PARAGRAPH:
      return {
        ...baseElement,
        name: "Paragraph",
        content: "This is a paragraph of text. You can edit this to add your own content.",
        style: {
          fontSize: "16px",
          lineHeight: "1.5",
          color: "#374151",
          marginBottom: "1rem",
        },
      }

    case ElementTypes.BUTTON:
      return {
        ...baseElement,
        name: "Button",
        content: "Button",
        style: {
          backgroundColor: "#3b82f6",
          color: "#ffffff",
          borderRadius: "0.25rem",
          borderWidth: "1px",
          borderColor: "#000000",
          fontWeight: "500",
          cursor: "pointer",
          display: "inline-block",
        },
        onClick: "console.log('Button clicked!')",
        layoutProps: {
          padding: "0.5rem 1rem",
        },
      }

    case ElementTypes.IMAGE:
      return {
        ...baseElement,
        name: "Image",
        content: "/placeholder.svg?height=200&width=300",
        style: {
          width: "100%",
          maxWidth: "300px",
          height: "auto",
          objectFit: "cover",
        },
      }

    case ElementTypes.LINK:
      return {
        ...baseElement,
        name: "Link",
        content: "Click here",
        style: {
          color: "#3b82f6",
          textDecoration: "underline",
          cursor: "pointer",
        },
      }

    default:
      return baseElement
  }
}

// Add this helper function to convert camelCase to kebab-case
export function camelToKebabCase(str: string): string {
  return str.replace(/([a-z0-9])([A-Z])/g, "$1-$2").toLowerCase()
}

// Update the styleObjectToString function to use kebab-case for CSS properties
export function styleObjectToString(style: Record<string, any>): string {
  return Object.entries(style)
    .map(([key, value]) => `${camelToKebabCase(key)}: ${value};`)
    .join(" ")
}

export function layoutPropsToStyle(layoutProps: Record<string, any> = {}): Record<string, any> {
  const result: Record<string, any> = {}

  // Map layout props to CSS style properties
  Object.entries(layoutProps).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      // Handle specific mappings
      switch (key) {
        case "gridGap":
          result.gap = value
          break
        default:
          // Use the key as is for most properties
          result[key] = value
          break
      }
    }
  })

  return result
}
