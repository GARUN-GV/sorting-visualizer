"use client"

import { useMemo, useEffect } from "react" // Import useEffect

const BAR_COLOR_MAP = {
  default: "bg-gradient-to-b from-gray-400 to-gray-600",
  comparing: "bg-gradient-to-b from-yellow-400 to-yellow-600",
  swapping: "bg-gradient-to-b from-red-500 to-red-700",
  sorted: "bg-gradient-to-b from-emerald-500 to-emerald-700",
  pivot: "bg-gradient-to-b from-blue-500 to-blue-700",
  min: "bg-gradient-to-b from-purple-500 to-purple-700",
  selected: "bg-gradient-to-b from-indigo-400 to-indigo-600", // New color for user selection
  hint: "bg-gradient-to-b from-cyan-400 to-cyan-600", // New color for hint
}

export default function SortingVisualizer({
  array,
  onBarClick,
  userSelectedIndices,
  isPausedForGuess,
  showHint,
  expectedIndices,
  gameModeEnabled, // New prop: pass gameModeEnabled to visualizer
}) {
  // Log props on every render of SortingVisualizer
  useEffect(() => {
    console.log("SortingVisualizer rendered with:", {
      isPausedForGuess,
      userSelectedIndices,
      showHint,
      expectedIndices,
      arrayLength: array.length,
      gameModeEnabled, // Log new prop
    })
  }, [isPausedForGuess, userSelectedIndices, showHint, expectedIndices, array.length, gameModeEnabled])

  const bars = useMemo(() => {
    if (!array || array.length === 0) return null

    const maxVal = Math.max(...array.map((a) => a.value))
    const minVal = Math.min(...array.map((a) => a.value))
    const valRange = maxVal - minVal

    return array.map((item, index) => {
      // Ensure a minimum height for visibility, and scale proportionally
      // Smallest value (minVal) will be 5% height, largest (maxVal) will be 100%
      const minDisplayHeight = 5 // Minimum height in percentage
      const maxDisplayHeight = 100 // Maximum height in percentage
      let heightPercentage
      if (valRange > 0) {
        heightPercentage = ((item.value - minVal) / valRange) * (maxDisplayHeight - minDisplayHeight) + minDisplayHeight
      } else {
        // All values are the same, set to a default visible height
        heightPercentage = (maxDisplayHeight + minDisplayHeight) / 2 // e.g., 52.5%
      }

      const widthPercentage = 100 / array.length

      // Determine bar status, prioritizing hint, then user selection, then algorithm status
      let currentStatus = item.status
      if (showHint && expectedIndices.includes(index)) {
        currentStatus = "hint"
      } else if (isPausedForGuess && userSelectedIndices.includes(index)) {
        currentStatus = "selected"
      }

      // Determine font size based on array size for readability
      const fontSizeClass = array.length <= 20 ? "text-sm" : array.length <= 50 ? "text-xs" : "text-[8px]"

      return (
        <div
          key={index}
          className={`relative flex-shrink-0 rounded-t-sm transition-[height,background-color] duration-75 ease-in-out ${BAR_COLOR_MAP[currentStatus]} ${isPausedForGuess && !showHint ? "cursor-pointer hover:brightness-125" : ""} border border-border`} // Added border-border
          style={{
            height: `${heightPercentage}%`,
            width: `${widthPercentage}%`,
          }}
          onClick={() => isPausedForGuess && !showHint && onBarClick(index)} // Disable click during hint
        >
          {gameModeEnabled && ( // Conditionally render value in game mode
            <span
              className={`absolute top-0 left-1/2 -translate-x-1/2 -translate-y-full text-foreground font-bold whitespace-nowrap ${fontSizeClass}`}
              style={{ textShadow: "0px 0px 3px rgba(0,0,0,0.5)" }} // Add text shadow for readability
            >
              {item.value}
            </span>
          )}
        </div>
      )
    })
  }, [array, onBarClick, userSelectedIndices, isPausedForGuess, showHint, expectedIndices, gameModeEnabled]) // Added gameModeEnabled to dependencies

  return (
    <div className="flex flex-1 items-end justify-center px-4 pt-16 pb-32 overflow-hidden h-full bg-background">
      {" "}
      {/* Added overflow-hidden */}
      <div className="flex items-end w-full max-w-7xl h-[calc(100vh-20rem)] bg-card/10 border border-border rounded-lg shadow-lg">
        {/* Changed height to 100vh - 20rem */}
        {bars}
      </div>
    </div>
  )
}
