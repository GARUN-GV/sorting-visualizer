import { markSorted, delay } from "./utils"

export async function insertionSort(arrayRef, setArrayState, options) {
  const arr = arrayRef.current
  const n = arr.length

  for (let i = 1; i < n; i++) {
    let j = i - 1
    const key = arr[i].value

    arr[i].status = "comparing"
    setArrayState([...arr])
    await delay(options.speed)

    while (j >= 0 && arr[j].value > key) {
      if (!options.isSortingRef.current) return

      arr[j].status = "comparing"
      arr[j + 1].status = "comparing"
      setArrayState([...arr])
      options.soundManager.playCompare()
      await delay(options.speed)

      arr[j + 1].value = arr[j].value
      arr[j + 1].status = "swapping"
      arr[j].status = "default"
      setArrayState([...arr])
      options.soundManager.playSwap()
      await delay(options.speed)

      arr[j + 1].status = "default"
      setArrayState([...arr])

      j = j - 1
    }
    arr[j + 1].value = key
    arr[j + 1].status = "default"
    setArrayState([...arr])
  }

  for (let k = 0; k < n; k++) {
    await markSorted(arrayRef, k, setArrayState)
  }
  options.soundManager.playDone()
}
