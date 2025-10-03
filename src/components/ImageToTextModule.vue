<template>
  <div class="w-full h-screen overflow-y-auto bg-gradient-paper relative">
    <!-- Background Image with Overlay -->
    <div
      class="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-20 pointer-events-none"
      :style="{ backgroundImage: `url(${backgroundImage})` }"
    />
    <div class="absolute inset-0 bg-gradient-mist opacity-40 pointer-events-none" />

    <div class="max-w-7xl mx-auto px-6 py-20 relative z-10">
      <!-- Header -->
      <div class="text-center mb-8">
        <h2 class="text-3xl md:text-4xl font-bold text-ink-wash mb-2">画生诗</h2>
        <p class="text-base text-muted-foreground">上传您的画作，AI 为您生成诗意的表达</p>
      </div>

      <!-- 主内容区域 -->
      <div class="grid lg:grid-cols-2 gap-6 mb-6">
        <!-- 左侧：图片区域（轮播或上传） -->
        <div class="p-6 shadow-paper bg-silk-white/90 rounded-xl backdrop-blur-sm">
          <!-- 标题栏 -->
          <div class="flex items-center justify-between mb-4">
            <h3 class="font-semibold text-ink-wash text-lg">
              {{ uploadedImage ? '画作预览' : '精选示例' }}
            </h3>
            <div class="flex gap-2">
              <!-- 未上传时显示轮播控制 -->
              <button
                v-if="!uploadedImage"
                @click="autoPlay = !autoPlay"
                class="border border-mountain-mist/30 text-mountain-mist hover:bg-mountain-mist/10 h-8 px-3 text-xs inline-flex items-center justify-center rounded-lg transition-colors"
              >
                {{ autoPlay ? '⏸ 暂停' : '▶ 播放' }}
              </button>
              <!-- 上传按钮 -->
              <label for="image-upload-input" class="cursor-pointer">
                <div class="border border-bamboo-green/30 text-bamboo-green hover:bg-bamboo-green/10 h-8 px-4 text-sm inline-flex items-center justify-center rounded-lg transition-colors font-medium">
                  <FileImageIcon class="w-4 h-4 mr-2" />
                  {{ uploadedImage ? '重新上传' : '上传画作' }}
                </div>
              </label>
            </div>
          </div>

          <!-- 图片显示区域 -->
          <div class="relative mb-4" style="height: 450px;">
            <!-- 用户上传的图片 -->
            <div v-if="uploadedImage" class="h-full rounded-xl overflow-hidden border-2 border-bamboo-green/30">
              <img
                :src="uploadedImage"
                alt="Uploaded artwork"
                class="w-full h-full object-cover"
              />
            </div>

            <!-- 轮播示例图片 -->
            <Transition v-else name="slide-fade" mode="out-in">
              <div :key="currentExampleIndex" class="h-full">
                <div class="relative h-full rounded-xl overflow-hidden shadow-lg border-2 border-amber-200/50 group cursor-pointer"
                     @click="loadExampleImage(exampleImages[currentExampleIndex])">
                  <img
                    :src="exampleImages[currentExampleIndex].url"
                    :alt="exampleImages[currentExampleIndex].title"
                    class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div class="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                  <div class="absolute bottom-0 left-0 right-0 p-4 text-white">
                    <p class="text-lg font-bold">{{ exampleImages[currentExampleIndex].title }}</p>
                    <p class="text-sm opacity-90">{{ exampleImages[currentExampleIndex].dynasty }}</p>
                  </div>
                </div>

                <!-- 轮播控制 -->
                <div class="absolute bottom-4 left-0 right-0 flex items-center justify-center gap-3 z-10">
                  <button
                    @click.stop="prevExample"
                    class="w-9 h-9 rounded-full bg-white/95 backdrop-blur-sm flex items-center justify-center hover:bg-white transition-all shadow-lg hover:scale-110"
                  >
                    <svg class="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>
                  <div class="flex gap-2">
                    <div
                      v-for="(_, idx) in exampleImages"
                      :key="idx"
                      @click.stop="currentExampleIndex = idx"
                      :class="[
                        'h-2 rounded-full cursor-pointer transition-all shadow-sm',
                        idx === currentExampleIndex ? 'bg-bamboo-green w-7' : 'bg-white/80 w-2 hover:bg-white'
                      ]"
                    ></div>
                  </div>
                  <button
                    @click.stop="nextExample"
                    class="w-9 h-9 rounded-full bg-white/95 backdrop-blur-sm flex items-center justify-center hover:bg-white transition-all shadow-lg hover:scale-110"
                  >
                    <svg class="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>
              </div>
            </Transition>
          </div>

          <input
            id="image-upload-input"
            ref="fileInput"
            type="file"
            accept="image/*"
            @change="handleImageUpload"
            class="hidden"
          />

          <!-- 诗词类型选择 -->
          <div class="mb-4">
            <p class="text-sm text-mountain-mist mb-2 font-medium">选择诗词风格</p>
            <div class="flex flex-wrap gap-2">
              <span
                v-for="type in poetryTypes"
                :key="type.value"
                @click="selectedPoetryType = type.value"
                :class="[
                  'option-chip cursor-pointer text-sm px-4 py-2 rounded-lg inline-flex items-center border font-medium transition-all',
                  selectedPoetryType === type.value
                    ? 'active bg-bamboo-green text-silk-white border-transparent shadow-md'
                    : 'bg-white text-gray-700 border-gray-200 hover:border-bamboo-green/40 hover:bg-bamboo-green/5'
                ]"
              >
                {{ type.label }}
              </span>
            </div>
          </div>

          <!-- 生成按钮 -->
          <button
            @click="handleGenerate"
            :disabled="!uploadedImage || isGenerating"
            class="w-full bg-bamboo-green hover:bg-bamboo-green/90 text-silk-white shadow-lg btn-primary ripple text-base inline-flex items-center justify-center rounded-lg font-medium disabled:opacity-50 disabled:pointer-events-none px-6 py-3 transition-all"
          >
            <div v-if="isGenerating" class="w-4 h-4 mr-2 border-2 border-current border-t-transparent rounded-full animate-spin" />
            <SparklesIcon v-else class="w-4 h-4 mr-2" />
            {{ isGenerating ? '正在创作中...' : '生成诗词' }}
          </button>
        </div>

        <!-- 右侧：诗词显示 -->
        <div class="p-6 shadow-paper bg-silk-white/90 rounded-xl backdrop-blur-sm min-h-[600px] flex flex-col">
          <div class="flex items-center justify-between mb-4">
            <div class="flex items-center gap-3">
              <h3 class="font-semibold text-ink-wash text-lg">
                {{ uploadedImage ? '生成的诗词' : '示例诗歌' }}
              </h3>
              <div v-if="generatedPoetry || !uploadedImage" class="text-xs px-3 py-1 bg-bamboo-green/10 text-bamboo-green rounded-full border border-bamboo-green/20 font-medium">
                {{ generatedPoetry ? poetryTypes.find(t => t.value === selectedPoetryType)?.label : exampleImages[currentExampleIndex].dynasty }}
              </div>
            </div>
            <div v-if="generatedPoetry" class="flex gap-2">
              <button
                @click="handleFavorite"
                class="border border-mountain-mist/30 text-mountain-mist hover:bg-mountain-mist/10 h-8 px-3 text-sm inline-flex items-center justify-center rounded-lg transition-colors"
              >
                <HeartIcon class="w-3.5 h-3.5 mr-1.5" />
                收藏
              </button>
              <button
                @click="copyToClipboard"
                class="border border-mountain-mist/30 text-mountain-mist hover:bg-mountain-mist/10 h-8 px-3 text-sm inline-flex items-center justify-center rounded-lg transition-colors"
              >
                <CopyIcon class="w-3.5 h-3.5 mr-1.5" />
                复制
              </button>
              <button
                @click="regenerate"
                :disabled="isGenerating"
                class="border border-mountain-mist/30 text-mountain-mist hover:bg-mountain-mist/10 h-8 px-3 text-sm inline-flex items-center justify-center rounded-lg disabled:opacity-50 disabled:pointer-events-none transition-colors"
              >
                <RefreshCwIcon class="w-3.5 h-3.5 mr-1.5" />
                重新生成
              </button>
            </div>
          </div>

          <div class="poetry-border rounded-xl overflow-hidden flex-1 min-h-0">
            <!-- 生成失败 -->
            <div v-if="errorMessage" class="h-full overflow-y-auto p-6">
              <div class="text-sm text-red-600 bg-red-50 p-4 rounded-lg border border-red-200">
                <p class="font-semibold mb-2">生成失败</p>
                <p>{{ errorMessage }}</p>
              </div>
            </div>
            <!-- 已生成诗词 -->
            <div v-else-if="generatedPoetry" class="h-full overflow-y-auto px-8 py-6">
              <div class="poetry-output markdown-content" v-html="renderedPoetry"></div>
            </div>
            <!-- 示例诗歌（未上传图片时） -->
            <Transition v-else-if="!uploadedImage" name="slide-fade" mode="out-in">
              <div :key="currentExampleIndex" class="h-full overflow-y-auto px-8 py-6">
                <div class="text-center mb-4">
                  <h4 class="text-2xl font-bold text-ink-wash poetry-title-text mb-2">
                    {{ exampleImages[currentExampleIndex].title }}
                  </h4>
                  <p class="text-sm text-mountain-mist">{{ exampleImages[currentExampleIndex].dynasty }}</p>
                </div>
                <div class="poetry-text-content text-base text-ink-wash leading-loose whitespace-pre-line text-center mb-6 font-serif">
                  {{ exampleImages[currentExampleIndex].content }}
                </div>
                <div class="text-sm text-mountain-mist/80 leading-relaxed border-t border-amber-200/50 pt-4">
                  <p class="font-medium text-ink-wash mb-2">创作说明：</p>
                  {{ exampleImages[currentExampleIndex].description }}
                </div>
              </div>
            </Transition>
            <!-- 等待上传 -->
            <div v-else class="h-full flex items-center justify-center p-6">
              <div class="text-center">
                <SparklesIcon class="w-12 h-12 text-mountain-mist mx-auto mb-3 opacity-40" />
                <p class="text-base text-mountain-mist font-medium mb-1">诗词将在这里显示</p>
                <p class="text-sm text-muted-foreground">上传画作并生成诗词</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, inject, watch, onMounted, onUnmounted } from 'vue'
