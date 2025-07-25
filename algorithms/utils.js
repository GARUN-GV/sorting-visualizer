export const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

export async function swap(arrRef, i, j, setArrayState, options) {
  if (!options.isSortingRef.current) return false

  const arr = arrRef.current

  if (options.gameModeEnabled) {
    await options.pauseForGuess([i, j], "swapped")
    if (!options.isSortingRef.current) return false // Check again after pause
  }
  ;[arr[i].value, arr[j].value] = [arr[j].value, arr[i].value]

  arr[i].status = "swapping"
  arr[j].status = "swapping"
  setArrayState([...arr])
  options.soundManager.playSwap()
  await delay(options.speed)

  arr[i].status = "default"
  arr[j].status = "default"
  setArrayState([...arr])

  return true
}

export async function compare(arrRef, i, j, setArrayState, options) {
  if (!options.isSortingRef.current) return false

  const arr = arrRef.current

  if (options.gameModeEnabled) {
    await options.pauseForGuess([i, j], "compared")
    if (!options.isSortingRef.current) return false // Check again after pause
  }

  arr[i].status = "comparing"
  arr[j].status = "comparing"
  setArrayState([...arr])
  options.soundManager.playCompare()
  await delay(options.speed)

  arr[i].status = "default"
  arr[j].status = "default"
  setArrayState([...arr])
  return true
}

export async function markSorted(arrRef, index, setArrayState) {
  const arr = arrRef.current
  arr[index].status = "sorted"
  setArrayState([...arr])
}
