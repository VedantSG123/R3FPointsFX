export const generateRandomnessArray = (size: number, max: number = 1) => {
  const length = size * 3
  const data = new Float32Array(length)

  for (let i = 0; i < length; i++) {
    const stride = i * 3

    data[stride] = Math.random() * max
    data[stride + 1] = Math.random() * max
    data[stride + 2] = Math.random() * max
  }
  return data
}
