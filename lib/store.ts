"use client"

import { create } from "zustand"
import { ElementTypes, type Website, type Page, type WebsiteElement } from "./types"
import { generateId } from "./utils"

interface WebsiteState {
  website: Website
  currentPageId: string | null
  selectedElementId: string | null
  hoveredElementId: string | null
  clipboard: WebsiteElement | null

  // Actions
  setWebsite: (website: Website) => void
  setCurrentPageId: (pageId: string) => void
  setSelectedElementId: (elementId: string | null) => void
  setHoveredElementId: (elementId: string | null) => void

  deleteSelectedElement: () => void

  CreateDefaultWebsite: (name?: string) => void

  addPage: (name: string) => void
  updatePage: (pageId: string, updates: Partial<Page>) => void
  deletePage: (pageId: string) => void

  addElement: (element: WebsiteElement, parentId?: string | null) => void
  updateElement: (elementId: string, updates: Partial<WebsiteElement>) => void
  deleteElement: (elementId: string) => void
  moveElement: (elementId: string, newParentId: string | null, index?: number) => void
  duplicateElement: (elementId: string) => void

  copyElement: (elementId: string) => void
  pasteElement: (parentId: string | null) => void

  saveToLocalStorage: () => void
  loadFromLocalStorage: () => void
  isFromLocalStorage: () => boolean
}

// Create a default root element for a new page
const createRootElement = (): WebsiteElement => ({
  id: generateId(),
  type: ElementTypes.SECTION,
  name: "Page Root",
  style: {
    minHeight: "100vh",
    backgroundColor: "#ffffff",
  },
  content: "",
  children: [],
  parentId: null,
  layoutProps: {
    padding: "1rem",
  },
})

// Create a default page with a root element
const createDefaultPage = (): { page: Page; rootElement: WebsiteElement } => {
  const rootElement = createRootElement()

  return {
    page: {
      id: generateId(),
      name: "Home",
      rootElementId: rootElement.id,
    },
    rootElement,
  }
}

// Create the default website structure
const createDefaultWebsite = (name?: string): Website => {
  const { page, rootElement } = createDefaultPage()

  return {
    name: name || "My Website",
    pages: [page],
    elements: {
      [rootElement.id]: rootElement,
    },
    metadata: {
      description: "Website created with Hephaistos",
      favicon: "",
      NavigationThemeColor: "#ffffff",
      NavigationTextColor: "#000000",
    },
  }
}

const DEFAULT_WEBSITE = createDefaultWebsite()

