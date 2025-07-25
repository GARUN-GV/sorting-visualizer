export const generateRandomArray = (size, min, max) => {
    const array = []
    for (let i = 0; i < size; i++) {
      array.push({
        value: Math.floor(Math.random() * (max - min + 1)) + min,
        status: "default",
      })
    }
    return array
  }
  