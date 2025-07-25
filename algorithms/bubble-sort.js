import { compare, swap, markSorted } from "./utils"

export async function bubbleSort(arrayRef, setArrayState, options) {
  const arr = arrayRef.current
  const n = arr.length

  for (let i = 0; i < n - 1; i++) {
    for (let j = 0; j < n - i - 1; j++) {
      if (!options.isSortingRef.current) return

      await compare(arrayRef, j, j + 1, setArrayState, options)

      if (arr[j].value > arr[j + 1].value) {
        if (!(await swap(arrayRef, j, j + 1, setArrayState, options))) return
      }
    }
    await markSorted(arrayRef, n - 1 - i, setArrayState)
  }
  await markSorted(arrayRef, 0, setArrayState)
  options.soundManager.playDone()
}
