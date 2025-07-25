"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { generateRandomArray } from "@/utils/generate-array"
import { createSoundManager } from "@/utils/sound-manager"
import { delay } from "@/algorithms/utils" // Import delay for use in hook

import { bubbleSort } from "@/algorithms/bubble-sort"
import { selectionSort } from "@/algorithms/selection-sort"
import { insertionSort } from "@/algorithms/insertion-sort"
import { mergeSort } from "@/algorithms/merge-sort"
import { quickSort } from "@/algorithms/quick-sort"

const algorithmMap = {
  "Bubble Sort": bubbleSort,
  "Selection Sort": selectionSort,
  "Insertion Sort": insertionSort,
  "Merge Sort": mergeSort,
  "Quick Sort": quickSort,
}

// Algorithm characteristics for hints in 'Guess the Algorithm' mode
const algorithmDetails = {
  "Bubble Sort": {
    hint: "Compares adjacent elements and swaps them if they are in the wrong order.",
    paradigm: "Comparison-based, iterative, adjacent swaps.",
  },
  "Selection Sort": {
    hint: "Finds the minimum element from the unsorted part and puts it at the beginning.",
    paradigm: "Comparison-based, in-place, finds minimum.",
  },
  "Insertion Sort": {
    hint: "Builds the final sorted array (or list) one item at a time.",
    paradigm: "Comparison-based, in-place, builds sorted sublist.",
  },
  "Merge Sort": {
    hint: "Divides the unsorted list into n sublists, each containing one element, and then repeatedly merges sublists to produce new sorted sublists until there is only one sorted sublist remaining.",
    paradigm: "Divide and conquer, stable, external sorting.",
  },
  "Quick Sort": {
    hint: "Picks an element as a pivot and partitions the given array around the picked pivot.",
    paradigm: "Divide and conquer, in-place (usually), pivot-based.",
  },
}

// Define algorithm pools for different difficulties
const difficultyAlgorithmPool = {
  easy: ["Bubble Sort", "Selection Sort", "Insertion Sort"],
  medium: ["Bubble Sort", "Selection Sort", "Insertion Sort", "Quick Sort"],
  hard: ["Bubble Sort", "Selection Sort", "Insertion Sort", "Quick Sort", "Merge Sort"],
}

