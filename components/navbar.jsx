"use client"

import { useState, useEffect } from "react"
import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"
import { Moon, Sun } from "lucide-react"

export default function Navbar() {
  const [mounted, setMounted] = useState(false)
  const { theme, setTheme, resolvedTheme } = useTheme()

  // Log theme states on every render to see their values
  console.log("Navbar Render - theme:", theme, "resolvedTheme:", resolvedTheme, "mounted:", mounted)

  useEffect(() => {
    setMounted(true)
    console.log("Navbar useEffect - mounted set to true")
  }, [])

  // Determine the effective theme for the toggle logic
  // If resolvedTheme is still undefined (e.g., during initial render before hydration), default to 'light'
  const effectiveThemeForToggle = resolvedTheme || "light"

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background text-foreground shadow-lg">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Sorting Visualizer</h1>
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => {
              if (!mounted) return // Prevent clicks before hydration
              console.log("Theme toggle button clicked!")
              console.log("Current effective theme for toggle:", effectiveThemeForToggle)
              const newTheme = effectiveThemeForToggle === "dark" ? "light" : "dark"
              setTheme(newTheme)
              console.log("Attempting to set theme to:", newTheme)
            }}
            aria-label="Toggle theme"
            disabled={!mounted} // Disable button until mounted
          >
            {/* Sun icon: visible in light mode, hidden in dark mode */}
            <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            {/* Moon icon: hidden in light mode, visible in dark mode */}
            <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            <span className="sr-only">Toggle theme</span>
          </Button>
       
           
        </div>
      </div>
    </nav>
  )
}
