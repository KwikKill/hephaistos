"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"

interface ColorPickerProps {
  color: string
  onChange: (color: string) => void
}

export function ColorPicker({ color, onChange }: ColorPickerProps) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="flex items-center gap-2">
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <button
            className="w-8 h-8 rounded border border-input"
            style={{ backgroundColor: color }}
            aria-label="Pick a color"
          />
        </PopoverTrigger>
        <PopoverContent className="w-auto p-3">
          <div className="space-y-2">
            <div>
              <input type="color" value={color} onChange={(e) => onChange(e.target.value)} className="w-32 h-32" />
            </div>
            <div className="flex items-center gap-2">
              <Input value={color} onChange={(e) => onChange(e.target.value)} className="w-24" />
            </div>
          </div>
        </PopoverContent>
      </Popover>
      <Input value={color} onChange={(e) => onChange(e.target.value)} className="w-24 text-xs flex-1" />
    </div>
  )
}
