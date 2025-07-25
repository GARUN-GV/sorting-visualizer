
import { delay } from "./utils"

export async function mergeSort(arrayRef, setArrayState, options) {
  const arr = arrayRef.current
  await _mergeSort(arrayRef, 0, arr.length - 1, setArrayState, options)

  for (let i = 0; i < arr.length; i++) {
    arr[i].status = "sorted"
  }
  setArrayState([...arr])
  options.soundManager.playDone()
}

async function _mergeSort(arrRef, low, high, setArrayState, options) {
  if (low < high) {
    if (!options.isSortingRef.current) return

    const mid = Math.floor((low + high) / 2)
    await _mergeSort(arrRef, low, mid, setArrayState, options)
    await _mergeSort(arrRef, mid + 1, high, setArrayState, options)
    await merge(arrRef, low, mid, high, setArrayState, options)
  }
}

async function merge(arrRef, low, mid, high, setArrayState, options) {
  const arr = arrRef.current
  const temp = []
  let i = low
  let j = mid + 1
  let k = 0

  while (i <= mid && j <= high) {
    if (!options.isSortingRef.current) return

    arr[i].status = "comparing"
    arr[j].status = "comparing"
    setArrayState([...arr])
    options.soundManager.playCompare()
    await delay(options.speed)

    if (arr[i].value <= arr[j].value) {
      temp[k++] = arr[i++]
    } else {
      temp[k++] = arr[j++]
    }

    if (i - 1 >= low) arr[i - 1].status = "default"
    if (j - 1 >= mid + 1) arr[j - 1].status = "default"
    setArrayState([...arr])
  }

  while (i <= mid) {
    if (!options.isSortingRef.current) return
    temp[k++] = arr[i++]
  }

  while (j <= high) {
    if (!options.isSortingRef.current) return
    temp[k++] = arr[j++]
  }

  for (let l = low; l <= high; l++) {
    if (!options.isSortingRef.current) return
    arr[l] = temp[l - low]

    arr[l].status = "swapping"
    setArrayState([...arr])
    options.soundManager.playSwap()
    await delay(options.speed / 2)

    arr[l].status = "default"
    setArrayState([...arr])
  }
}
