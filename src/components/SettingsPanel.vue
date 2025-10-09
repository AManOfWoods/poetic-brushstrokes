<template>
  <Transition name="settings-fade">
    <div v-if="isOpen" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" @click.self="close">
      <div class="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-y-auto">
        <!-- 标题栏 -->
        <div class="flex items-center justify-between p-6 border-b border-gray-200">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-full bg-gradient-to-br from-bamboo-green to-teal-600 flex items-center justify-center">
              <SettingsIcon class="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 class="text-xl font-bold text-ink-wash">系统设置</h2>
              <p class="text-sm text-muted-foreground">个性化您的使用体验</p>
            </div>
          </div>
          <button
            @click="close"
            class="w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center transition-colors"
          >
            <XIcon class="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <!-- 设置内容 -->
        <div class="p-6 space-y-6">
          <!-- 背景图设置 -->
          <div class="space-y-4">
            <div class="flex items-center gap-2">
              <ImageIcon class="w-5 h-5 text-bamboo-green" />
              <h3 class="font-semibold text-ink-wash text-lg">背景图片</h3>
            </div>

            <div class="p-4 rounded-xl border-2 border-dashed border-gray-200 hover:border-bamboo-green/50 transition-colors">
              <!-- 当前背景预览 -->
              <div class="mb-3">
                <p class="text-sm text-muted-foreground mb-2">当前背景预览</p>
                <div class="relative h-32 rounded-lg overflow-hidden border border-gray-200">
                  <img
                    :src="backgroundPreview"
                    alt="Background preview"
                    class="w-full h-full object-cover"
                  />
                </div>
              </div>

              <!-- 上传按钮 -->
              <div class="flex gap-2">
                <label for="bg-upload" class="flex-1 cursor-pointer">
                  <div class="px-4 py-2 bg-bamboo-green hover:bg-bamboo-green/90 text-white rounded-lg text-sm font-medium text-center transition-colors">
                    <UploadIcon class="w-4 h-4 inline-block mr-2" />
                    上传新背景
                  </div>
                </label>
                <button
                  @click="resetBackground"
                  class="px-4 py-2 border border-gray-300 hover:bg-gray-50 text-gray-700 rounded-lg text-sm font-medium transition-colors"
                >
                  恢复默认
                </button>
              </div>
              <input
                id="bg-upload"
                ref="bgFileInput"
                type="file"
                accept="image/*"
                @change="handleBackgroundUpload"
                class="hidden"
              />
              <p class="text-xs text-muted-foreground mt-2">建议尺寸：1920x1080，支持 JPG、PNG 格式</p>
            </div>
          </div>

          <!-- 诗词窗口大小设置 -->
          <div class="space-y-4">
            <div class="flex items-center gap-2">
              <SlidersIcon class="w-5 h-5 text-bamboo-green" />
              <h3 class="font-semibold text-ink-wash text-lg">诗词推荐窗口</h3>
            </div>

            <div class="space-y-3">
              <p class="text-sm text-muted-foreground">选择窗口大小</p>
              <div class="grid grid-cols-3 gap-3">
                <button
                  v-for="size in widgetSizes"
                  :key="size.value"
                  @click="widgetSize = size.value"
                  :class="[
                    'p-4 rounded-xl border-2 transition-all',
                    widgetSize === size.value
                      ? 'border-bamboo-green bg-bamboo-green/5 shadow-md'
                      : 'border-gray-200 hover:border-bamboo-green/30 hover:bg-gray-50'
                  ]"
                >
                  <div class="text-center">
                    <div :class="[
                      'w-12 h-12 mx-auto mb-2 rounded-lg flex items-center justify-center',
                      widgetSize === size.value ? 'bg-bamboo-green text-white' : 'bg-gray-100 text-gray-600'
                    ]">
                      <component :is="size.icon" class="w-6 h-6" />
                    </div>
                    <p :class="[
                      'font-medium text-sm',
                      widgetSize === size.value ? 'text-bamboo-green' : 'text-gray-700'
                    ]">{{ size.label }}</p>
                    <p class="text-xs text-muted-foreground mt-1">{{ size.description }}</p>
                  </div>
                </button>
              </div>
            </div>

            <!-- 窗口大小说明 -->
            <div class="p-4 bg-amber-50/50 rounded-lg border border-amber-200/50">
              <div class="flex gap-2">
                <InfoIcon class="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <div class="text-sm text-amber-900">
                  <p class="font-medium mb-1">大小说明：</p>
                  <ul class="space-y-1 text-xs">
                    <li><strong>大：</strong>显示完整信息（诗词、作者、描述）</li>
                    <li><strong>中：</strong>显示主要信息（诗词、作者）</li>
                    <li><strong>小：</strong>仅显示诗词标题</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          <!-- 背景透明度设置 -->
          <div class="space-y-4">
            <div class="flex items-center gap-2">
              <SlidersIcon class="w-5 h-5 text-bamboo-green" />
              <h3 class="font-semibold text-ink-wash text-lg">背景透明度</h3>
            </div>

            <div class="space-y-3">
              <div class="flex items-center justify-between">
                <p class="text-sm text-muted-foreground">调整背景图的透明度</p>
                <span class="text-sm font-medium text-bamboo-green">{{ backgroundOpacity }}%</span>
              </div>

              <input
                type="range"
                v-model.number="backgroundOpacity"
                @input="updateOpacityRealtime"
                min="0"
                max="100"
                step="5"
                class="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-bamboo-green"
              />

              <div class="flex justify-between text-xs text-muted-foreground">
                <span>完全透明</span>
                <span>不透明</span>
              </div>
            </div>
          </div>
        </div>

        <!-- 底部按钮 -->
        <div class="p-6 border-t border-gray-200 flex gap-3">
          <button
            @click="saveSettings"
            class="flex-1 px-6 py-3 bg-bamboo-green hover:bg-bamboo-green/90 text-white rounded-lg font-medium transition-colors shadow-lg"
          >
            保存设置
          </button>
          <button
            @click="close"
            class="px-6 py-3 border border-gray-300 hover:bg-gray-50 text-gray-700 rounded-lg font-medium transition-colors"
          >
            取消
          </button>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { Settings as SettingsIcon, X as XIcon, Upload as UploadIcon, Image as ImageIcon, Sliders as SlidersIcon, Info as InfoIcon, Maximize2 as MaximizeIcon, Minimize2 as MinimizeIcon, Square as SquareIcon } from 'lucide-vue-next'