import { FileImage as FileImageIcon, Sparkles as SparklesIcon, Copy as CopyIcon, RefreshCw as RefreshCwIcon, Heart as HeartIcon } from 'lucide-vue-next'
import { imageToTextService } from '@/services/imageToText'
import { favoriteService } from '@/services/favorite'
import { marked } from 'marked'

// 使用本地背景图片
const backgroundImage = new URL('@/assets/bg.jpg', import.meta.url).href

const uploadedImage = ref<string | null>(null)
const uploadedFile = ref<File | null>(null)
const selectedPoetryType = ref('poetry')
const isGenerating = ref(false)
const generatedPoetry = ref<string | null>(null)
const fileInput = ref<HTMLInputElement | null>(null)
const errorMessage = ref<string | null>(null)
const currentExampleIndex = ref(0)
const autoPlay = ref(true)

// 示例图片数据
const exampleImages = [
  {
    id: 1,
    title: '山水意境',
    dynasty: '五律',
    content: '远山浮雾阔，近岫隐苍鳞。\n古松凝黛色，流泉漱石根。\n空濛分浅墨，疏密见清真。\n心与云俱静，悠悠忘世尘。',
    url: '/poetry-images/1.png',
    description: '全诗以\'云雾\'\'古松\'\'流泉\'呼应画面核心元素，颔联\'凝黛色\'\'漱石根\'暗合墨色浓淡与流水动态。颈联\'空濛\'\'疏密\'直接对应水墨画留白技法与笔触层次，尾联\'心与云俱静\'点出幽远宁静的意境，契合山水诗\'生命安顿\'的精神内核。'
  },
  {
    id: 2,
    title: '春日花鸟',
    dynasty: '七绝',
    content: '桃枝初绽粉靥新，喜鹊清音破晓晨。\n风摇嫩蕊沾晨露，翅剪晴光破晓烟。',
    url: '/poetry-images/2.png',
    description: '取杜甫\'春风花草香\'的生机意趣，以\'粉靥\'状桃花之艳，\'清音\'写喜鹊之灵，贴合工笔画细节精致的特点。\'沾晨露\'\'破晓烟\'强化春日晨景的鲜活，色彩聚焦粉、青二色，呼应\'淡雅\'基调，喜鹊意象暗合传统吉祥寓意，凸显\'生机与喜悦\'。'
  },
  {
    id: 3,
    title: '秋月思乡',
    dynasty: '七绝',
    content: '霜轮碾破梧桐影，羁客临窗独黯然。\n故园菊酒今谁共，望断归鸿又一年。',
    url: '/poetry-images/3.png',
    description: '化用晏殊《中秋月》\'庭梧\'\'羁人\'意象，\'霜轮\'代圆月，\'梧桐影\'呼应画面庭院景致。后两句以\'菊酒\'\'归鸿\'强化思乡情，\'独黯然\'\'望断\'直接点出独坐之人的心境，延续古典诗词\'以月喻愁\'的传统笔法。'
  },
  {
    id: 4,
    title: '渔舟唱晚',
    dynasty: '七律',
    content: '残阳铺水漾金鳞，归帆点点入烟津。\n渔唱一声烟际起，山容千叠黛中昏。\n波摇碎影随舟远，风送余温伴客身。\n此境浑然忘物我，唯留暮色与闲心。',
    url: '/poetry-images/4.png',
    description: '以\'残阳\'\'金鳞\'写江面金光，\'归帆\'\'渔唱\'点题，\'山容黛中昏\'呼应远山如黛的画面。颈联\'碎影随舟\'强化动态，尾联\'忘物我\'契合晚景的宁静祥和，借鉴\'渔舟唱晚\'的经典意境营造方式。'
  },
  {
    id: 5,
    title: '雪梅傲骨',
    dynasty: '七绝',
    content: '琼枝积素覆寒痕，丹砂一点破霜晨。\n独傲霜天凌朔气，幽香暗度破寒痕。',
    url: '/poetry-images/5.png',
    description: '\'琼枝积素\'绘枝头积雪，\'丹砂一点\'状红梅娇艳，黑白红三色对比呼应工笔画色彩精度。\'凌朔气\'\'破寒痕\'直接点出不畏严寒的傲骨精神，\'幽香暗度\'以嗅觉延申画面意境，延续咏梅诗\'以雪衬艳\'的传统笔法。'
  }
]