export const useWebsiteStore = create<WebsiteState>((set, get) => ({
  website: DEFAULT_WEBSITE,
  currentPageId: DEFAULT_WEBSITE.pages[0].id,
  selectedElementId: null,
  hoveredElementId: null,
  clipboard: null,

  setWebsite: (website) => {
    // In setWebsite, for each elements, is they have the style "border", decompose it into borderWidth, BorderColor and BorderRadius.
    for (const element of Object.values(website.elements)) {
      if (element.style.border) {
        const border = element.style.border.split(" ")
        if (border.length === 3) {
          element.style.borderWidth = border[0]
          element.style.borderColor = border[2]
          element.style.borderRadius = border[1]
        }
      }
    }
    // Set the website state
    set({ website })
  },

  CreateDefaultWebsite: (name?: string) => {
    const { page, rootElement } = createDefaultPage()

    set({
      website: {
        name: name || "My Website",
        pages: [page],
        elements: {
          [rootElement.id]: rootElement,
        },
        metadata: {
          description: "Website created with Hephaistos",
          favicon: "",
          NavigationThemeColor: "#ffffff",
          NavigationTextColor: "#000000",
        },
      },
      currentPageId: page.id,
      selectedElementId: null,
    })
  },

  setCurrentPageId: (pageId) => set({ currentPageId: pageId, selectedElementId: null }),

  setSelectedElementId: (elementId) => set({ selectedElementId: elementId }),

  deleteSelectedElement: () => {
    const { selectedElementId } = get()
    if (selectedElementId) {
      get().deleteElement(selectedElementId)
    }
  },

  setHoveredElementId: (elementId) => set({ hoveredElementId: elementId }),

  addPage: (name) => {
    const { page, rootElement } = createDefaultPage()
    page.name = name

    set((state) => ({
      website: {
        ...state.website,
        pages: [...state.website.pages, page],
        elements: {
          ...state.website.elements,
          [rootElement.id]: rootElement,
        },
      },
      currentPageId: page.id,
    }))
  },

  updatePage: (pageId, updates) => {
    set((state) => ({
      website: {
        ...state.website,
        pages: state.website.pages.map((page) => (page.id === pageId ? { ...page, ...updates } : page)),
      },
    }))
  },

  deletePage: (pageId) => {
    const { website } = get()

    // Don't delete if it's the last page
    if (website.pages.length <= 1) return

    // Find the page to delete
    const pageToDelete = website.pages.find((p) => p.id === pageId)
    if (!pageToDelete) return

    // Get all element IDs to delete (recursive)
    const elementIdsToDelete = new Set<string>()

    const collectElementIds = (elementId: string) => {
      elementIdsToDelete.add(elementId)
      const element = website.elements[elementId]
      if (element && element.children) {
        element.children.forEach((child) => collectElementIds(child))
      }
    }

    collectElementIds(pageToDelete.rootElementId)

    // Create new elements object without the deleted elements
    const newElements = { ...website.elements }
    elementIdsToDelete.forEach((id) => {
      delete newElements[id]
    })

    // Remove the page and update state
    const newPages = website.pages.filter((p) => p.id !== pageId)
    const newCurrentPageId = pageId === get().currentPageId ? newPages[0]?.id || null : get().currentPageId

    set({
      website: {
        ...website,
        pages: newPages,
        elements: newElements,
      },
      currentPageId: newCurrentPageId,
      selectedElementId: null,
    })
  },

  addElement: (element, parentId = null) => {
    const { website, currentPageId } = get()
    if (!currentPageId) return

    const currentPage = website.pages.find((p) => p.id === currentPageId)
    if (!currentPage) return

    // If no parent specified, use the page root
    const actualParentId = parentId || currentPage.rootElementId

    // Create a copy of the element with a new ID and set parent
    const newElement = {
      ...element,
      id: generateId(), // Always generate a new ID
      parentId: actualParentId,
    }

    // Update the parent's children
    const updatedElements = { ...website.elements }

    // Add the new element to the elements record
    updatedElements[newElement.id] = newElement

    // Update the parent to include this child
    if (actualParentId && updatedElements[actualParentId]) {
      updatedElements[actualParentId] = {
        ...updatedElements[actualParentId],
        children: [...updatedElements[actualParentId].children, newElement.id],
      }
    }

    set({
      website: {
        ...website,
        elements: updatedElements,
      },
      selectedElementId: newElement.id,
    })

    return newElement.id
  },

  updateElement: (elementId, updates) => {
    const { website } = get()

    if (!website.elements[elementId]) return

    const updatedElement = {
      ...website.elements[elementId],
      ...updates,
    }

    set({
      website: {
        ...website,
        elements: {
          ...website.elements,
          [elementId]: updatedElement,
        },
      },
    })
  },

  deleteElement: (elementId) => {
    const { website, selectedElementId } = get()

    // Don't delete the root element of a page
    const isRoot = website.pages.some((page) => page.rootElementId === elementId)
    if (isRoot) return

    const elementToDelete = website.elements[elementId]
    if (!elementToDelete) return

    // Get all child element IDs to delete (recursive)
    const elementIdsToDelete = new Set<string>()

    const collectElementIds = (elementId: string) => {
      elementIdsToDelete.add(elementId)
      const element = website.elements[elementId]
      if (element && element.children) {
        element.children.forEach((child) => collectElementIds(child))
      }
    }

    collectElementIds(elementToDelete.id)

    // Create new elements object without the deleted elements
    const newElements = { ...website.elements }
    elementIdsToDelete.forEach((id) => {
      delete newElements[id]
    })

    // Remove the element from its parent's children array
    if (elementToDelete.parentId && newElements[elementToDelete.parentId]) {
      newElements[elementToDelete.parentId] = {
        ...newElements[elementToDelete.parentId],
        children: newElements[elementToDelete.parentId].children.filter((child) => child !== elementId),
      }
    }

    set({
      website: {
        ...website,
        elements: newElements,
      },
      selectedElementId: selectedElementId === elementId ? null : selectedElementId,
    })
  },

  moveElement: (elementId, newParentId, index) => {
    const { website } = get()

    const elementToMove = website.elements[elementId]
    if (!elementToMove) return

    // Don't move a page root element
    const isRoot = website.pages.some((page) => page.rootElementId === elementId)
    if (isRoot) return

    // Don't allow moving an element into itself or its descendants
    if (newParentId === elementId) return

    // Check if new parent is a descendant of the element
    let isDescendant = false
    const checkDescendant = (parentId: string) => {
      if (parentId === elementId) {
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

    if (newParentId) {
      checkDescendant(newParentId)
    }

    if (isDescendant) return

    // Remove from current parent
    const oldParentId = elementToMove.parentId
    const updatedElements = { ...website.elements }

    if (oldParentId && updatedElements[oldParentId]) {
      updatedElements[oldParentId] = {
        ...updatedElements[oldParentId],
        children: updatedElements[oldParentId].children.filter((child) => child !== elementId),
      }
    }

    // Update the element's parent reference
    updatedElements[elementId] = {
      ...updatedElements[elementId],
      parentId: newParentId,
    }

    // Add to new parent
    if (newParentId && updatedElements[newParentId]) {
      const newParentChildren = [...updatedElements[newParentId].children]

      if (typeof index === "number" && index >= 0 && index <= newParentChildren.length) {
        // Insert at specific index
        newParentChildren.splice(index, 0, updatedElements[elementId].id)
      } else {
        // Add to the end
        newParentChildren.push(updatedElements[elementId].id)
      }

      updatedElements[newParentId] = {
        ...updatedElements[newParentId],
        children: newParentChildren,
      }
    }

    set({
      website: {
        ...website,
        elements: updatedElements,
      },
    })
  },

  duplicateElement: (elementId) => {
    const { website } = get()

    const elementToDuplicate = website.elements[elementId]
    if (!elementToDuplicate) return

    // Don't duplicate a page root
    const isRoot = website.pages.some((page) => page.rootElementId === elementId)
    if (isRoot) return

    // Create a deep copy function for elements
    const deepCopyElement = (element: WebsiteElement): WebsiteElement => {
      const newId = generateId()

      const copiedChildren = element.children.map((childId) => {
        return childId
      })

      return {
        ...element,
        id: newId,
        name: element.name ? `${element.name} (Copy)` : undefined,
        children: copiedChildren,
      }
    }

    //const duplicatedElement = deepCopyElement(elementToDuplicate)
    //duplicatedElement.parentId = elementToDuplicate.parentId

    // Add all new elements to the elements record
    const newElements = { ...website.elements }

    const addElementsRecursively = (elementId: string) => {
      const newElt = deepCopyElement(website.elements[elementId])
      newElements[newElt.id] = newElt
      newElements[newElt.id]?.children.forEach((childId) => {
        const newChildId = addElementsRecursively(childId)
        newElt.children[newElt.children.indexOf(childId)] = newChildId
        newElements[newChildId].parentId = newElt.id
      })
      return newElt.id
    }

    const duplicatedElementId = addElementsRecursively(elementToDuplicate.id)
    const duplicatedElement = newElements[duplicatedElementId]

    // Add the duplicated element to its parent
    if (duplicatedElement.parentId && newElements[duplicatedElement.parentId]) {
      const parentChildren = [...newElements[duplicatedElement.parentId].children]
      const originalIndex = parentChildren.findIndex((child) => child === elementId)

      if (originalIndex !== -1) {
        parentChildren.splice(originalIndex + 1, 0, duplicatedElement.id)
      } else {
        parentChildren.push(duplicatedElement.id)
      }

      newElements[duplicatedElement.parentId] = {
        ...newElements[duplicatedElement.parentId],
        children: parentChildren,
      }
    }

    set({
      website: {
        ...website,
        elements: newElements,
      },
      selectedElementId: duplicatedElementId,
    })
  },

  copyElement: (elementId) => {
    const { website } = get()
    const elementToCopy = website.elements[elementId]

    if (!elementToCopy) return

    // Don't copy a page root
    const isRoot = website.pages.some((page) => page.rootElementId === elementId)
    if (isRoot) return

    set({ clipboard: JSON.parse(JSON.stringify(elementToCopy)) })
  },

  pasteElement: (parentId) => {
    const { clipboard, website, currentPageId } = get()

    if (!clipboard || !currentPageId) return

    const currentPage = website.pages.find((p) => p.id === currentPageId)
    if (!currentPage) return

    // If no parent specified, use the page root
    const actualParentId = parentId || currentPage.rootElementId

    // Create a deep copy function for elements
    const deepCopyElement = (element: WebsiteElement): WebsiteElement => {
      const newId = generateId()

      const copiedChildren = element.children.map((childId) => {
        const childElement = website.elements[childId];
        return childElement ? deepCopyElement(childElement).id : childId;
      })

      return {
        ...element,
        id: newId,
        name: element.name ? `${element.name} (Copy)` : undefined,
        children: copiedChildren,
        parentId: actualParentId,
      }
    }

    const pastedElement = deepCopyElement(clipboard)

    // Add all new elements to the elements record
    const newElements = { ...website.elements }

    const addElementsRecursively = (element: WebsiteElement) => {
      newElements[element.id] = element
      element.children.forEach((child) => {
        const childElement = website.elements[child]
        addElementsRecursively(childElement ? deepCopyElement(childElement) : childElement)
      })
    }

    addElementsRecursively(pastedElement)

    // Add the pasted element to its parent
    if (actualParentId && newElements[actualParentId]) {
      newElements[actualParentId] = {
        ...newElements[actualParentId],
        children: [...newElements[actualParentId].children, pastedElement.id],
      }
    }

    set({
      website: {
        ...website,
        elements: newElements,
      },
      selectedElementId: pastedElement.id,
    })
  },

  saveToLocalStorage: () => {
    const { website } = get()
    if (typeof window !== "undefined") {
      localStorage.setItem("website-builder", JSON.stringify(website))
    }
  },

  loadFromLocalStorage: () => {
    if (typeof window !== "undefined") {
      const savedWebsite = localStorage.getItem("website-builder")
      if (savedWebsite) {
        try {
          const parsedWebsite = JSON.parse(savedWebsite)
          set({
            website: parsedWebsite,
            currentPageId: parsedWebsite.pages[0]?.id || null,
            selectedElementId: null,
          })
        } catch (error) {
          console.error("Failed to parse saved website", error)
        }
      }
    }
  },

  isFromLocalStorage: () => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("website-builder") !== null
    }
    return false
  },
}))