export function useSorting() {
  const [arrayState, setArrayState] = useState([]) // State for rendering
  const arrayRef = useRef([]) // Ref for mutable array used by algorithms

  const [arraySize, setArraySize] = useState(50) // Default size
  const [speed, setSpeed] = useState(50) // Default speed in ms (lower is faster)
  const [soundEnabled, setSoundEnabled] = useState(true)
  const [isSorting, setIsSorting] = useState(false)
  const [selectedAlgorithm, setSelectedAlgorithm] = useState("Bubble Sort") // Used for regular mode
  const [arrayKey, setArrayKey] = useState(0) // New state for forcing re-render

  // Game Mode States (shared)
  const [gameModeEnabled, setGameModeEnabled] = useState(false)
  const [score, setScore] = useState(0)
  const [feedback, setFeedback] = useState("")
  const guessPromiseResolveRef = useRef(null) // To resolve the promise that pauses the algorithm

  // Guess the Swap/Compare Mode States
  const [gameModeType, setGameModeType] = useState("swapCompare") // "swapCompare" or "guessAlgorithm"
  const [question, setQuestion] = useState("")
  const [expectedIndices, setExpectedIndices] = useState([])
  const [userSelectedIndices, setUserSelectedIndices] = useState([])
  const [isPausedForGuess, setIsPausedForGuess] = useState(false)

  // Guess the Algorithm Mode States
  const [difficulty, setDifficulty] = useState("medium") // "easy", "medium", "hard"
  const [timer, setTimer] = useState(0) // Countdown timer for guess the algorithm
  const timerIntervalRef = useRef(null)
  const [currentAlgorithmForGuess, setCurrentAlgorithmForGuess] = useState(null) // The algorithm that ran
  const [algorithmChoices, setAlgorithmChoices] = useState([]) // Multiple choice options
  const [userSelectedAlgorithm, setUserSelectedAlgorithm] = useState(null) // User's algorithm guess

  // Hint States (shared across game modes where applicable)
  const [incorrectGuessesCount, setIncorrectGuessesCount] = useState(0)
  const [showHint, setShowHint] = useState(false)

  // New states for automatic next round countdown
  const [nextRoundCountdown, setNextRoundCountdown] = useState(null) // null, 3, 2, 1
  const nextRoundTimerRef = useRef(null)

  const soundManagerRef = useRef(null)
  const isSortingRef = useRef(false) // Ref to track sorting state across async calls

  // --- 1. Define pauseForGuess first as it's a dependency for startSorting ---
  const pauseForGuess = useCallback(
    async (indices, operationType) => {
      if (gameModeType === "swapCompare") {
        setIsPausedForGuess(true)
        setIsSorting(false) // Set isSorting to false when paused for guess
        setExpectedIndices(indices)
        setUserSelectedIndices([]) // Clear previous selection
        setFeedback("")
        setQuestion(`Click the two bars that will be ${operationType} next.`)
        setShowHint(false) // Ensure hint is off for new question
        return new Promise((resolve) => {
          guessPromiseResolveRef.current = resolve
        })
      }
      // For 'guessAlgorithm' mode, pausing is handled at the end of the sort
      return Promise.resolve()
    },
    [gameModeType],
  )

  // --- 2. Define startSorting next as it depends on pauseForGuess ---
  const startSorting = useCallback(async () => {
    if (isSortingRef.current) return
    if (isPausedForGuess && gameModeType === "swapCompare") return // Cannot start if already paused for guess in swap mode

    setIsSorting(true)
    isSortingRef.current = true
    soundManagerRef.current?.stopAllSounds()

    // Reset array status to default before sorting
    arrayRef.current = arrayRef.current.map((item) => ({ ...item, status: "default" }))
    setArrayState([...arrayRef.current])
    await new Promise((resolve) => setTimeout(resolve, 100))

    let algoToRun = selectedAlgorithm // Default to selected algorithm for regular mode

    if (gameModeEnabled && gameModeType === "guessAlgorithm") {
      // Select random algorithm for Guess the Algorithm mode
      const availableAlgos = difficultyAlgorithmPool[difficulty]
      const randomIndex = Math.floor(Math.random() * availableAlgos.length)
      algoToRun = availableAlgos[randomIndex]
      setCurrentAlgorithmForGuess(algoToRun)

      // Generate random choices, ensuring the correct one is present
      const allAlgorithms = Object.keys(algorithmMap)
      const incorrectAlgos = allAlgorithms.filter((algo) => algo !== algoToRun)
      const shuffledIncorrect = incorrectAlgos.sort(() => 0.5 - Math.random())

      let choices = [algoToRun, ...shuffledIncorrect.slice(0, Math.min(2, shuffledIncorrect.length))] // 3 options
      choices = choices.sort(() => 0.5 - Math.random()) // Shuffle choices
      setAlgorithmChoices(choices)
      setUserSelectedAlgorithm(null) // Reset user selection
      setFeedback("")
      setQuestion("Which sorting algorithm is this?")

      // Set timer based on difficulty
      const timerDuration = { easy: 20, medium: 15, hard: 10 }[difficulty]
      setTimer(timerDuration)
    }

    const algorithmFunction = algorithmMap[algoToRun]
    if (algorithmFunction) {
      try {
        await algorithmFunction(arrayRef, setArrayState, {
          speed,
          soundManager: soundManagerRef.current,
          isSortingRef,
          gameModeEnabled: gameModeEnabled && gameModeType === "swapCompare", // Only pass true for swap/compare mode
          pauseForGuess, // This is why pauseForGuess must be defined first
        })
      } catch (error) {
        console.error("Sorting algorithm failed:", error)
      } finally {
        setIsSorting(false)
        isSortingRef.current = false
        soundManagerRef.current?.playDone()
        // Mark as sorted at the end for both modes
        arrayRef.current = arrayRef.current.map((item) => ({ ...item, status: "sorted" }))
        setArrayState([...arrayRef.current])

        if (gameModeEnabled && gameModeType === "guessAlgorithm") {
          setIsPausedForGuess(true) // Pause for guess in Guess the Algorithm mode
          // Timer started by useEffect above
        } else {
          // For regular or swap/compare mode, resolve any pending guess if sorting finishes
          if (guessPromiseResolveRef.current) {
            guessPromiseResolveRef.current()
            guessPromiseResolveRef.current = null
          }
        }
      }
    }
  }, [selectedAlgorithm, speed, gameModeEnabled, gameModeType, pauseForGuess, difficulty, isPausedForGuess, arraySize])

  // --- 3. Define generateNewArray (used by handleSubmitAlgorithmGuess and initial useEffect) ---
  const generateNewArray = useCallback(
    (sizeFromCaller, resetGameScore = true) => {
      console.log(
        "generateNewArray called. isSortingRef.current:",
        isSortingRef.current,
        "isPausedForGuess (at call):",
        isPausedForGuess, // This will reflect the state at the time generateNewArray was created
        "resetGameScore:",
        resetGameScore,
      )
      // Block if sorting is in progress, or if it's a full game reset while paused.
      // It should NOT block if resetGameScore is false (i.e., advancing a game round).
      if (isSortingRef.current || (isPausedForGuess && resetGameScore)) {
        console.log("Blocked: Sorting in progress or paused for full game reset.")
        return // Prevent generating new array while sorting or paused for guess
      }
      soundManagerRef.current?.stopAllSounds()

      const actualSize = sizeFromCaller !== undefined ? sizeFromCaller : arraySize

      const newArray = generateRandomArray(actualSize, 5, 200)
      arrayRef.current = newArray // Update the ref
      setArrayState([...newArray]) // Update state for rendering
      setArraySize(actualSize) // Update arraySize state, will trigger useEffect if different
      setArrayKey((prev) => prev + 1) // Increment key to force visualizer re-mount/re-render
      console.log("Generated Array:", newArray)

      // Conditional score reset
      if (resetGameScore) {
        console.log("Resetting score to 0.")
        setScore(0)
      }
      setQuestion("")
      setExpectedIndices([])
      setUserSelectedIndices([])
      setFeedback("")
      // Do NOT set setIsPausedForGuess(false) here, it's managed by the caller
      setIncorrectGuessesCount(0)
      setShowHint(false)
      setCurrentAlgorithmForGuess(null)
      setAlgorithmChoices([])
      setUserSelectedAlgorithm(null)
      setTimer(0) // Reset timer

      // Clear any pending next round countdown when a new array is generated
      clearInterval(nextRoundTimerRef.current)
      setNextRoundCountdown(null)

      if (guessPromiseResolveRef.current) {
        guessPromiseResolveRef.current() // Resolve any pending guess promise
        guessPromiseResolveRef.current = null
      }
      console.log("New array generated and state updated.")
    },
    [arraySize, isSortingRef, soundManagerRef, setScore], // Removed isPausedForGuess from dependencies
  )

  // --- 4. Define handleSubmitAlgorithmGuess (calls startSorting and generateNewArray) ---
  const handleSubmitAlgorithmGuess = useCallback(
    (isUserInitiated = true) => {
      console.log("handleSubmitAlgorithmGuess called. isUserInitiated:", isUserInitiated)
      clearInterval(timerIntervalRef.current) // Stop the timer
      const correct = userSelectedAlgorithm === currentAlgorithmForGuess

      if (correct) {
        setFeedback("Correct! (+10 Points)")
        setScore((prev) => {
          const newScore = prev + 10
          console.log("Score updated: ", prev, " -> ", newScore)
          return newScore
        })
        setIncorrectGuessesCount(0)
        soundManagerRef.current?.playDone() // Play done sound for correct guess
      } else {
        setFeedback((prevFeedback) => {
          const newFeedback = isUserInitiated ? "Incorrect! (-5 Points)" : "Time's up! (-5 Points)"
          console.log("Feedback updated: ", newFeedback)
          return newFeedback
        })
        setScore((prev) => {
          const newScore = Math.max(0, prev - 5)
          console.log("Score updated: ", prev, " -> ", newScore)
          return newScore
        })
        setIncorrectGuessesCount((prev) => prev + 1) // Increment incorrect guesses for hint
        soundManagerRef.current?.playCompare() // Play a sound for incorrect guess
      }

      // CRUCIAL: Set isPausedForGuess to false immediately so generateNewArray doesn't block
      setIsPausedForGuess(false)
      setUserSelectedAlgorithm(null) // Reset selection
      setAlgorithmChoices([]) // Clear choices
      // Do NOT clear currentAlgorithmForGuess immediately, needed for hint if incorrect

      console.log("State before setTimeout in handleSubmitAlgorithmGuess:", { isPausedForGuess, score, feedback })

      setTimeout(() => {
        console.log("Inside setTimeout of handleSubmitAlgorithmGuess - clearing feedback and preparing next round.")
        setQuestion("")
        setFeedback("")
        setCurrentAlgorithmForGuess(null) // Clear actual algorithm after feedback is gone

        // Generate new array for the next round, keeping the score
        console.log("Calling generateNewArray with resetGameScore = false")
        generateNewArray(arraySize, false) // Start a new round, do NOT reset score

        // Start countdown for next round
        setNextRoundCountdown(3) // Start from 3
        nextRoundTimerRef.current = setInterval(() => {
          setNextRoundCountdown((prev) => {
            if (prev === null) {
              // If somehow already null, stop
              clearInterval(nextRoundTimerRef.current)
              return null
            }
            if (prev <= 1) {
              clearInterval(nextRoundTimerRef.current)
              startSorting() // Automatically start next round
              return null // Reset countdown display
            }
            return prev - 1
          })
        }, 1000)
      }, 1500) // Show feedback for a moment
    },
    [userSelectedAlgorithm, currentAlgorithmForGuess, arraySize, generateNewArray, soundManagerRef, startSorting], // Added startSorting to dependencies
  )

  useEffect(() => {
    if (!soundManagerRef.current) {
      soundManagerRef.current = createSoundManager()
    }
    soundManagerRef.current.setSoundEnabled(soundEnabled)
  }, [soundEnabled])

  // Log state changes for debugging
  useEffect(() => {
    console.log("useSorting state change:", {
      isPausedForGuess,
      userSelectedIndices,
      incorrectGuessesCount,
      showHint,
      isSorting,
      gameModeType,
      difficulty,
      timer,
      currentAlgorithmForGuess,
      algorithmChoices,
      userSelectedAlgorithm,
      nextRoundCountdown, // Log new state
    })
  }, [
    isPausedForGuess,
    userSelectedIndices,
    incorrectGuessesCount,
    showHint,
    isSorting,
    gameModeType,
    difficulty,
    timer,
    currentAlgorithmForGuess,
    algorithmChoices,
    userSelectedAlgorithm,
    nextRoundCountdown,
  ])

  // Timer effect for Guess the Algorithm mode
  useEffect(() => {
    if (gameModeEnabled && gameModeType === "guessAlgorithm" && isPausedForGuess && timer > 0) {
      timerIntervalRef.current = setInterval(() => {
        setTimer((prev) => prev - 1)
      }, 1000)
    } else if (timer === 0 && gameModeEnabled && gameModeType === "guessAlgorithm" && isPausedForGuess) {
      // Time's up
      clearInterval(timerIntervalRef.current)
      handleSubmitAlgorithmGuess(false) // Automatically submit as incorrect
    } else {
      clearInterval(timerIntervalRef.current)
    }

    return () => clearInterval(timerIntervalRef.current)
  }, [gameModeEnabled, gameModeType, isPausedForGuess, timer, handleSubmitAlgorithmGuess])

  useEffect(() => {
    generateNewArray(arraySize, true) // Generate initial array on mount or arraySize change, resetting score
  }, [arraySize, generateNewArray])

  const submitGuess = useCallback(() => {
    if (gameModeType !== "swapCompare") return // This function is only for swap/compare mode

    if (userSelectedIndices.length !== 2) {
      setFeedback("Please select exactly two bars.")
      return
    }

    // Sort indices to compare regardless of click order
    const sortedUser = [...userSelectedIndices].sort((a, b) => a - b)
    const sortedExpected = [...expectedIndices].sort((a, b) => a - b)

    const isCorrect = sortedUser[0] === sortedExpected[0] && sortedUser[1] === sortedExpected[1]
    setFeedback(isCorrect ? "Correct!" : "Incorrect!")
    if (isCorrect) {
      setScore((prev) => prev + 1)
      setIncorrectGuessesCount(0) // Reset on correct guess
      // Clear selections and expected indices immediately after correct guess
      setUserSelectedIndices([])
      setExpectedIndices([])

      // Immediately resume algorithm
      setIsPausedForGuess(false)
      setIsSorting(true) // Crucial: Set isSorting to true immediately
      if (guessPromiseResolveRef.current) {
        guessPromiseResolveRef.current() // Resolve the promise to unpause the algorithm
        guessPromiseResolveRef.current = null
      }

      // Clear feedback and question after a short delay
      setTimeout(() => {
        setQuestion("")
        setFeedback("")
      }, 1000)
    } else {
      setScore((prev) => Math.max(0, prev - 1))
      setIncorrectGuessesCount((prev) => {
        const newCount = prev + 1
        console.log(
          "Incorrect guess. incorrectGuessesCount:",
          newCount,
          "isPausedForGuess:",
          isPausedForGuess,
          "userSelectedIndices (in submitGuess after incorrect):",
          userSelectedIndices,
        )
        return newCount
      })
      // Clear user selections and ensure hint state is reset after an incorrect guess
      setUserSelectedIndices([])
      setShowHint(false) // Ensure hint is off if it was previously shown
      // Keep paused, do not resolve promise
    }
  }, [userSelectedIndices, expectedIndices, isPausedForGuess, gameModeType])

  const getHint = useCallback(async () => {
    console.log("getHint called. Conditions:", {
      isPausedForGuess,
      expectedIndicesLength: expectedIndices.length,
      showHint,
      gameModeType,
      incorrectGuessesCount,
    })

    if (gameModeType === "swapCompare") {
      console.log("getHint called. Expected indices:", expectedIndices)
      if (!isPausedForGuess || expectedIndices.length === 0 || showHint) return

      setShowHint(true)
      const currentArray = arrayRef.current
      const originalStatuses = {} // Use an object to store original statuses by index

      // Create a new array with updated statuses for the hint
      const newArrayForHint = currentArray.map((item, idx) => {
        if (expectedIndices.includes(idx)) {
          originalStatuses[idx] = item.status // Store original status
          return { ...item, status: "hint" } // Create new object with hint status
        }
        return item // Return original object for other items
      })
      setArrayState(newArrayForHint) // Update state with the new array
      soundManagerRef.current?.playCompare() // Optional: play a sound for hint

      await delay(speed * 2) // Show hint for a duration

      // Revert statuses by creating another new array
      const newArrayForRevert = arrayRef.current.map((item, idx) => {
        if (expectedIndices.includes(idx)) {
          return { ...item, status: originalStatuses[idx] } // Revert to original status
        }
        return item
      })
      setArrayState(newArrayForRevert) // Update state with the reverted array
      setShowHint(false)
    } else if (gameModeType === "guessAlgorithm" && incorrectGuessesCount >= 1 && currentAlgorithmForGuess) {
      // Hint for Guess the Algorithm mode after first incorrect guess
      setFeedback(algorithmDetails[currentAlgorithmForGuess]?.hint || "No specific hint available.")
      setTimeout(() => setFeedback(""), 2000) // Clear hint after a delay
    }
  }, [
    isPausedForGuess,
    expectedIndices,
    arrayRef,
    setArrayState,
    speed,
    soundManagerRef,
    showHint,
    gameModeType,
    incorrectGuessesCount,
    currentAlgorithmForGuess,
  ])

  const handleBarClick = useCallback(
    (index) => {
      if (isPausedForGuess && gameModeType === "swapCompare") {
        setUserSelectedIndices((prev) => {
          let newSelection
          if (prev.includes(index)) {
            newSelection = prev.filter((i) => i !== index) // Deselect
          } else if (prev.length < 2) {
            newSelection = [...prev, index] // Select
          } else {
            newSelection = prev // Max 2 selections
          }
          console.log(`handleBarClick: prev=${prev}, clicked=${index}, new=${newSelection}`)
          return newSelection
        })
      }
    },
    [isPausedForGuess, gameModeType],
  )

  const stopSorting = useCallback(() => {
    isSortingRef.current = false
    setIsSorting(false)
    soundManagerRef.current?.stopAllSounds()
    clearInterval(timerIntervalRef.current) // Stop timer on manual stop
    clearInterval(nextRoundTimerRef.current) // Stop next round countdown
    setNextRoundCountdown(null) // Reset countdown display

    arrayRef.current = arrayRef.current.map((item) => ({ ...item, status: "default" }))
    setArrayState([...arrayRef.current])
    // Clear all game state when sorting is stopped manually
    setScore(0)
    setQuestion("")
    setExpectedIndices([])
    setUserSelectedIndices([])
    setFeedback("")
    setIsPausedForGuess(false)
    setIncorrectGuessesCount(0)
    setShowHint(false)
    setCurrentAlgorithmForGuess(null)
    setAlgorithmChoices([])
    setUserSelectedAlgorithm(null)
    setTimer(0)
    if (guessPromiseResolveRef.current) {
      guessPromiseResolveRef.current()
      guessPromiseResolveRef.current = null
    }
  }, [])

  const handleAlgorithmChange = useCallback(
    (value) => {
      if (!isSorting) {
        setSelectedAlgorithm(value)
        if (!gameModeEnabled || gameModeType === "swapCompare") {
          // Only reset array if not in "Guess the Algorithm" mode
          generateNewArray(arraySize, true) // Reset array when changing algorithm in regular mode, reset score
        }
      }
    },
    [isSorting, gameModeEnabled, gameModeType, generateNewArray, arraySize],
  )

  const handleSpeedChange = useCallback((value) => {
    setSpeed(value[0])
  }, [])

  const handleSoundToggle = useCallback(() => {
    setSoundEnabled((prev) => !prev)
  }, [])

  const handleArraySizeChange = useCallback(
    (value) => {
      if (!isSorting) {
        setArraySize(value[0])
        generateNewArray(value[0], true) // Generate new array with new size, reset score
      }
    },
    [isSorting, generateNewArray],
  )

  const handleGameModeToggle = useCallback(() => {
    if (isSorting) return // Cannot change mode while sorting
    setGameModeEnabled((prev) => !prev)
    // Reset all game state when toggling mode
    setScore(0) // Explicitly reset score here for clarity
    setQuestion("")
    setExpectedIndices([])
    setUserSelectedIndices([])
    setFeedback("")
    setIsPausedForGuess(false)
    setIncorrectGuessesCount(0)
    setShowHint(false)
    setCurrentAlgorithmForGuess(null)
    setAlgorithmChoices([])
    setUserSelectedAlgorithm(null)
    setTimer(0)
    clearInterval(timerIntervalRef.current)
    clearInterval(nextRoundTimerRef.current) // Clear next round countdown
    setNextRoundCountdown(null) // Reset countdown display

    if (guessPromiseResolveRef.current) {
      guessPromiseResolveRef.current()
      guessPromiseResolveRef.current = null
    }
    generateNewArray(arraySize, true) // Generate new array to reset visualization and score
  }, [isSorting, generateNewArray, arraySize])

  const handleGameModeTypeChange = useCallback(
    (value) => {
      if (!isSorting) {
        setGameModeType(value)
        // Reset game states when changing game type, keep score
        setQuestion("")
        setExpectedIndices([])
        setUserSelectedIndices([])
        setFeedback("")
        setIsPausedForGuess(false)
        setIncorrectGuessesCount(0)
        setShowHint(false)
        setCurrentAlgorithmForGuess(null)
        setAlgorithmChoices([])
        setUserSelectedAlgorithm(null)
        setTimer(0)
        clearInterval(timerIntervalRef.current)
        clearInterval(nextRoundTimerRef.current) // Clear next round countdown
        setNextRoundCountdown(null) // Reset countdown display

        generateNewArray(arraySize, true) // Reset array for the new game type and score
      }
    },
    [isSorting, generateNewArray, arraySize],
  )

  const handleDifficultyChange = useCallback(
    (value) => {
      if (!isSorting) {
        setDifficulty(value)
        generateNewArray(arraySize, true) // Reset array with new difficulty settings and score
      }
    },
    [isSorting, generateNewArray, arraySize],
  )

  return {
    array: arrayState, // Expose arrayState for rendering
    arraySize,
    speed,
    soundEnabled,
    isSorting,
    selectedAlgorithm,
    generateNewArray,
    startSorting,
    stopSorting,
    handleAlgorithmChange,
    handleSpeedChange,
    handleSoundToggle,
    handleArraySizeChange,
    arrayKey, // Expose arrayKey

    // Game Mode exports (shared)
    gameModeEnabled,
    score,
    feedback,
    handleGameModeToggle,

    // Swap/Compare Mode exports
    gameModeType, // New export
    question,
    userSelectedIndices,
    isPausedForGuess,
    submitGuess,
    handleBarClick,

    // Guess the Algorithm Mode exports
    difficulty, // New export
    timer, // New export
    algorithmChoices, // New export
    userSelectedAlgorithm, // New export
    handleGameModeTypeChange, // New handler
    handleDifficultyChange, // New handler
    handleSubmitAlgorithmGuess, // New export for algorithm guess submission
    setUserSelectedAlgorithm, // For individual choice selection

    // Hint exports (shared)
    incorrectGuessesCount,
    showHint,
    getHint,
    expectedIndices, // Needed for visualizer to show hint

    // New export for next round countdown
    nextRoundCountdown,
  }
}