// 注入全局生成状态
const globalIsGenerating = inject<any>('isGenerating')

// 监听本地生成状态，同步到全局
watch(isGenerating, (newValue) => {
  if (globalIsGenerating) {
    globalIsGenerating.value = newValue
  }
})

const poetryTypes = [
  { value: "poetry", label: "古风诗", description: "古典风格的五言七言诗" },
  { value: "prose", label: "词牌", description: "传统词牌风格创作" },
  { value: "story", label: "绝句", description: "简洁优美的绝句风格" },
  { value: "fu", label: "赋体", description: "铺汈描写的赋体风格" },
]

// 计算属性：将生成的文本转换为 HTML
const renderedPoetry = computed(() => {
  if (!generatedPoetry.value) return ''
  try {
    return marked(generatedPoetry.value, { breaks: true })
  } catch (error) {
    console.error('Markdown 渲染失败:', error)
    return generatedPoetry.value // 如果 Markdown 解析失败，返回原始文本
  }
})

// 轮播控制
let carouselTimer: number | null = null

const nextExample = () => {
  currentExampleIndex.value = (currentExampleIndex.value + 1) % exampleImages.length
}

const prevExample = () => {
  currentExampleIndex.value = (currentExampleIndex.value - 1 + exampleImages.length) % exampleImages.length
}

