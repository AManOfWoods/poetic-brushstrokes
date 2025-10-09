<template>
  <div class="w-full h-full relative" style="background-image: url('/text-to-image-bg.png'); background-size: cover; background-position: center; background-repeat: no-repeat;">
    <div class="h-full max-w-6xl mx-auto px-8 p-2 pt-20 pb-8 flex flex-col relative" style="overflow: hidden;">
      <!-- Header flex-shrink-0 -->
      <div class="text-center mb-4 flex-shrink-0">
        <h2 class="text-2xl md:text-3xl font-bold text-ink-wash mb-2">寻诗入画</h2>
        <p class="text-base text-muted-foreground">输入诗词文字，AI 为您生成优美的画作</p>
      </div>

      <!-- Content flex-1 -->
      <div class="grid lg:grid-cols-2 gap-4 flex-1 min-h-0">
        <!-- Input Section -->
        <div class="p-4 shadow-paper bg-silk-white/95 rounded-lg" style="height: 70vh; display: flex; flex-direction: column;">
          <div class="flex items-center justify-between mb-2" style="height: 5%;">
            <h3 class="font-semibold text-ink-wash text-base">输入诗词或文字描述</h3>
          </div>
          
          <!-- Text Input Area (75%) -->
          <div class="mb-3" style="height: 75%;">
            <textarea
              v-model="inputText"
              @input="errorMessage = null"
              placeholder="请输入古诗词或您想要表达的文字内容...

例如：
床前明月光，疑是地上霜。
举头望明月，低头思故乡。"
              class="poetry-input poetry-border resize-none border-0 focus:border-accent transition-all w-full rounded-lg px-4 py-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/30"
              style="height: 100%;"
            />
          </div>

          <!-- Bottom Section: Selection and Button (20%) -->
          <div class="flex flex-col gap-1" style="height: 20%;">
            <!-- Style Selection -->
            <div class="space-y-1" style="height: 45%;">
              <!-- 长辈风格 -->
              <div class="flex items-center gap-1">
                <span class="text-xs text-mountain-mist whitespace-nowrap">爷爷/奶奶喜欢：</span>
                <div class="flex flex-wrap gap-1">
                  <span
                    v-for="style in elderStyles"
                    :key="style.value"
                    @click="selectedStyle = style.value"
                    :class="[
                      'option-chip cursor-pointer text-xs px-2 py-0.5 rounded-full inline-flex items-center border',
                      selectedStyle === style.value
                        ? 'active bg-accent text-accent-foreground border-transparent'
                        : 'bg-gray-100 text-gray-700 border-gray-200 hover:bg-accent/20'
                    ]"
                  >
                    {{ style.label }}
                  </span>
                </div>
              </div>
              <!-- 儿童风格 -->
              <div class="flex items-center gap-1">
                <span class="text-xs text-mountain-mist whitespace-nowrap">我喜欢：</span>
                <div class="flex flex-wrap gap-1">
                  <span
                    v-for="style in childStyles"
                    :key="style.value"
                    @click="selectedStyle = style.value"
                    :class="[
                      'option-chip cursor-pointer text-xs px-2 py-0.5 rounded-full inline-flex items-center border',
                      selectedStyle === style.value
                        ? 'active bg-accent text-accent-foreground border-transparent'
                        : 'bg-gray-100 text-gray-700 border-gray-200 hover:bg-accent/20'
                    ]"
                  >
                    {{ style.label }}
                  </span>
                </div>
              </div>
            </div>

            <!-- Spacer -->
            <div style="height: 10%;"></div>

            <!-- Action Buttons (9% of bottom section) -->
            <div class="flex gap-2" style="height: 45%;">
              <button
                @click="handleGenerate"
                :disabled="!inputText.trim() || isGenerating"
                class="w-full bg-accent hover:bg-accent/90 text-accent-foreground shadow-paper btn-primary ripple text-sm inline-flex items-center justify-center rounded-md font-medium disabled:opacity-50 disabled:pointer-events-none px-4"
                style="height: 100%;"
              >
                <div v-if="isGenerating" class="w-3 h-3 mr-1 border-2 border-current border-t-transparent rounded-full animate-spin" />
                <SparklesIcon v-else class="w-3 h-3 mr-1" />
                {{ isGenerating ? '正在创作...' : '生成画作' }}
              </button>
            </div>
          </div>
        </div>

        <!-- Output Section -->
        <div class="p-4 shadow-paper bg-silk-white/95 rounded-lg" style="height: 70vh; display: flex; flex-direction: column;">
          <div class="flex items-center justify-between mb-2" style="height: 5%;">
            <div class="flex items-center gap-3">
              <h3 class="font-semibold text-ink-wash text-base">生成的画作</h3>
              <div v-if="generatedImage" class="text-sm px-2 py-1 bg-accent/10 text-accent rounded-full border border-accent/20">
                {{ allStyles.find(s => s.value === selectedStyle)?.label }}
              </div>
            </div>
            <div v-if="generatedImage" class="flex gap-1">
              <button
                @click="handleFavorite"
                class="border border-mountain-mist/30 text-mountain-mist hover:bg-mountain-mist/10 h-7 px-2 text-sm inline-flex items-center justify-center rounded-md"
              >
                <HeartIcon class="w-3 h-3 mr-0.5" />
                收藏
              </button>
              <button
                @click="saveImage"
                class="border border-mountain-mist/30 text-mountain-mist hover:bg-mountain-mist/10 h-7 px-2 text-sm inline-flex items-center justify-center rounded-md"
              >
                <DownloadIcon class="w-3 h-3 mr-0.5" />
                保存
              </button>
              <button
                @click="regenerate"
                :disabled="isGenerating"
                class="border border-mountain-mist/30 text-mountain-mist hover:bg-mountain-mist/10 h-7 px-2 text-sm inline-flex items-center justify-center rounded-md disabled:opacity-50 disabled:pointer-events-none"
              >
                <RefreshCwIcon class="w-3 h-3 mr-0.5" />
                重新生成
              </button>
            </div>
          </div>

          <div class="flex items-center justify-center" style="height: 95%;">
            <!-- 1:1 正方形画框容器 -->
            <div class="relative bg-gradient-mist rounded-lg overflow-hidden" style="aspect-ratio: 1/1; max-height: 100%; max-width: 100%;">
              <div v-if="errorMessage" class="absolute inset-0 flex items-center justify-center p-4">
                <div class="text-sm text-red-600 bg-red-50 p-3 rounded-lg border border-red-200">
                  <p class="font-medium mb-1">生成失败</p>
                  <p>{{ errorMessage }}</p>
                </div>
              </div>
              <img
                v-else-if="generatedImage"
                :src="generatedImage"
                alt="Generated artwork"
                class="w-full h-full object-cover"
              />
              <div v-else class="absolute inset-0 flex items-center justify-center border-2 border-dashed border-mountain-mist/30 rounded-lg">
                <div class="text-center">
                  <SparklesIcon class="w-8 h-8 text-mountain-mist mx-auto mb-2" />
                  <p class="text-sm text-mountain-mist">画作将在这里显示</p>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, inject, watch, computed } from 'vue'
