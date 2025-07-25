"use client"

import { Howl } from "howler"

export function createSoundManager() {
  const compareSound = new Howl({
    src: ["/sounds/compare.mp3"],
    volume: 0.1,
  })

  const swapSound = new Howl({
    src: ["/sounds/swap.mp3"],
    volume: 0.2,
  })

  const doneSound = new Howl({
    src: ["/sounds/done.mp3"],
    volume: 0.3,
  })

  let soundEnabled = true

  const playCompare = () => {
    if (soundEnabled) {
      compareSound.play()
    }
  }

  const playSwap = () => {
    if (soundEnabled) {
      swapSound.play()
    }
  }

  const playDone = () => {
    if (soundEnabled) {
      doneSound.play()
    }
  }

  const setSoundEnabled = (enabled) => {
    soundEnabled = enabled
  }

  const stopAllSounds = () => {
    compareSound.stop()
    swapSound.stop()
    doneSound.stop()
  }

  return {
    playCompare,
    playSwap,
    playDone,
    setSoundEnabled,
    stopAllSounds,
  }
}
