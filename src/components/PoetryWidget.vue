<template>
  <div
    ref="widgetRef"
    class="fixed z-50 w-96 poetry-widget backdrop-blur-xl rounded-2xl shadow-2xl border border-white/40"
    :style="{
      left: `${position.x}px`,
      top: `${position.y}px`,
      cursor: isDragging ? 'grabbing' : 'grab',
    }"
    @mousedown="handleMouseDown"
  >
    <div class="relative overflow-hidden rounded-2xl">
      <!-- 装饰性背景 -->
      <div class="absolute inset-0 bg-gradient-to-br from-amber-50/90 via-orange-50/80 to-rose-50/90 opacity-60"></div>

      <!-- 内容区域 -->
      <div class="relative p-5 space-y-3">
        <!-- 标题栏 -->
        <div class="flex items-center justify-between mb-2">
          <div class="flex items-center gap-2">
            <div class="w-1 h-5 bg-gradient-to-b from-amber-500 to-orange-500 rounded-full"></div>
            <h3 class="text-sm font-bold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
              美育诗词推荐
            </h3>
          </div>
          <div class="flex items-center gap-1 text-xs text-amber-700/70">
            <div class="w-2 h-2 bg-amber-500 rounded-full animate-pulse"></div>
            <span>随机推荐</span>
          </div>
        </div>

        <!-- 诗词内容 - 带淡入淡出动画 -->
        <Transition name="poetry-fade" mode="out-in">
          <div :key="poetry.title" class="space-y-3 cursor-pointer group" @click.stop="handlePoetryClick">
            <!-- 诗词标题 -->
            <div class="text-center">
              <h4 class="text-lg font-bold text-ink-wash group-hover:text-accent transition-colors poetry-title-text">
                《{{ poetry.title }}》
              </h4>
            </div>

            <!-- 配图（如果有） -->
            <div v-if="poetry.image && showImage" class="relative rounded-xl overflow-hidden shadow-lg border-2 border-amber-200/50 group-hover:border-amber-300 transition-all">
              <img
                :src="getImageUrl(poetry.image)"
                :alt="poetry.title"
                class="w-full aspect-[4/3] object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div class="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
            </div>

            <!-- 诗词正文 -->
            <div v-if="showContent" class="poetry-content-box px-4 py-3 rounded-xl bg-white/50 backdrop-blur-sm border border-amber-200/50 shadow-inner">
              <p class="text-sm text-ink-wash/95 leading-loose whitespace-pre-line text-center poetry-text-content">
                {{ poetry.content }}
              </p>
            </div>

            <!-- 作者信息 -->
            <div class="flex items-center justify-center gap-2 text-xs">
              <div class="h-px w-8 bg-gradient-to-r from-transparent to-amber-300"></div>
              <p class="text-mountain-mist/80 italic">
                {{ poetry.dynasty }} · {{ poetry.author }}
              </p>
              <div class="h-px w-8 bg-gradient-to-l from-transparent to-amber-300"></div>
            </div>

            <!-- 描述信息 -->
            <div v-if="poetry.description && showDescription" class="text-xs text-mountain-mist/70 bg-amber-50/50 rounded-lg p-2.5 backdrop-blur-sm border border-amber-100/50">
              {{ poetry.description }}
            </div>
          </div>
        </Transition>

        <!-- 操作按钮 -->
        <div v-if="showButtons" class="flex gap-2 pt-2">
          <button
            @click.stop="handleRefresh"
            class="flex-1 px-3 py-2 text-xs font-medium rounded-lg bg-gradient-to-r from-amber-500/10 to-orange-500/10 hover:from-amber-500/20 hover:to-orange-500/20 border border-amber-300/30 text-amber-700 transition-all duration-300 hover:shadow-md"
          >
            换一首
          </button>
          <button
            @click.stop="handleCollect"
            class="flex-1 px-3 py-2 text-xs font-medium rounded-lg bg-gradient-to-r from-rose-500/10 to-pink-500/10 hover:from-rose-500/20 hover:to-pink-500/20 border border-rose-300/30 text-rose-700 transition-all duration-300 hover:shadow-md"
          >
            收藏
          </button>
        </div>

        <!-- 自动切换进度条 -->
        <div class="h-1 bg-amber-200/30 rounded-full overflow-hidden">
          <div
            class="h-full bg-gradient-to-r from-amber-500 to-orange-500 rounded-full transition-all"
            :style="{ width: `${progress}%` }"
          ></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { poetryDatabase, type Poetry } from '@/data/poetry'

const props = defineProps<{
  widgetSize?: string
}>()

const emit = defineEmits<{
  'select-poetry': [text: string]
}>()

const widgetRef = ref<HTMLDivElement | null>(null)
const poetry = ref<Poetry>(poetryDatabase[0])
const position = ref({ x: 20, y: 100 })
const isDragging = ref(false)
const dragOffset = ref({ x: 0, y: 0 })
const progress = ref(0)

// 用于跟踪最近显示的诗词，避免短时间重复
const recentPoetryIds = ref<string[]>([])
const maxRecentSize = Math.min(5, Math.floor(poetryDatabase.length / 2))

// 根据大小显示不同的内容
const showImage = computed(() => props.widgetSize !== 'small')
const showContent = computed(() => props.widgetSize !== 'small')
const showDescription = computed(() => props.widgetSize === 'large')
const showButtons = computed(() => props.widgetSize !== 'small')

// 自动切换定时器
let autoSwitchTimer: number | null = null
let progressTimer: number | null = null