const startCarousel = () => {
  if (carouselTimer) {
    clearInterval(carouselTimer)
  }
  if (autoPlay.value) {
    carouselTimer = window.setInterval(() => {
      nextExample()
    }, 5000) // 每5秒切换
  }
}

const stopCarousel = () => {
  if (carouselTimer) {
    clearInterval(carouselTimer)
    carouselTimer = null
  }
}

// 监听 autoPlay 变化
watch(autoPlay, (newValue) => {
  if (newValue) {
    startCarousel()
  } else {
    stopCarousel()
  }
})

// 组件挂载时启动轮播
onMounted(() => {
  if (autoPlay.value) {
    startCarousel()
  }
})

onUnmounted(() => {
  stopCarousel()
})

const handleImageUpload = (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  if (file) {
    uploadedFile.value = file
    const reader = new FileReader()
    reader.onload = (e) => {
      uploadedImage.value = e.target?.result as string
      generatedPoetry.value = null
      errorMessage.value = null
    }
    reader.readAsDataURL(file)
  }
}

const triggerFileInput = () => {
  fileInput.value?.click()
}

// 加载示例图片
const loadExampleImage = async (example: typeof exampleImages[0]) => {
  try {
    // 从URL加载图片并转换为Blob
    const response = await fetch(example.url)
    const blob = await response.blob()

    // 创建File对象
    const file = new File([blob], `${example.title}.png`, { type: 'image/png' })
    uploadedFile.value = file

    // 显示预览
    uploadedImage.value = example.url

    // 清空之前的生成结果
    generatedPoetry.value = null
    errorMessage.value = null
  } catch (error) {
    console.error('加载示例图片失败:', error)
    errorMessage.value = '加载示例图片失败，请重试'
  }
}

