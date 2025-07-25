"use client"

import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { RefreshCw, Play, Pause, Volume2, VolumeX, Gamepad2, Lightbulb } from "lucide-react"

export default function ControlPanel({
  onGenerateArray,
  onStartSort,
  onStopSort,
  onAlgorithmChange,
  onSpeedChange,
  onToggleSound,
  onArraySizeChange,
  isSorting,
  selectedAlgorithm,
  speed,
  soundEnabled,
  arraySize,
  // Game Mode Props (shared)
  gameModeEnabled,
  score,
  feedback,
  onGameModeToggle,
  // Swap/Compare Mode Props
  gameModeType, // New prop
  question,
  isPausedForGuess,
  onSubmitGuess,
  userSelectedIndices,
  // Guess the Algorithm Mode Props
  difficulty, // New prop
  timer, // New prop
  algorithmChoices, // New prop
  userSelectedAlgorithm, // New prop
  onGameModeTypeChange, // New handler
  onDifficultyChange, // New handler
  onSubmitAlgorithmGuess, // New handler for algorithm guess
  onSelectAlgorithmChoice, // New handler for selecting algorithm option
  // Hint Props
  incorrectGuessesCount,
  showHint,
  onGetHint,
  // New prop for next round countdown
  nextRoundCountdown,
}) {
  console.log("ControlPanel props for hint:", {
    gameModeEnabled,
    incorrectGuessesCount,
    showHint,
    isSorting,
    isPausedForGuess,
    gameModeType, // Log new prop
    timer, // Log new prop
    nextRoundCountdown, // Log new prop
  })

  const algorithmOptions = ["Bubble Sort", "Selection Sort", "Insertion Sort", "Merge Sort", "Quick Sort"]
  const difficultyOptions = ["Easy", "Medium", "Hard"]

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-background shadow-lg p-4 md:p-6 border-t-2 border-border">
      <div className="container mx-auto grid grid-cols-1 md:grid-cols-5 lg:grid-cols-7 gap-4 items-center">
        {/* Algorithm Selector (Hidden in Guess the Algorithm mode) */}
        {!gameModeEnabled || gameModeType === "swapCompare" ? (
          <div className="flex flex-col gap-2 col-span-1 md:col-span-2">
            <Label htmlFor="algorithm-select" className="text-sm font-medium text-foreground">
              Algorithm
            </Label>
            <Select
              value={selectedAlgorithm}
              onValueChange={(value) => onAlgorithmChange(value)}
              disabled={isSorting || gameModeEnabled || nextRoundCountdown !== null} // Disable during countdown
            >
              <SelectTrigger id="algorithm-select" className="w-full text-foreground">
                <SelectValue placeholder="Select algorithm" className="text-foreground" />
              </SelectTrigger>
              <SelectContent className="text-foreground">
                {algorithmOptions.map((algo) => (
                  <SelectItem key={algo} value={algo} className="text-foreground">
                    {algo}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        ) : (
          <div className="col-span-1 md:col-span-2" /> // Spacer for layout
        )}

        {/* Speed Slider */}
        <div className="flex flex-col gap-2 col-span-1 md:col-span-2">
          <Label htmlFor="speed-slider" className="text-sm font-medium text-foreground">
            Speed ({speed}ms)
          </Label>
          <Slider
            id="speed-slider"
            min={1}
            max={500}
            step={1}
            value={[speed]}
            onValueChange={(value) => onSpeedChange(value)}
            disabled={isSorting || isPausedForGuess || nextRoundCountdown !== null} // Disable during countdown
            className="w-full"
          />
        </div>

        {/* Array Size Slider */}
        <div className="flex flex-col gap-2 col-span-1 md:col-span-2">
          <Label htmlFor="array-size-slider" className="text-sm font-medium text-foreground">
            Array Size ({arraySize})
          </Label>
          <Slider
            id="array-size-slider"
            min={5}
            max={200}
            step={1}
            value={[arraySize]}
            onValueChange={(value) => onArraySizeChange(value)}
            disabled={isSorting || isPausedForGuess || nextRoundCountdown !== null} // Disable during countdown
            className="w-full"
          />
        </div>

        {/* Sound Toggle */}
        <div className="flex items-center gap-2 col-span-1 justify-start md:justify-center">
          {soundEnabled ? (
            <Volume2 className="w-5 h-5 text-foreground" />
          ) : (
            <VolumeX className="w-5 h-5 text-foreground" />
          )}
          <Switch
            id="sound-toggle"
            checked={soundEnabled}
            onCheckedChange={onToggleSound}
            disabled={isSorting || isPausedForGuess || nextRoundCountdown !== null} // Disable during countdown
          />
          <Label htmlFor="sound-toggle" className="text-sm font-medium text-foreground">
            Sound
          </Label>
        </div>

        {/* Game Mode Toggle */}
        <div className="flex items-center gap-2 col-span-1 justify-start md:justify-center">
          <Gamepad2 className="w-5 h-5 text-foreground" />
          <Switch
            id="game-mode-toggle"
            checked={gameModeEnabled}
            onCheckedChange={onGameModeToggle}
            disabled={isSorting || nextRoundCountdown !== null} // Disable during countdown
          />
          <Label htmlFor="game-mode-toggle" className="text-sm font-medium text-foreground">
            Game Mode
          </Label>
        </div>

        {/* Game Mode Type Selector (Visible only when game mode is enabled) */}
        {gameModeEnabled && (
          <div className="flex flex-col gap-2 col-span-1">
            <Label htmlFor="game-type-select" className="text-sm font-medium text-foreground sr-only">
              Game Type
            </Label>
            <Select
              value={gameModeType}
              onValueChange={onGameModeTypeChange}
              disabled={isSorting || isPausedForGuess || nextRoundCountdown !== null} // Disable during countdown
            >
              <SelectTrigger id="game-type-select" className="w-full text-foreground">
                <SelectValue placeholder="Select Game Type" className="text-foreground" />
              </SelectTrigger>
              <SelectContent className="text-foreground">
                <SelectItem value="swapCompare" className="text-foreground">
                  Guess the Swap/Compare
                </SelectItem>
                <SelectItem value="guessAlgorithm" className="text-foreground">
                  Guess the Algorithm
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Difficulty Selector (Visible only in Guess the Algorithm mode) */}
        {gameModeEnabled && gameModeType === "guessAlgorithm" && (
          <div className="flex flex-col gap-2 col-span-1">
            <Label htmlFor="difficulty-select" className="text-sm font-medium text-foreground sr-only">
              Difficulty
            </Label>
            <Select
              value={difficulty}
              onValueChange={onDifficultyChange}
              disabled={isSorting || isPausedForGuess || nextRoundCountdown !== null} // Disable during countdown
            >
              <SelectTrigger id="difficulty-select" className="w-full text-foreground">
                <SelectValue placeholder="Select Difficulty" className="text-foreground" />
              </SelectTrigger>
              <SelectContent className="text-foreground">
                {difficultyOptions.map((diff) => (
                  <SelectItem key={diff} value={diff.toLowerCase()} className="text-foreground">
                    {diff}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Score and Timer Display */}
        {gameModeEnabled && (
          <div className="col-span-1 flex flex-col items-center justify-center text-lg font-semibold text-foreground">
            <span>Score: {score}</span>
            {gameModeType === "guessAlgorithm" && isPausedForGuess && (
              <span className="text-red-500">Time: {timer}s</span>
            )}
          </div>
        )}

        {/* Buttons */}
        <div className="flex gap-2 col-span-full md:col-span-2 justify-center lg:justify-end">
          <Button
            onClick={() => onGenerateArray()}
            disabled={isSorting || isPausedForGuess || nextRoundCountdown !== null} // Disable during countdown
            variant="outline"
            className="flex items-center gap-2 bg-transparent text-foreground border-border hover:bg-accent hover:text-accent-foreground"
          >
            <RefreshCw className="w-4 h-4" />
            New Array
          </Button>
          {!isSorting && !isPausedForGuess && nextRoundCountdown === null ? ( // Only show Start if not sorting, not paused, and no countdown
            <Button
              onClick={onStartSort}
              disabled={isSorting || isPausedForGuess || nextRoundCountdown !== null}
              className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              <Play className="w-4 h-4" />
              {gameModeEnabled && gameModeType === "guessAlgorithm" ? "Start Game" : "Start Sorting"}
            </Button>
          ) : isPausedForGuess ? (
            <>
              {/* Hint button logic for Swap/Compare mode */}
              {gameModeEnabled && gameModeType === "swapCompare" && incorrectGuessesCount >= 2 && !showHint && (
                <Button
                  onClick={onGetHint}
                  disabled={isSorting || showHint || nextRoundCountdown !== null} // Disable during countdown
                  variant="outline"
                  className="flex items-center gap-2 bg-blue-100 text-blue-700 hover:bg-blue-200"
                >
                  <Lightbulb className="w-4 h-4" />
                  Hint
                </Button>
              )}
              {/* Submit Button for Swap/Compare mode */}
              {gameModeEnabled && gameModeType === "swapCompare" && (
                <Button
                  onClick={onSubmitGuess}
                  disabled={
                    !isPausedForGuess || userSelectedIndices.length !== 2 || showHint || nextRoundCountdown !== null
                  } // Disable during countdown
                  className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white"
                >
                  Submit Guess
                </Button>
              )}
              {/* Submit Button for Guess the Algorithm mode */}
              {gameModeEnabled && gameModeType === "guessAlgorithm" && (
                <Button
                  onClick={onSubmitAlgorithmGuess}
                  disabled={!isPausedForGuess || !userSelectedAlgorithm || nextRoundCountdown !== null} // Disable during countdown
                  className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white"
                >
                  Submit Guess
                </Button>
              )}
            </>
          ) : (
            <Button
              onClick={onStopSort}
              disabled={!isSorting && nextRoundCountdown === null} // Allow stopping if sorting or countdown is active
              variant="destructive"
              className="flex items-center gap-2"
            >
              <Pause className="w-4 h-4" />
              Stop Sorting
            </Button>
          )}
        </div>

        {/* Question and Feedback */}
        {(question || feedback || nextRoundCountdown !== null) && (
          <div className="col-span-full text-center mt-2">
            {question && <p className="text-lg font-medium text-foreground">{question}</p>}
            {feedback && (
              <p
                className={`text-md font-semibold ${feedback.includes("Correct") ? "text-green-600" : feedback.includes("Incorrect") || feedback.includes("Time's up") ? "text-red-600" : ""}`}
              >
                {feedback}
              </p>
            )}
            {nextRoundCountdown !== null && (
              <p className="text-lg font-semibold text-blue-500">Next round starts in {nextRoundCountdown}s...</p>
            )}
            {/* Algorithm Choices for Guess the Algorithm Mode */}
            {gameModeEnabled &&
              gameModeType === "guessAlgorithm" &&
              isPausedForGuess &&
              algorithmChoices.length > 0 && (
                <div className="flex flex-wrap justify-center gap-2 mt-4">
                  {algorithmChoices.map((choice) => (
                    <Button
                      key={choice}
                      variant={userSelectedAlgorithm === choice ? "default" : "outline"}
                      className={userSelectedAlgorithm === choice ? "bg-blue-500 text-white" : "text-foreground"}
                      onClick={() => onSelectAlgorithmChoice(choice)}
                      disabled={!isPausedForGuess || showHint || nextRoundCountdown !== null} // Disable during countdown
                    >
                      {choice}
                    </Button>
                  ))}
                </div>
              )}
          </div>
        )}
      </div>
    </div>
  )
}