// 获取图片URL（从public目录）
const getImageUrl = (imageName: string) => {
  return `/poetry-images/${imageName}`
}

// 获取随机诗词（避免重复）
const getRandomPoetry = (): Poetry => {
  const availablePoetry = poetryDatabase.filter(
    (p) => !recentPoetryIds.value.includes(p.title)
  )

  // 如果可用诗词太少，清空历史记录
  if (availablePoetry.length < 3 && recentPoetryIds.value.length > 0) {
    recentPoetryIds.value = []
    return getRandomPoetry()
  }

  const randomIndex = Math.floor(Math.random() * availablePoetry.length)
  const selected = availablePoetry[randomIndex]

  // 更新最近显示列表
  recentPoetryIds.value.push(selected.title)
  if (recentPoetryIds.value.length > maxRecentSize) {
    recentPoetryIds.value.shift()
  }

  return selected
}

// 切换到新诗词
const switchPoetry = () => {
  poetry.value = getRandomPoetry()
  resetProgress()
}

// 重置进度条
const resetProgress = () => {
  progress.value = 0
  startProgress()
}

// 启动进度条动画
const startProgress = () => {
  if (progressTimer) {
    clearInterval(progressTimer)
  }

  const interval = 50 // 每50ms更新一次
  const duration = 5000 // 5秒总时长
  const increment = (100 * interval) / duration

  progressTimer = window.setInterval(() => {
    progress.value += increment
    if (progress.value >= 100) {
      progress.value = 100
    }
  }, interval)
}

// 启动自动切换
const startAutoSwitch = () => {
  if (autoSwitchTimer) {
    clearInterval(autoSwitchTimer)
  }

  autoSwitchTimer = window.setInterval(() => {
    switchPoetry()
  }, 5000)
}

// 停止自动切换
const stopAutoSwitch = () => {
  if (autoSwitchTimer) {
    clearInterval(autoSwitchTimer)
    autoSwitchTimer = null
  }
  if (progressTimer) {
    clearInterval(progressTimer)
    progressTimer = null
  }
}

// 初始化：显示随机诗词
onMounted(() => {
  poetry.value = getRandomPoetry()
  startProgress()
  startAutoSwitch()

  document.addEventListener('mousemove', handleMouseMove)
  document.addEventListener('mouseup', handleMouseUp)
})

onUnmounted(() => {
  stopAutoSwitch()
  document.removeEventListener('mousemove', handleMouseMove)
  document.removeEventListener('mouseup', handleMouseUp)
})

// 拖动开始
const handleMouseDown = (e: MouseEvent) => {
  if ((e.target as HTMLElement).closest('button')) return // 点击按钮时不拖动
  isDragging.value = true
  const rect = widgetRef.value?.getBoundingClientRect()
  if (rect) {
    dragOffset.value = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    }
  }
}

// 拖动中
const handleMouseMove = (e: MouseEvent) => {
  if (!isDragging.value) return
  position.value = {
    x: e.clientX - dragOffset.value.x,
    y: e.clientY - dragOffset.value.y,
  }
}

// 拖动结束
const handleMouseUp = () => {
  isDragging.value = false
}

// 换一首（手动切换）
const handleRefresh = () => {
  stopAutoSwitch()
  switchPoetry()
  startAutoSwitch()
}

// 收藏
const handleCollect = () => {
  alert(`已收藏《${poetry.value.title}》`)
}

// 点击古诗内容，将其传递给父组件
const handlePoetryClick = () => {
  emit('select-poetry', poetry.value.content)
}
</script>

<style scoped>
/* 诗词小部件高级毛玻璃效果 */
.poetry-widget {
  background: rgba(255, 255, 255, 0.75);
  box-shadow:
    0 8px 32px 0 rgba(255, 160, 100, 0.25),
    0 4px 16px 0 rgba(0, 0, 0, 0.1),
    inset 0 0 0 1px rgba(255, 255, 255, 0.5);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.poetry-widget:hover {
  box-shadow:
    0 12px 40px 0 rgba(255, 160, 100, 0.35),
    0 6px 20px 0 rgba(0, 0, 0, 0.15),
    inset 0 0 0 1px rgba(255, 255, 255, 0.6);
  transform: translateY(-2px);
}

/* 诗词标题样式 */
.poetry-title-text {
  font-family: 'STKaiti', 'KaiTi', 'Microsoft YaHei', serif;
  letter-spacing: 0.2em;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

/* 诗词内容样式 */
.poetry-text-content {
  font-family: 'STKaiti', 'KaiTi', 'Microsoft YaHei', serif;
  letter-spacing: 0.15em;
  line-height: 2;
}

.poetry-content-box {
  transition: all 0.3s ease;
}

.group:hover .poetry-content-box {
  background: rgba(255, 255, 255, 0.7);
  border-color: rgba(251, 191, 36, 0.4);
  box-shadow: 0 4px 12px rgba(251, 191, 36, 0.15);
}

/* 淡入淡出动画 */
.poetry-fade-enter-active,
.poetry-fade-leave-active {
  transition: all 0.6s cubic-bezier(0.4, 0, 0.2, 1);
}

.poetry-fade-enter-from {
  opacity: 0;
  transform: translateY(10px) scale(0.98);
}

.poetry-fade-leave-to {
  opacity: 0;
  transform: translateY(-10px) scale(0.98);
}

.poetry-fade-enter-to,
.poetry-fade-leave-from {
  opacity: 1;
  transform: translateY(0) scale(1);
}
</style>
