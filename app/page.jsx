"use client"

import Navbar from "@/components/navbar"
import ControlPanel from "@/components/control-panel"
import SortingVisualizer from "@/components/sorting-visualizer"
import { useSorting } from "@/hooks/use-sorting"

export default function Page() {
  const {
    array,
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
    arrayKey,
    // Game Mode exports (shared)
    gameModeEnabled, // Export gameModeEnabled
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
    onDifficultyChange, // New handler
    handleSubmitAlgorithmGuess, // New export
    setUserSelectedAlgorithm, // For individual choice selection
    // Hint exports (shared)
    incorrectGuessesCount,
    showHint,
    getHint,
    expectedIndices,
    // New export for next round countdown
    nextRoundCountdown,
  } = useSorting()

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground overflow-x-hidden">
      {" "}
      {/* Added overflow-x-hidden here */}
      <Navbar />
      <main className="flex flex-col flex-1 pt-16 pb-[200px] bg-background">
        <SortingVisualizer
          key={arrayKey}
          array={array}
          onBarClick={handleBarClick} // Pass click handler
          userSelectedIndices={userSelectedIndices} // Pass user selections
          isPausedForGuess={isPausedForGuess} // Pass pause status
          showHint={showHint} // Pass showHint status
          expectedIndices={expectedIndices} // Pass expected indices for hint
          gameModeEnabled={gameModeEnabled} // Pass gameModeEnabled prop
        />
      </main>
      <ControlPanel
        onGenerateArray={generateNewArray}
        onStartSort={startSorting}
        onStopSort={stopSorting}
        onAlgorithmChange={handleAlgorithmChange}
        onSpeedChange={handleSpeedChange}
        onToggleSound={handleSoundToggle}
        onArraySizeChange={handleArraySizeChange}
        isSorting={isSorting}
        selectedAlgorithm={selectedAlgorithm}
        speed={speed}
        soundEnabled={soundEnabled}
        arraySize={arraySize}
        // Game Mode Props (shared)
        gameModeEnabled={gameModeEnabled}
        score={score}
        feedback={feedback}
        onGameModeToggle={handleGameModeToggle}
        // Swap/Compare Mode Props
        gameModeType={gameModeType} // New prop
        question={question}
        isPausedForGuess={isPausedForGuess}
        onSubmitGuess={submitGuess}
        userSelectedIndices={userSelectedIndices}
        // Guess the Algorithm Mode Props
        difficulty={difficulty} // New prop
        timer={timer} // New prop
        algorithmChoices={algorithmChoices} // New prop
        userSelectedAlgorithm={userSelectedAlgorithm} // New prop
        onGameModeTypeChange={handleGameModeTypeChange} // New handler
        onDifficultyChange={onDifficultyChange} // New handler
        onSubmitAlgorithmGuess={() => handleSubmitAlgorithmGuess(true)} // Pass handler for algorithm guess, ensure user-initiated
        onSelectAlgorithmChoice={setUserSelectedAlgorithm} // Pass handler for selecting algorithm option
        // Hint Props
        incorrectGuessesCount={incorrectGuessesCount}
        showHint={showHint}
        onGetHint={getHint}
        // New prop for next round countdown
        nextRoundCountdown={nextRoundCountdown}
      />
    </div>
  )
}
