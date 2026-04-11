import type { FavoriteItem } from '@/types/favorite'

const CARD_WIDTH = 1200
const CARD_HEIGHT = 1500

const TEXT_TO_IMAGE_STYLE_LABELS: Record<string, string> = {
  'ink-wash': '水墨写意',
  gongbi: '工笔细描',
  landscape: '山水古风',
  cartoon: 'Q版卡通',
  anime: '奇幻动漫',
  crayon: '蜡笔手绘',
}

const IMAGE_TO_TEXT_STYLE_LABELS: Record<string, string> = {
  poetry: '古风诗',
  prose: '词牌',
  story: '绝句',
  fu: '赋体',
}

interface ExportCardContent {
  accentColor: string
  badgeLabel: string
  bodyLines: string[]
  bodySectionLabel: string
  bodyTone: 'poem' | 'prose'
  imageSource: string
  imageSubtitle: string
  subtitle: string
  title: string
}

const cleanMarkdown = (text: string) => {
  return text
    .replace(/^#{1,6}\s*/gm, '')
    .replace(/\*\*(.*?)\*\*/g, '$1')
    .replace(/\*(.*?)\*/g, '$1')
    .replace(/^[-*]\s+/gm, '')
    .trim()
}

const clampTitle = (text: string, fallback: string) => {
  const trimmed = text.replace(/^《|》$/g, '').trim()

  if (!trimmed) {
    return fallback
  }

  return trimmed.length > 12 ? `${trimmed.slice(0, 12)}…` : trimmed
}

const truncateText = (text: string, maxLength: number) => {
  if (text.length <= maxLength) {
    return text
  }

  return `${text.slice(0, maxLength)}…`
}

const getTitleFromPrompt = (text: string) => {
  const firstLine = text
    .split('\n')
    .map((line) => line.trim())
    .find(Boolean)

  if (!firstLine) {
    return '寻诗入画'
  }

  const candidate = firstLine.split(/[，。！？；：,.!?;:]/)[0].trim()

  return clampTitle(candidate, '寻诗入画')
}

const parsePoetryMarkdown = (markdown: string) => {
  const normalized = markdown.replace(/\r/g, '').trim()
  const titleMatch = normalized.match(/^#{1,6}\s*《?([^》\n]+)》?/m)
  const moodMatch = normalized.match(/【意境】\s*([^*\n]+(?:\n[^*\n]+)*)/m)
  const title = clampTitle(titleMatch?.[1] ?? '', '览画成诗')

  const bodySource = normalized
    .replace(/^#{1,6}.*$/m, '')
    .replace(/\*?【意境】[\s\S]*$/m, '')

  const bodyLines = cleanMarkdown(bodySource)
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)

  const mood = moodMatch ? cleanMarkdown(moodMatch[1]) : ''

  return {
    bodyLines,
    mood,
    title,
  }
}

const wrapText = (ctx: CanvasRenderingContext2D, text: string, maxWidth: number) => {
  if (!text) {
    return ['']
  }

  const chars = Array.from(text)
  const lines: string[] = []
  let current = ''

  for (const char of chars) {
    const next = `${current}${char}`
    if (ctx.measureText(next).width <= maxWidth || current.length === 0) {
      current = next
    } else {
      lines.push(current)
      current = char
    }
  }

  if (current) {
    lines.push(current)
  }

  return lines
}

const normalizeBodyLines = (
  ctx: CanvasRenderingContext2D,
  lines: string[],
  maxWidth: number,
  maxLines: number
) => {
  const wrapped: string[] = []

  for (const line of lines) {
    const segments = wrapText(ctx, line, maxWidth)
    for (const segment of segments) {
      wrapped.push(segment)
      if (wrapped.length === maxLines) {
        break
      }
    }
    if (wrapped.length === maxLines) {
      break
    }
  }

  if (wrapped.length === maxLines) {
    const last = wrapped[maxLines - 1]
    if (last.length > 1) {
      wrapped[maxLines - 1] = `${last.slice(0, -1)}…`
    }
  }

  return wrapped
}

const roundRectPath = (
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number
) => {
  const safeRadius = Math.min(radius, width / 2, height / 2)
  ctx.beginPath()
  ctx.moveTo(x + safeRadius, y)
  ctx.arcTo(x + width, y, x + width, y + height, safeRadius)
  ctx.arcTo(x + width, y + height, x, y + height, safeRadius)
  ctx.arcTo(x, y + height, x, y, safeRadius)
  ctx.arcTo(x, y, x + width, y, safeRadius)
  ctx.closePath()
}

const drawRoundedRect = (
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number,
  fillStyle: string | CanvasGradient | CanvasPattern,
  strokeStyle?: string | CanvasGradient | CanvasPattern,
  lineWidth = 1
) => {
  roundRectPath(ctx, x, y, width, height, radius)
  ctx.fillStyle = fillStyle
  ctx.fill()

  if (strokeStyle) {
    ctx.strokeStyle = strokeStyle
    ctx.lineWidth = lineWidth
    ctx.stroke()
  }
}

const drawCoverImage = (
  ctx: CanvasRenderingContext2D,
  image: HTMLImageElement,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number
) => {
  ctx.save()
  roundRectPath(ctx, x, y, width, height, radius)
  ctx.clip()

  const scale = Math.max(width / image.width, height / image.height)
  const drawWidth = image.width * scale
  const drawHeight = image.height * scale
  const drawX = x + (width - drawWidth) / 2
  const drawY = y + (height - drawHeight) / 2

  ctx.drawImage(image, drawX, drawY, drawWidth, drawHeight)
  ctx.restore()
}

const formatDate = (timestamp: number) => {
  const date = new Date(timestamp)
  const year = date.getFullYear()
  const month = `${date.getMonth() + 1}`.padStart(2, '0')
  const day = `${date.getDate()}`.padStart(2, '0')

  return `${year}.${month}.${day}`
}

const isRemoteHttpImage = (src: string) => /^https?:\/\//i.test(src)

const getImageSourceForExport = (src: string) => {
  if (isRemoteHttpImage(src)) {
    return `/api/image-proxy?url=${encodeURIComponent(src)}`
  }

  return src
}

const loadImage = async (src: string) => {
  const image = new Image()
  image.crossOrigin = 'anonymous'
  image.decoding = 'async'

  return new Promise<HTMLImageElement>((resolve, reject) => {
    image.onload = () => resolve(image)
    image.onerror = () => reject(new Error('图片资源加载失败，暂时无法导出卡片'))
    image.src = src
  })
}

const buildCardContent = (item: FavoriteItem): ExportCardContent => {
  if (item.type === 'text-to-image') {
    const bodyLines = item.content
      .replace(/\r/g, '')
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean)

    return {
      accentColor: '#d67b60',
      badgeLabel: '寻诗入画',
      bodyLines,
      bodySectionLabel: '入画诗句',
      bodyTone: bodyLines.every((line) => line.length <= 16) ? 'poem' : 'prose',
      imageSource: item.result,
      imageSubtitle: 'AI 绘作',
      subtitle: TEXT_TO_IMAGE_STYLE_LABELS[item.style ?? ''] ?? '诗意成画',
      title: getTitleFromPrompt(item.content),
    }
  }

  const parsed = parsePoetryMarkdown(item.result)
  const poetryLines = parsed.bodyLines.length > 0 ? parsed.bodyLines : ['诗意正在酝酿。']
  const subtitle = IMAGE_TO_TEXT_STYLE_LABELS[item.style ?? ''] ?? 'AI 题诗'
  const imageSubtitle = parsed.mood ? `意境：${parsed.mood}` : '画中生诗'

  return {
    accentColor: '#64876c',
    badgeLabel: '览画成诗',
    bodyLines: poetryLines,
    bodySectionLabel: '题作诗句',
    bodyTone: 'poem',
    imageSource: item.content,
    imageSubtitle,
    subtitle,
    title: parsed.title,
  }
}

const fillBackground = (ctx: CanvasRenderingContext2D) => {
  const gradient = ctx.createLinearGradient(0, 0, 0, CARD_HEIGHT)
  gradient.addColorStop(0, '#fbf6ed')
  gradient.addColorStop(1, '#f2eadb')
  ctx.fillStyle = gradient
  ctx.fillRect(0, 0, CARD_WIDTH, CARD_HEIGHT)

  ctx.save()
  ctx.globalAlpha = 0.18
  const washA = ctx.createRadialGradient(220, 240, 10, 220, 240, 280)
  washA.addColorStop(0, '#f0d0c0')
  washA.addColorStop(1, 'rgba(240, 208, 192, 0)')
  ctx.fillStyle = washA
  ctx.fillRect(0, 0, CARD_WIDTH, CARD_HEIGHT)

  const washB = ctx.createRadialGradient(980, 1230, 10, 980, 1230, 320)
  washB.addColorStop(0, '#d0dfd2')
  washB.addColorStop(1, 'rgba(208, 223, 210, 0)')
  ctx.fillStyle = washB
  ctx.fillRect(0, 0, CARD_WIDTH, CARD_HEIGHT)
  ctx.restore()
}

const drawHeader = (ctx: CanvasRenderingContext2D, content: ExportCardContent) => {
  ctx.fillStyle = '#6b6257'
  ctx.font = "600 24px 'PingFang SC', 'Microsoft YaHei', sans-serif"
  ctx.textAlign = 'left'
  ctx.fillText('诗画传情', 118, 118)

  drawRoundedRect(ctx, 930, 82, 150, 48, 24, `${content.accentColor}22`, `${content.accentColor}66`, 2)
  ctx.fillStyle = content.accentColor
  ctx.font = "600 22px 'PingFang SC', 'Microsoft YaHei', sans-serif"
  ctx.textAlign = 'center'
  ctx.fillText(content.badgeLabel, 1005, 114)

  ctx.fillStyle = '#2e2a26'
  ctx.font = "700 60px 'STKaiti', 'KaiTi', 'Noto Serif SC', serif"
  ctx.textAlign = 'center'
  ctx.fillText(content.title, CARD_WIDTH / 2, 182)

  ctx.fillStyle = '#807567'
  ctx.font = "500 24px 'PingFang SC', 'Microsoft YaHei', sans-serif"
  ctx.fillText(content.subtitle, CARD_WIDTH / 2, 224)

  ctx.strokeStyle = `${content.accentColor}55`
  ctx.lineWidth = 3
  ctx.beginPath()
  ctx.moveTo(370, 244)
  ctx.lineTo(830, 244)
  ctx.stroke()
}

const drawFooter = (ctx: CanvasRenderingContext2D, content: ExportCardContent, createdAt: number) => {
  ctx.fillStyle = '#857a6d'
  ctx.font = "500 22px 'PingFang SC', 'Microsoft YaHei', sans-serif"
  ctx.textAlign = 'left'
  ctx.fillText(formatDate(createdAt), 122, 1384)

  ctx.fillStyle = '#988c7d'
  ctx.font = "500 20px 'PingFang SC', 'Microsoft YaHei', sans-serif"
  ctx.fillText(truncateText(content.imageSubtitle, 24), 122, 1420)

  ctx.save()
  drawRoundedRect(ctx, 1010, 1320, 84, 84, 16, '#ba3f32')
  ctx.translate(1052, 1362)
  ctx.rotate(-0.08)
  ctx.fillStyle = '#fff7f3'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.font = "700 26px 'STKaiti', 'KaiTi', serif"
  ctx.fillText('诗', 0, -14)
  ctx.fillText('画', 0, 16)
  ctx.restore()
}

const drawBodyPanel = (ctx: CanvasRenderingContext2D, content: ExportCardContent) => {
  const panelX = 116
  const panelY = 950
  const panelWidth = 968
  const panelHeight = 330

  drawRoundedRect(ctx, panelX, panelY, panelWidth, panelHeight, 30, 'rgba(255, 252, 245, 0.76)', 'rgba(133, 122, 109, 0.12)', 2)

  ctx.fillStyle = content.accentColor
  ctx.fillRect(panelX + 38, panelY + 42, 6, 40)

  ctx.fillStyle = '#5e574f'
  ctx.font = "600 24px 'PingFang SC', 'Microsoft YaHei', sans-serif"
  ctx.textAlign = 'left'
  ctx.fillText(content.bodySectionLabel, panelX + 62, panelY + 70)

  ctx.fillStyle = '#403932'
  ctx.font =
    content.bodyTone === 'poem'
      ? "500 38px 'STKaiti', 'KaiTi', 'Noto Serif SC', serif"
      : "500 30px 'PingFang SC', 'Microsoft YaHei', sans-serif"

  const maxTextWidth = panelWidth - 120
  const wrappedLines = normalizeBodyLines(
    ctx,
    content.bodyLines,
    content.bodyTone === 'poem' ? 420 : maxTextWidth,
    content.bodyTone === 'poem' ? 6 : 8
  )

  const lineHeight = content.bodyTone === 'poem' ? 62 : 46
  let startY = panelY + 136

  if (content.bodyTone === 'poem') {
    ctx.textAlign = 'center'
    for (const line of wrappedLines) {
      ctx.fillText(line, CARD_WIDTH / 2, startY)
      startY += lineHeight
    }
  } else {
    ctx.textAlign = 'left'
    for (const line of wrappedLines) {
      ctx.fillText(line, panelX + 58, startY)
      startY += lineHeight
    }
  }
}

const drawImagePanel = (ctx: CanvasRenderingContext2D, image: HTMLImageElement, accentColor: string) => {
  const frameX = 116
  const frameY = 286
  const frameWidth = 968
  const frameHeight = 590

  ctx.save()
  ctx.shadowColor = 'rgba(93, 80, 65, 0.16)'
  ctx.shadowBlur = 30
  ctx.shadowOffsetY = 18
  drawRoundedRect(ctx, frameX, frameY, frameWidth, frameHeight, 34, '#fff8ef')
  ctx.restore()

  drawRoundedRect(ctx, frameX + 22, frameY + 22, frameWidth - 44, frameHeight - 44, 26, '#f7f1e6', `${accentColor}55`, 2)
  drawCoverImage(ctx, image, frameX + 38, frameY + 38, frameWidth - 76, frameHeight - 76, 22)

  const ribbonGradient = ctx.createLinearGradient(frameX + 64, frameY + 470, frameX + 280, frameY + 470)
  ribbonGradient.addColorStop(0, `${accentColor}dd`)
  ribbonGradient.addColorStop(1, `${accentColor}88`)
  drawRoundedRect(ctx, frameX + 54, frameY + 458, 218, 52, 18, ribbonGradient)

  ctx.fillStyle = '#fff9f2'
  ctx.font = "600 22px 'PingFang SC', 'Microsoft YaHei', sans-serif"
  ctx.textAlign = 'center'
  ctx.fillText('AI 灵感卡片', frameX + 163, frameY + 492)
}

const canvasToBlob = async (canvas: HTMLCanvasElement) => {
  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) {
        resolve(blob)
        return
      }

      reject(new Error('导出失败，图片生成未完成'))
    }, 'image/png')
  })
}

const downloadBlob = (blob: Blob, filename: string) => {
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = filename
  anchor.click()
  URL.revokeObjectURL(url)
}

export const exportFavoriteCard = async (item: FavoriteItem) => {
  await document.fonts?.ready

  const content = buildCardContent(item)
  const image = await loadImage(getImageSourceForExport(content.imageSource))
  const canvas = document.createElement('canvas')
  canvas.width = CARD_WIDTH
  canvas.height = CARD_HEIGHT

  const ctx = canvas.getContext('2d')

  if (!ctx) {
    throw new Error('当前浏览器不支持卡片导出')
  }

  fillBackground(ctx)
  drawHeader(ctx, content)
  drawImagePanel(ctx, image, content.accentColor)
  drawBodyPanel(ctx, content)
  drawFooter(ctx, content, item.createdAt)

  const blob = await canvasToBlob(canvas)
  const safeTitle = truncateText(content.title, 10).replace(/[\\/:*?"<>|《》\s]+/g, '') || content.badgeLabel
  const filename = `诗画传情-${content.badgeLabel}-${safeTitle}-${item.id}.png`
  downloadBlob(blob, filename)
}