const handleFavorite = () => {
  if (generatedPoetry.value && uploadedImage.value) {
    favoriteService.add({
      type: 'image-to-text',
      content: uploadedImage.value,
      result: generatedPoetry.value,
      style: selectedPoetryType.value
    })
    alert('收藏成功！')
  }
}

const copyToClipboard = async () => {
  if (generatedPoetry.value) {
    try {
      await navigator.clipboard.writeText(generatedPoetry.value)
      // TODO: Add toast notification for successful copy
    } catch (error) {
      // Fallback for older browsers
      const textArea = document.createElement('textarea')
      textArea.value = generatedPoetry.value
      document.body.appendChild(textArea)
      textArea.select()
      document.execCommand('copy')
      document.body.removeChild(textArea)
    }
  }
}

const regenerate = () => {
  if (uploadedFile.value) {
    handleGenerate()
  }
}

const handleGenerate = async () => {
  if (!uploadedFile.value) return
  
  isGenerating.value = true
  errorMessage.value = null
  
  try {
    let result: string
    
    switch (selectedPoetryType.value) {
      case 'poetry':
        result = await imageToTextService.generatePoetry(uploadedFile.value)
        break
      case 'prose':
        result = await imageToTextService.generateProse(uploadedFile.value)
        break
      case 'story':
        result = await imageToTextService.generateStory(uploadedFile.value)
        break
      case 'fu':
        result = await imageToTextService.generateFu(uploadedFile.value)
        break
      default:
        result = await imageToTextService.analyzeImage(uploadedFile.value)
    }
    
    generatedPoetry.value = result
  } catch (error) {
    console.error('生成失败:', error)
    errorMessage.value = error instanceof Error ? error.message : '生成失败，请重试'
  } finally {
    isGenerating.value = false
  }
}
</script>

<style scoped>
/* Fade过渡动画 */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease, transform 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

/* Slide-fade 轮播过渡动画 */
.slide-fade-enter-active {
  transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
}

.slide-fade-leave-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.slide-fade-enter-from {
  opacity: 0;
  transform: translateX(30px);
}

.slide-fade-leave-to {
  opacity: 0;
  transform: translateX(-30px);
}

/* 画生诗输出样式 - 与输入古诗保持一致 */
.markdown-content :deep(h1),
.markdown-content :deep(h2),
.markdown-content :deep(h3) {
  font-family: 'STKaiti', 'KaiTi', 'Microsoft YaHei', serif;
  @apply text-ink-wash font-bold mb-3 text-center;
  font-size: 1.3rem;
  letter-spacing: 0.25em;
}

.markdown-content :deep(p) {
  font-family: 'STKaiti', 'KaiTi', 'Microsoft YaHei', serif;
  @apply mb-4 text-ink-wash text-center;
  line-height: 2.5;
  letter-spacing: 0.2em;
  font-size: 1.15rem;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}

.markdown-content :deep(strong) {
  @apply font-bold text-ink-wash;
}

.markdown-content :deep(em) {
  @apply text-mountain-mist/70 text-xs;
  font-style: italic;
  letter-spacing: normal;
}

/* 隐藏列表样式的注释 */
.markdown-content :deep(ul),
.markdown-content :deep(ol) {
  display: none;
}

.markdown-content :deep(li) {
  display: none;
}

/* 分隔线样式 */
.markdown-content :deep(hr) {
  @apply my-4 border-amber-300/30;
}
</style>