import type { FavoriteItem } from '@/types/favorite'

const CARD_WIDTH = 1200
const MIN_CARD_HEIGHT = 1500
const CLOSING_PUNCTUATION = new Set(Array.from('，。！？；：、）》】」』,.!?;:)]'))

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
  showTitle: boolean
  subtitle: string
  title: string
}

interface MeasuredTextLayout {
  fontSize: number
  lineHeight: number
  lines: string[]
}

interface ExportCardLayout {
  body: MeasuredTextLayout
  bodyPanelHeight: number
  bodyPanelY: number
  bodyTextStartY: number
  cardHeight: number
  footerSubtitle: MeasuredTextLayout
  footerSubtitleY: number
  footerTop: number
  imagePanelHeight: number
  imagePanelY: number
  subtitleY: number
  title: MeasuredTextLayout
  titleTop: number
}

const cleanMarkdown = (text: string) => {
  return text
    .replace(/^#{1,6}\s*/gm, '')
    .replace(/\*\*(.*?)\*\*/g, '$1')
    .replace(/\*(.*?)\*/g, '$1')
    .replace(/^[-*]\s+/gm, '')
    .trim()
}

const normalizeTitle = (text: string, fallback: string) => {
  const trimmed = text.replace(/^《|》$/g, '').trim()
  return trimmed || fallback
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

  return normalizeTitle(firstLine.replace(/[，。！？；：,.!?;:]+$/g, ''), '寻诗入画')
}

const parsePoetryMarkdown = (markdown: string) => {
  const normalized = markdown.replace(/\r/g, '').trim()
  const titleMatch = normalized.match(/^#{1,6}\s*《?([^》\n]+)》?/m)
  const moodMatch = normalized.match(/【意境】\s*([^*\n]+(?:\n[^*\n]+)*)/m)
  const title = normalizeTitle(titleMatch?.[1] ?? '', '览画成诗')

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

const setSansFont = (ctx: CanvasRenderingContext2D, weight: number, fontSize: number) => {
  ctx.font = `${weight} ${fontSize}px 'PingFang SC', 'Microsoft YaHei', sans-serif`
}

const setSerifFont = (ctx: CanvasRenderingContext2D, weight: number, fontSize: number) => {
  ctx.font = `${weight} ${fontSize}px 'STKaiti', 'KaiTi', 'Noto Serif SC', serif`
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
      continue
    }

    if (CLOSING_PUNCTUATION.has(char) && current.length > 1) {
      const currentChars = Array.from(current)
      const carry = currentChars.pop() ?? ''
      const line = currentChars.join('')
      lines.push(line || current)
      current = `${carry}${char}`
      continue
    }

    lines.push(current)
    current = char
  }

  if (current) {
    lines.push(current)
  }

  return lines
}

const wrapContentLines = (
  ctx: CanvasRenderingContext2D,
  lines: string[],
  maxWidth: number
) => {
  const wrapped: string[] = []

  for (const line of lines) {
    if (!line) {
      wrapped.push('')
      continue
    }

    wrapped.push(...wrapText(ctx, line, maxWidth))
  }

  return wrapped.length > 0 ? wrapped : ['']
}

const measureTitleLayout = (ctx: CanvasRenderingContext2D, title: string): MeasuredTextLayout => {
  const fontSizes = [60, 56, 52, 48, 44, 40]

  for (const fontSize of fontSizes) {
    setSerifFont(ctx, 700, fontSize)
    const lines = wrapText(ctx, title, 760)

    if (lines.length <= 3 || fontSize === fontSizes[fontSizes.length - 1]) {
      return {
        fontSize,
        lineHeight: Math.round(fontSize * 1.28),
        lines,
      }
    }
  }

  return {
    fontSize: 40,
    lineHeight: 52,
    lines: wrapText(ctx, title, 760),
  }
}

const measureBodyLayout = (
  ctx: CanvasRenderingContext2D,
  content: ExportCardContent
): MeasuredTextLayout => {
  const candidates = content.bodyTone === 'poem'
    ? [
        { fontSize: 38, lineHeight: 60, maxWidth: 640, targetLines: 6 },
        { fontSize: 34, lineHeight: 54, maxWidth: 720, targetLines: 8 },
        { fontSize: 30, lineHeight: 48, maxWidth: 800, targetLines: 10 },
      ]
    : [
        { fontSize: 30, lineHeight: 46, maxWidth: 848, targetLines: 8 },
        { fontSize: 28, lineHeight: 42, maxWidth: 860, targetLines: 10 },
        { fontSize: 26, lineHeight: 38, maxWidth: 872, targetLines: 12 },
      ]

  for (const candidate of candidates) {
    if (content.bodyTone === 'poem') {
      setSerifFont(ctx, 500, candidate.fontSize)
    } else {
      setSansFont(ctx, 500, candidate.fontSize)
    }

    const lines = wrapContentLines(ctx, content.bodyLines, candidate.maxWidth)

    if (lines.length <= candidate.targetLines || candidate === candidates[candidates.length - 1]) {
      return {
        fontSize: candidate.fontSize,
        lineHeight: candidate.lineHeight,
        lines,
      }
    }
  }

  return {
    fontSize: content.bodyTone === 'poem' ? 30 : 26,
    lineHeight: content.bodyTone === 'poem' ? 48 : 38,
    lines: content.bodyLines,
  }
}

const measureFooterSubtitleLayout = (
  ctx: CanvasRenderingContext2D,
  subtitle: string
): MeasuredTextLayout => {
  const fontSizes = [20, 18]

  for (const fontSize of fontSizes) {
    setSansFont(ctx, 500, fontSize)
    const lines = wrapText(ctx, subtitle, 760)

    if (lines.length <= 2 || fontSize === fontSizes[fontSizes.length - 1]) {
      return {
        fontSize,
        lineHeight: Math.round(fontSize * 1.45),
        lines,
      }
    }
  }

  return {
    fontSize: 18,
    lineHeight: 26,
    lines: wrapText(ctx, subtitle, 760),
  }
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

const drawContainedImage = (
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

  const backgroundGradient = ctx.createLinearGradient(x, y, x, y + height)
  backgroundGradient.addColorStop(0, 'rgba(250, 246, 238, 0.98)')
  backgroundGradient.addColorStop(1, 'rgba(242, 235, 223, 0.98)')
  ctx.fillStyle = backgroundGradient
  ctx.fillRect(x, y, width, height)

  ctx.save()
  ctx.globalAlpha = 0.2
  ctx.filter = 'blur(22px)'
  const backgroundScale = Math.max(width / image.width, height / image.height)
  const backgroundWidth = image.width * backgroundScale
  const backgroundHeight = image.height * backgroundScale
  const backgroundX = x + (width - backgroundWidth) / 2
  const backgroundY = y + (height - backgroundHeight) / 2
  ctx.drawImage(image, backgroundX, backgroundY, backgroundWidth, backgroundHeight)
  ctx.restore()

  ctx.fillStyle = 'rgba(255, 250, 244, 0.3)'
  ctx.fillRect(x, y, width, height)

  const inset = 18
  const availableWidth = Math.max(width - inset * 2, 1)
  const availableHeight = Math.max(height - inset * 2, 1)
  const scale = Math.min(availableWidth / image.width, availableHeight / image.height)
  const drawWidth = image.width * scale
  const drawHeight = image.height * scale
  const drawX = x + (width - drawWidth) / 2
  const drawY = y + (height - drawHeight) / 2
  const mattePadding = 10
  const matteX = Math.max(x + 10, drawX - mattePadding)
  const matteY = Math.max(y + 10, drawY - mattePadding)
  const matteRight = Math.min(x + width - 10, drawX + drawWidth + mattePadding)
  const matteBottom = Math.min(y + height - 10, drawY + drawHeight + mattePadding)
  const matteWidth = Math.max(matteRight - matteX, drawWidth)
  const matteHeight = Math.max(matteBottom - matteY, drawHeight)

  ctx.save()
  ctx.shadowColor = 'rgba(91, 77, 58, 0.14)'
  ctx.shadowBlur = 20
  ctx.shadowOffsetY = 12
  drawRoundedRect(ctx, matteX, matteY, matteWidth, matteHeight, 20, 'rgba(255, 252, 247, 0.92)')
  ctx.restore()

  ctx.save()
  roundRectPath(ctx, drawX, drawY, drawWidth, drawHeight, 16)
  ctx.clip()
  ctx.drawImage(image, drawX, drawY, drawWidth, drawHeight)
  ctx.restore()

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

    const looksLikePoem = bodyLines.length > 1 || bodyLines.every((line) => line.length <= 18)

    return {
      accentColor: '#d67b60',
      badgeLabel: '寻诗入画',
      bodyLines,
      bodySectionLabel: '入画诗句',
      bodyTone: looksLikePoem ? 'poem' : 'prose',
      imageSource: item.result,
      imageSubtitle: 'AI 绘作',
      showTitle: false,
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
    showTitle: true,
    subtitle,
    title: parsed.title,
  }
}

const calculateLayout = (
  ctx: CanvasRenderingContext2D,
  content: ExportCardContent
): ExportCardLayout => {
  const title = content.showTitle
    ? measureTitleLayout(ctx, content.title)
    : { fontSize: 0, lineHeight: 0, lines: [] }
  const body = measureBodyLayout(ctx, content)
  const footerSubtitle = measureFooterSubtitleLayout(ctx, content.imageSubtitle)

  const titleTop = content.showTitle ? 172 : 0
  const titleHeight = content.showTitle ? title.lines.length * title.lineHeight : 0
  const subtitleY = content.showTitle ? titleTop + titleHeight + 16 : 176
  const dividerY = subtitleY + (content.showTitle ? 26 : 22)
  const imagePanelY = dividerY + (content.showTitle ? 44 : 30)
  const imagePanelHeight = content.showTitle ? 590 : 620
  const bodyPanelY = imagePanelY + imagePanelHeight + (content.showTitle ? 70 : 56)
  const bodyTextStartY = bodyPanelY + 138
  const bodyPanelHeight = Math.max(330, 138 + body.lines.length * body.lineHeight + 52)
  const footerTop = bodyPanelY + bodyPanelHeight + 42
  const footerSubtitleY = footerTop + 72
  const footerHeight = Math.max(132, 72 + footerSubtitle.lines.length * footerSubtitle.lineHeight + 26)
  const cardHeight = Math.max(MIN_CARD_HEIGHT, footerTop + footerHeight)

  return {
    body,
    bodyPanelHeight,
    bodyPanelY,
    bodyTextStartY,
    cardHeight,
    footerSubtitle,
    footerSubtitleY,
    footerTop,
    imagePanelHeight,
    imagePanelY,
    subtitleY,
    title,
    titleTop,
  }
}

const fillBackground = (ctx: CanvasRenderingContext2D, cardHeight: number) => {
  const gradient = ctx.createLinearGradient(0, 0, 0, cardHeight)
  gradient.addColorStop(0, '#fbf6ed')
  gradient.addColorStop(1, '#f2eadb')
  ctx.fillStyle = gradient
  ctx.fillRect(0, 0, CARD_WIDTH, cardHeight)

  ctx.save()
  ctx.globalAlpha = 0.18
  const washA = ctx.createRadialGradient(220, 240, 10, 220, 240, 280)
  washA.addColorStop(0, '#f0d0c0')
  washA.addColorStop(1, 'rgba(240, 208, 192, 0)')
  ctx.fillStyle = washA
  ctx.fillRect(0, 0, CARD_WIDTH, cardHeight)

  const washBY = Math.max(cardHeight - 270, 980)
  const washB = ctx.createRadialGradient(980, washBY, 10, 980, washBY, 320)
  washB.addColorStop(0, '#d0dfd2')
  washB.addColorStop(1, 'rgba(208, 223, 210, 0)')
  ctx.fillStyle = washB
  ctx.fillRect(0, 0, CARD_WIDTH, cardHeight)
  ctx.restore()
}

const drawHeader = (
  ctx: CanvasRenderingContext2D,
  content: ExportCardContent,
  layout: ExportCardLayout
) => {
  ctx.fillStyle = '#6b6257'
  setSansFont(ctx, 600, 24)
  ctx.textAlign = 'left'
  ctx.fillText('诗画传情', 118, 118)

  drawRoundedRect(ctx, 930, 82, 150, 48, 24, `${content.accentColor}22`, `${content.accentColor}66`, 2)
  ctx.fillStyle = content.accentColor
  setSansFont(ctx, 600, 22)
  ctx.textAlign = 'center'
  ctx.fillText(content.badgeLabel, 1005, 114)

  if (content.showTitle) {
    ctx.fillStyle = '#2e2a26'
    setSerifFont(ctx, 700, layout.title.fontSize)
    let titleY = layout.titleTop
    for (const line of layout.title.lines) {
      ctx.fillText(line, CARD_WIDTH / 2, titleY)
      titleY += layout.title.lineHeight
    }
  }

  ctx.fillStyle = '#807567'
  setSansFont(ctx, 500, content.showTitle ? 24 : 26)
  ctx.fillText(content.subtitle, CARD_WIDTH / 2, layout.subtitleY)

  ctx.strokeStyle = `${content.accentColor}55`
  ctx.lineWidth = 3
  ctx.beginPath()
  ctx.moveTo(370, layout.subtitleY + 20)
  ctx.lineTo(830, layout.subtitleY + 20)
  ctx.stroke()
}

const drawFooter = (
  ctx: CanvasRenderingContext2D,
  content: ExportCardContent,
  createdAt: number,
  layout: ExportCardLayout
) => {
  ctx.fillStyle = '#857a6d'
  setSansFont(ctx, 500, 22)
  ctx.textAlign = 'left'
  ctx.fillText(formatDate(createdAt), 122, layout.footerTop + 38)

  ctx.fillStyle = '#988c7d'
  setSansFont(ctx, 500, layout.footerSubtitle.fontSize)
  let subtitleY = layout.footerSubtitleY
  for (const line of layout.footerSubtitle.lines) {
    ctx.fillText(line, 122, subtitleY)
    subtitleY += layout.footerSubtitle.lineHeight
  }

  ctx.save()
  drawRoundedRect(ctx, 1010, layout.footerTop, 84, 84, 16, '#ba3f32')
  ctx.translate(1052, layout.footerTop + 42)
  ctx.rotate(-0.08)
  ctx.fillStyle = '#fff7f3'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  setSerifFont(ctx, 700, 26)
  ctx.fillText('诗', 0, -14)
  ctx.fillText('画', 0, 16)
  ctx.restore()
}

const drawBodyPanel = (
  ctx: CanvasRenderingContext2D,
  content: ExportCardContent,
  layout: ExportCardLayout
) => {
  const panelX = 116
  const panelWidth = 968

  drawRoundedRect(
    ctx,
    panelX,
    layout.bodyPanelY,
    panelWidth,
    layout.bodyPanelHeight,
    30,
    'rgba(255, 252, 245, 0.76)',
    'rgba(133, 122, 109, 0.12)',
    2
  )

  ctx.fillStyle = content.accentColor
  ctx.fillRect(panelX + 38, layout.bodyPanelY + 42, 6, 40)

  ctx.fillStyle = '#5e574f'
  setSansFont(ctx, 600, 24)
  ctx.textAlign = 'left'
  ctx.fillText(content.bodySectionLabel, panelX + 62, layout.bodyPanelY + 70)

  ctx.fillStyle = '#403932'

  if (content.bodyTone === 'poem') {
    setSerifFont(ctx, 500, layout.body.fontSize)
    ctx.textAlign = 'center'

    let lineY = layout.bodyTextStartY
    for (const line of layout.body.lines) {
      ctx.fillText(line, CARD_WIDTH / 2, lineY)
      lineY += layout.body.lineHeight
    }
    return
  }

  setSansFont(ctx, 500, layout.body.fontSize)
  ctx.textAlign = 'left'

  let lineY = layout.bodyTextStartY
  for (const line of layout.body.lines) {
    ctx.fillText(line, panelX + 58, lineY)
    lineY += layout.body.lineHeight
  }
}

const drawImagePanel = (
  ctx: CanvasRenderingContext2D,
  image: HTMLImageElement,
  accentColor: string,
  layout: ExportCardLayout
) => {
  const frameX = 116
  const frameWidth = 968

  ctx.save()
  ctx.shadowColor = 'rgba(93, 80, 65, 0.16)'
  ctx.shadowBlur = 30
  ctx.shadowOffsetY = 18
  drawRoundedRect(ctx, frameX, layout.imagePanelY, frameWidth, layout.imagePanelHeight, 34, '#fff8ef')
  ctx.restore()

  drawRoundedRect(
    ctx,
    frameX + 22,
    layout.imagePanelY + 22,
    frameWidth - 44,
    layout.imagePanelHeight - 44,
    26,
    '#f7f1e6',
    `${accentColor}55`,
    2
  )
  drawContainedImage(
    ctx,
    image,
    frameX + 38,
    layout.imagePanelY + 38,
    frameWidth - 76,
    layout.imagePanelHeight - 76,
    22
  )

  const ribbonGradient = ctx.createLinearGradient(
    frameX + 64,
    layout.imagePanelY + 470,
    frameX + 280,
    layout.imagePanelY + 470
  )
  ribbonGradient.addColorStop(0, `${accentColor}dd`)
  ribbonGradient.addColorStop(1, `${accentColor}88`)
  drawRoundedRect(ctx, frameX + 54, layout.imagePanelY + 458, 218, 52, 18, ribbonGradient)

  ctx.fillStyle = '#fff9f2'
  setSansFont(ctx, 600, 22)
  ctx.textAlign = 'center'
  ctx.fillText('AI 灵感卡片', frameX + 163, layout.imagePanelY + 492)
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
  const measureCanvas = document.createElement('canvas')
  measureCanvas.width = CARD_WIDTH
  measureCanvas.height = MIN_CARD_HEIGHT

  const measureCtx = measureCanvas.getContext('2d')

  if (!measureCtx) {
    throw new Error('当前浏览器不支持卡片导出')
  }

  const layout = calculateLayout(measureCtx, content)

  canvas.width = CARD_WIDTH
  canvas.height = layout.cardHeight

  const ctx = canvas.getContext('2d')

  if (!ctx) {
    throw new Error('当前浏览器不支持卡片导出')
  }

  fillBackground(ctx, layout.cardHeight)
  drawHeader(ctx, content, layout)
  drawImagePanel(ctx, image, content.accentColor, layout)
  drawBodyPanel(ctx, content, layout)
  drawFooter(ctx, content, item.createdAt, layout)

  const blob = await canvasToBlob(canvas)
  const safeTitle = truncateText(content.title, 10).replace(/[\\/:*?"<>|《》\s]+/g, '') || content.badgeLabel
  const filename = `诗画传情-${content.badgeLabel}-${safeTitle}-${item.id}.png`
  downloadBlob(blob, filename)
}