const props = defineProps<{
  isOpen: boolean
}>()

const emit = defineEmits<{
  'update:isOpen': [value: boolean]
  'settings-changed': [settings: { backgroundImage: string; widgetSize: string; backgroundOpacity: number }]
}>()

const bgFileInput = ref<HTMLInputElement | null>(null)
const customBackground = ref<string>('')
const widgetSize = ref<string>('large')
const backgroundOpacity = ref<number>(70)

const defaultBackground = new URL('@/assets/bg.jpg', import.meta.url).href

const backgroundPreview = computed(() => {
  return customBackground.value || defaultBackground
})

const widgetSizes = [
  {
    value: 'large',
    label: '大',
    description: '完整信息',
    icon: MaximizeIcon
  },
  {
    value: 'medium',
    label: '中',
    description: '主要信息',
    icon: SquareIcon
  },
  {
    value: 'small',
    label: '小',
    description: '仅标题',
    icon: MinimizeIcon
  }
]

// 从 localStorage 加载设置
const loadSettings = () => {
  try {
    const savedBg = localStorage.getItem('custom-background')
    const savedSize = localStorage.getItem('widget-size')
    const savedOpacity = localStorage.getItem('background-opacity')

    if (savedBg) {
      customBackground.value = savedBg
    }
    if (savedSize) {
      widgetSize.value = savedSize
    }
    if (savedOpacity) {
      backgroundOpacity.value = parseInt(savedOpacity)
    }
  } catch (error) {
    console.error('加载设置失败:', error)
  }
}

// 处理背景图上传
const handleBackgroundUpload = (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]

  if (file) {
    // 验证文件类型
    if (!file.type.startsWith('image/')) {
      alert('请选择图片文件')
      return
    }

    // 验证文件大小（限制3MB，确保base64后不超过localStorage限制）
    if (file.size > 3 * 1024 * 1024) {
      alert('图片文件过大，请选择小于3MB的图片\n\n提示：推荐使用压缩后的图片以获得更好的性能')
      return
    }

    const reader = new FileReader()
    reader.onload = (e) => {
      customBackground.value = e.target?.result as string
      console.log('背景图已选择，大小:', Math.round((customBackground.value.length / 1024 / 1024) * 100) / 100, 'MB (base64)')
      alert('背景图已选择！请点击"保存设置"按钮应用')
    }
    reader.onerror = () => {
      alert('图片读取失败，请重试')
    }
    reader.readAsDataURL(file)
  }
}

// 实时更新透明度
const updateOpacityRealtime = () => {
  console.log('实时更新透明度:', backgroundOpacity.value)
  emit('settings-changed', {
    backgroundImage: backgroundPreview.value,
    widgetSize: widgetSize.value,
    backgroundOpacity: backgroundOpacity.value
  })
}

// 恢复默认背景
const resetBackground = () => {
  customBackground.value = ''
  localStorage.removeItem('custom-background')
  emit('settings-changed', {
    backgroundImage: defaultBackground,
    widgetSize: widgetSize.value,
    backgroundOpacity: backgroundOpacity.value
  })
}

// 保存设置
const saveSettings = () => {
  try {
    if (customBackground.value) {
      try {
        localStorage.setItem('custom-background', customBackground.value)
        console.log('背景图已保存到localStorage')
      } catch (e: any) {
        if (e.name === 'QuotaExceededError') {
          alert('存储空间不足！\n\n图片太大，请选择更小的图片（建议小于2MB）')
          return
        }
        throw e
      }
    }
    localStorage.setItem('widget-size', widgetSize.value)
    localStorage.setItem('background-opacity', backgroundOpacity.value.toString())

    emit('settings-changed', {
      backgroundImage: backgroundPreview.value,
      widgetSize: widgetSize.value,
      backgroundOpacity: backgroundOpacity.value
    })

    close()
    alert('设置保存成功！背景已更新')
  } catch (error) {
    console.error('保存设置失败:', error)
    alert('保存设置失败，请重试')
  }
}

// 关闭面板
const close = () => {
  emit('update:isOpen', false)
}

// 监听打开状态，加载设置
watch(() => props.isOpen, (isOpen) => {
  if (isOpen) {
    loadSettings()
  }
})
</script>

<style scoped>
.settings-fade-enter-active,
.settings-fade-leave-active {
  transition: opacity 0.3s ease;
}

.settings-fade-enter-from,
.settings-fade-leave-to {
  opacity: 0;
}

.settings-fade-enter-active .bg-white,
.settings-fade-leave-active .bg-white {
  transition: transform 0.3s ease, opacity 0.3s ease;
}

.settings-fade-enter-from .bg-white,
.settings-fade-leave-to .bg-white {
  transform: scale(0.95);
  opacity: 0;
}
</style>