import { Sparkles as SparklesIcon, Download as DownloadIcon, RefreshCw as RefreshCwIcon, Heart as HeartIcon } from 'lucide-vue-next'
import { textToImageService } from '@/services/textToImage'
import { favoriteService } from '@/services/favorite'
import textToImageBg from '/text-to-image-bg.png?url'

const props = defineProps<{
  selectedPoetry?: string
}>()

const inputText = ref('')
const selectedStyle = ref('ink-wash')
const isGenerating = ref(false)
const generatedImage = ref<string | null>(null)
const errorMessage = ref<string | null>(null)

// 注入全局生成状态
const globalIsGenerating = inject<any>('isGenerating')

// 监听本地生成状态，同步到全局
watch(isGenerating, (newValue) => {
  if (globalIsGenerating) {
    globalIsGenerating.value = newValue
  }
})

// 监听传入的古诗内容，更新输入框
watch(() => props.selectedPoetry, (newPoetry) => {
  if (newPoetry) {
    inputText.value = newPoetry
    errorMessage.value = null
  }
})

const elderStyles = [
  { value: "ink-wash", label: "水墨写意", description: "传统中国水墨画风格" },
  { value: "gongbi", label: "工笔细描", description: "精细工笔画风格" },
  { value: "landscape", label: "山水古风", description: "传统山水画风格" },
]

const childStyles = [
  { value: "cartoon", label: "Q版卡通", description: "可爱Q版卡通风格" },
  { value: "anime", label: "奇幻动漫", description: "奇幻动漫风格" },
  { value: "crayon", label: "蜡笔手绘", description: "儿童蜡笔手绘风格" },
]

const allStyles = [...elderStyles, ...childStyles]

const handleGenerate = async () => {
  if (!inputText.value.trim()) return

  isGenerating.value = true
  errorMessage.value = null

  try {
    let result: string

    switch (selectedStyle.value) {
      case 'ink-wash':
        result = await textToImageService.generateInkWash(inputText.value)
        break
      case 'gongbi':
        result = await textToImageService.generateGongbi(inputText.value)
        break
      case 'landscape':
        result = await textToImageService.generateLandscape(inputText.value)
        break
      case 'cartoon':
        result = await textToImageService.generateCartoon(inputText.value)
        break
      case 'anime':
        result = await textToImageService.generateAnime(inputText.value)
        break
      case 'crayon':
        result = await textToImageService.generateCrayon(inputText.value)
        break
      default:
        result = await textToImageService.generateImage(inputText.value, selectedStyle.value)
    }

    generatedImage.value = result
  } catch (error) {
    console.error('生成失败:', error)
    errorMessage.value = error instanceof Error ? error.message : '生成失败，请重试'
  } finally {
    isGenerating.value = false
  }
}

// 收藏功能
const handleFavorite = () => {
  if (generatedImage.value && inputText.value) {
    favoriteService.add({
      type: 'text-to-image',
      content: inputText.value,
      result: generatedImage.value,
      style: selectedStyle.value
    })
    alert('收藏成功！')
  }
}

// 保存图片功能（在新页面打开）
const saveImage = () => {
  if (generatedImage.value) {
    window.open(generatedImage.value, '_blank')
  }
}

// 重新生成功能
const regenerate = () => {
  if (inputText.value.trim()) {
    handleGenerate()
  }
}
</script>

