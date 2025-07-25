import { compare, swap, markSorted, delay } from "./utils"

export async function selectionSort(arrayRef, setArrayState, options) {
  const arr = arrayRef.current
  const n = arr.length

  for (let i = 0; i < n - 1; i++) {
    let minIdx = i
    arr[minIdx].status = "min"
    setArrayState([...arr])
    await delay(options.speed)

    for (let j = i + 1; j < n; j++) {
      if (!options.isSortingRef.current) return

      await compare(arrayRef, minIdx, j, setArrayState, options)
      arr[minIdx].status = "min"
      setArrayState([...arr])
      if (arr[j].value < arr[minIdx].value) {
        if (minIdx !== i) {
          arr[minIdx].status = "default"
        }
        minIdx = j
        arr[minIdx].status = "min"
        setArrayState([...arr])
        await delay(options.speed)
      }
    }

    if (minIdx !== i) {
      if (!(await swap(arrayRef, i, minIdx, setArrayState, options))) return
    }
    await markSorted(arrayRef, i, setArrayState)
    arr[minIdx].status = "default"
    setArrayState([...arr])
  }
  await markSorted(arrayRef, n - 1, setArrayState)
  options.soundManager.playDone()
}
