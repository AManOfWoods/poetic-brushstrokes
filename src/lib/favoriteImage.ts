const MAX_FAVORITE_IMAGE_BYTES = 900 * 1024
const MAX_FAVORITE_IMAGE_DIMENSION = 1600
const JPEG_QUALITIES = [0.9, 0.82, 0.74, 0.66, 0.58]
const SCALE_STEPS = [1, 0.92, 0.84, 0.76, 0.68]

const readFileAsDataUrl = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = () => reject(new Error('读取图片失败，请重试'))
    reader.readAsDataURL(file)
  })
}

const loadImage = (src: string): Promise<HTMLImageElement> => {
  return new Promise((resolve, reject) => {
    const image = new Image()
    image.onload = () => resolve(image)
    image.onerror = () => reject(new Error('加载图片失败，请重试'))
    image.src = src
  })
}

const estimateDataUrlBytes = (dataUrl: string): number => {
  const base64 = dataUrl.split(',')[1] ?? ''
  return Math.floor((base64.length * 3) / 4)
}

export const prepareFavoriteImage = async (file: File): Promise<string> => {
  const originalDataUrl = await readFileAsDataUrl(file)

  if (estimateDataUrlBytes(originalDataUrl) <= MAX_FAVORITE_IMAGE_BYTES) {
    return originalDataUrl
  }

  const image = await loadImage(originalDataUrl)
  const baseScale = Math.min(1, MAX_FAVORITE_IMAGE_DIMENSION / Math.max(image.naturalWidth, image.naturalHeight))
  const canvas = document.createElement('canvas')
  const context = canvas.getContext('2d')

  if (!context) {
    throw new Error('图片处理失败，请重试')
  }

  for (const scaleStep of SCALE_STEPS) {
    const scale = baseScale * scaleStep
    canvas.width = Math.max(1, Math.round(image.naturalWidth * scale))
    canvas.height = Math.max(1, Math.round(image.naturalHeight * scale))

    context.clearRect(0, 0, canvas.width, canvas.height)
    context.fillStyle = '#ffffff'
    context.fillRect(0, 0, canvas.width, canvas.height)
    context.drawImage(image, 0, 0, canvas.width, canvas.height)

    for (const quality of JPEG_QUALITIES) {
      const compressedDataUrl = canvas.toDataURL('image/jpeg', quality)
      if (estimateDataUrlBytes(compressedDataUrl) <= MAX_FAVORITE_IMAGE_BYTES) {
        return compressedDataUrl
      }
    }
  }

  const fallbackDataUrl = canvas.toDataURL('image/jpeg', 0.5)
  if (estimateDataUrlBytes(fallbackDataUrl) <= MAX_FAVORITE_IMAGE_BYTES) {
    return fallbackDataUrl
  }

  throw new Error('图片过大，无法收藏，请换一张图片或缩小后重试')
}
