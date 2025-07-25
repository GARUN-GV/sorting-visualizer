import { compare, swap, markSorted, delay } from "./utils"

export async function quickSort(arrayRef, setArrayState, options) {
  const arr = arrayRef.current
  await _quickSort(arrayRef, 0, arr.length - 1, setArrayState, options)

  for (let i = 0; i < arr.length; i++) {
    await markSorted(arrayRef, i, setArrayState)
  }
  options.soundManager.playDone()
}

async function _quickSort(arrRef, low, high, setArrayState, options) {
  if (low < high) {
    if (!options.isSortingRef.current) return

    const pi = await partition(arrRef, low, high, setArrayState, options)
    if (pi === -1) return

    await _quickSort(arrRef, low, pi - 1, setArrayState, options)
    await _quickSort(arrRef, pi + 1, high, setArrayState, options)
  }
}

async function partition(arrRef, low, high, setArrayState, options) {
  const arr = arrRef.current
  const pivot = arr[high].value
  arr[high].status = "pivot"
  setArrayState([...arr])
  await delay(options.speed)

  let i = low - 1

  for (let j = low; j < high; j++) {
    if (!options.isSortingRef.current) {
      arr[high].status = "default"
      setArrayState([...arr])
      return -1
    }

    await compare(arrRef, j, high, setArrayState, options)

    if (arr[j].value <= pivot) {
      i++
      if (!(await swap(arrRef, i, j, setArrayState, options))) return -1
    }
  }

  if (!(await swap(arrRef, i + 1, high, setArrayState, options))) return -1
  arr[i + 1].status = "sorted"
  setArrayState([...arr])
  return i + 1
}
