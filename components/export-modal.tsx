"use client"

import { useState } from "react"
import { useWebsiteStore } from "@/lib/store"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Download, Copy, X } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { styleObjectToString, layoutPropsToStyle } from "@/lib/utils"
import { ElementTypes } from "@/lib/types"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog"

interface ExportModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export default function ExportModal({ open, onOpenChange }: ExportModalProps) {
  const { website } = useWebsiteStore()
  const { toast } = useToast()
  const [activeTab, setActiveTab] = useState("html")

  const generateHTML = () => {
    const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${website.name || "My Website"}</title>
  <style>
    body {
      margin: 0;
      padding: 0;
      font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    }
    ${generateCSS()}
  </style>
</head>
<body>
  ${generateNavigation()}
  ${generatePages()}
  <script>
    // Simple navigation script
    document.addEventListener('DOMContentLoaded', function() {
      const pages = document.querySelectorAll('.page');
      const navLinks = document.querySelectorAll('nav a');

      // Show first page by default
      if (pages.length > 0) {
        pages[0].style.display = 'block';
      }

      // Handle navigation
      navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
          e.preventDefault();
          const targetId = this.getAttribute('href').substring(1);

          pages.forEach(page => {
            page.style.display = 'none';
          });

          document.getElementById(targetId).style.display = 'block';
        });
      });
    });
  </script>
</body>
</html>`

    return html
  }

  // Update the generateCSS function to ensure proper CSS formatting
  const generateCSS = () => {
    let css = ""

    // Add styles for each element
    Object.values(website.elements).forEach((element) => {
      const combinedStyle = {
        ...element.style,
        ...layoutPropsToStyle(element.layoutProps),
      }

      css += `
    #${element.id} {
      ${styleObjectToString(combinedStyle)}
    }`
    })

    return css
  }

  const generateNavigation = () => {
    if (website.pages.length <= 1) return ""

    let nav =
      '<nav style="position: sticky; top: 0; left: 0; right: 0; background: #f0f0f0; padding: 10px; z-index: 1000;">'

    website.pages.forEach((page) => {
      nav += `<a href="#${page.id}" style="margin-right: 10px; text-decoration: none; color: #333;">${page.name}</a>`
    })

    nav += "</nav>"

    return nav
  }

  const generatePages = () => {
    if (website.pages.length === 0) {
      return '<div class="page">No pages created yet.</div>'
    }

    let pagesHtml = ""

    // Add pages
    website.pages.forEach((page, index) => {
      pagesHtml += `<div id="${page.id}" class="page" style="display: ${index === 0 ? "block" : "none"};">`

      // Add the root element and its children
      const rootElementId = page.rootElementId
      pagesHtml += renderElement(rootElementId)

      pagesHtml += "</div>"
    })

    return pagesHtml
  }

  const renderElement = (elementId: string): string => {
    const element = website.elements[elementId]
    if (!element) return ""

    let html = ""

    switch (element.type) {
      case ElementTypes.SECTION:
      case ElementTypes.CONTAINER:
      case ElementTypes.FLEX:
      case ElementTypes.GRID:
        html += `<div id="${element.id}">`
        element.children.forEach((child) => {
          html += renderElement(child.id)
        })
        html += `</div>`
        break

      case ElementTypes.TEXT:
      case ElementTypes.HEADING:
      case ElementTypes.PARAGRAPH:
        html += `<div id="${element.id}">${element.content}</div>`
        break

      case ElementTypes.BUTTON:
        html += `<button id="${element.id}">${element.content}</button>`
        break

      case ElementTypes.LINK:
        html += `<a id="${element.id}" href="#">${element.content}</a>`
        break

      case ElementTypes.IMAGE:
        html += `<img id="${element.id}" src="${element.content}" alt="Image" />`
        break

      default:
        html += `<div id="${element.id}"></div>`
    }

    return html
  }

  const handleCopyCode = () => {
    const code = generateHTML()
    navigator.clipboard.writeText(code)
    toast({
      title: "Copied to clipboard",
      description: "HTML code has been copied to your clipboard",
    })
  }

  const handleDownloadHTML = () => {
    const html = generateHTML()
    const blob = new Blob([html], { type: "text/html" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "website.html"
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Export HTML</DialogTitle>
          <DialogDescription>Preview and export your website as HTML.</DialogDescription>
        </DialogHeader>

        <div className="flex flex-col flex-1 overflow-scroll py-4">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="html">HTML Code</TabsTrigger>
              <TabsTrigger value="preview">Preview</TabsTrigger>
            </TabsList>

            <TabsContent value="html" className="space-y-4 mt-4 h-full">
              <div className="relative">
                <pre className="p-4 bg-muted rounded-md overflow-auto text-xs">
                  <code>{generateHTML()}</code>
                </pre>
                <Button size="sm" variant="ghost" className="absolute top-2 right-2" onClick={handleCopyCode}>
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="preview" className="mt-4">
              <div className="border rounded-md overflow-auto bg-white h-[400px]">
                <iframe srcDoc={generateHTML()} title="Website Preview" className="w-full h-full" />
              </div>
            </TabsContent>
          </Tabs>
        </div>

        <div className="flex justify-between items-center pt-4">
          <Button onClick={handleDownloadHTML} className="mr-2">
            <Download className="h-4 w-4 mr-2" />
            Download HTML
          </Button>
          <DialogClose asChild>
            <Button variant="outline">
              <X className="h-4 w-4 mr-2" />
              Close
            </Button>
          </DialogClose>
        </div>
      </DialogContent>
    </Dialog>
  )
}
