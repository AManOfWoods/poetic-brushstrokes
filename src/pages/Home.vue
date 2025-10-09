<template>
  <div class="w-screen h-screen overflow-hidden relative custom-bg-container" :class="{ 'bg-gradient-paper': !customBackground.value }" :style="backgroundStyle">
    <!-- 半透明白色遮罩层，弱化背景 -->
    <div class="absolute inset-0 pointer-events-none" :style="overlayStyle"></div>

    <div class="w-full h-full flex flex-col relative">
      <!-- 导航栏浮动在内容上方 -->
      <div class="absolute top-4 left-1/2 transform -translate-x-1/2 z-50">
        <div class="nav-container rounded-full px-2 py-1 shadow-lg">
          <div class="grid grid-cols-4 gap-1">
            <button
              @click="setActiveTab('home')"
              :class="[
                'px-4 py-2 text-sm font-medium rounded-full transition-all whitespace-nowrap',
                activeTab === 'home'
                  ? 'nav-button-active-home shadow-sm'
                  : 'nav-button-inactive'
              ]"
            >
              诗画传情
            </button>
            <button
              @click="setActiveTab('text-to-image')"
              :class="[
                'px-4 py-2 text-sm font-medium rounded-full transition-all whitespace-nowrap',
                activeTab === 'text-to-image'
                  ? 'nav-button-active-poem shadow-sm'
                  : 'nav-button-inactive'
              ]"
            >
              寻诗入画
            </button>
            <button
              @click="setActiveTab('image-to-text')"
              :class="[
                'px-4 py-2 text-sm font-medium rounded-full transition-all whitespace-nowrap',
                activeTab === 'image-to-text'
                  ? 'nav-button-active-paint shadow-sm'
                  : 'nav-button-inactive'
              ]"
            >
              览画成诗
            </button>
            <button
              @click="setActiveTab('favorites')"
              :class="[
                'px-4 py-2 text-sm font-medium rounded-full transition-all whitespace-nowrap',
                activeTab === 'favorites'
                  ? 'nav-button-active-home shadow-sm'
                  : 'nav-button-inactive'
              ]"
            >
              我的收藏
            </button>
          </div>
        </div>
      </div>

      <!-- 设置按钮 -->
      <button
        @click="showSettings = true"
        class="absolute top-4 right-6 z-50 w-10 h-10 rounded-full bg-white/80 backdrop-blur-sm hover:bg-white shadow-lg flex items-center justify-center transition-all hover:scale-105"
        title="系统设置"
      >
        <SettingsIcon class="w-5 h-5 text-bamboo-green" />
      </button>

      <!-- 内容区域占满全屏 -->
      <div class="w-full h-full">
        <HomePage v-if="activeTab === 'home'" @navigate="setActiveTab" />
        <TextToImageModule v-else-if="activeTab === 'text-to-image'" :selectedPoetry="selectedPoetry" />
        <ImageToTextModule v-else-if="activeTab === 'image-to-text'" />
        <FavoritesModule v-else-if="activeTab === 'favorites'" />
      </div>

      <!-- 美育诗词小组件 - 只在诗生画界面显示 -->
      <PoetryWidget
        v-if="activeTab === 'text-to-image'"
        :widget-size="widgetSize"
        @select-poetry="handlePoetrySelect"
      />

      <!-- 设置面板 -->
      <SettingsPanel
        :isOpen="showSettings"
        @update:isOpen="showSettings = $event"
        @settings-changed="applySettings"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, provide, computed, onMounted } from 'vue'
import { Settings as SettingsIcon } from 'lucide-vue-next'
import HomePage from '@/components/HomePage.vue'
import TextToImageModule from '@/components/TextToImageModule.vue'
import ImageToTextModule from '@/components/ImageToTextModule.vue'
import FavoritesModule from '@/components/FavoritesModule.vue'
import PoetryWidget from '@/components/PoetryWidget.vue'
import SettingsPanel from '@/components/SettingsPanel.vue'

const activeTab = ref('home')
const isGenerating = ref(false)
const selectedPoetry = ref<string>('')
const showSettings = ref(false)
const widgetSize = ref<string>('large')
const customBackground = ref<string>('')
const backgroundOpacity = ref<number>(70)

// 提供全局生成状态
provide('isGenerating', isGenerating)

// 遮罩层样式（控制背景透明度）
const overlayStyle = computed(() => {
  const overlayOpacity = (100 - backgroundOpacity.value) / 100
  const bgColor = customBackground.value ? `rgba(180, 190, 200, ${overlayOpacity})` : 'transparent'
  console.log(`遮罩层计算: backgroundOpacity=${backgroundOpacity.value}, overlayOpacity=${overlayOpacity}, bgColor=${bgColor}`)
  return { backgroundColor: bgColor }
})

// 背景样式
const backgroundStyle = computed(() => {
  if (customBackground.value) {
    console.log('应用背景样式，背景数据长度:', customBackground.value.length)

    // base64 data URL需要包裹在url()中，但要正确处理引号
    const style = {
      backgroundImage: `url(${customBackground.value})`,
      backgroundSize: 'cover',
      backgroundPosition: 'center center',
      backgroundRepeat: 'no-repeat',
      backgroundAttachment: 'fixed',
      minHeight: '100vh'
    }
    console.log('背景图URL（前50字符）:', style.backgroundImage.substring(0, 50))
    return style
  }
  console.log('没有自定义背景，使用默认')
  return {}
})

const setActiveTab = (tab: string) => {
  // 生成期间禁止切换页面
  if (isGenerating.value) {
    return
  }
  activeTab.value = tab
}

const handlePoetrySelect = (poetryText: string) => {
  selectedPoetry.value = poetryText
}

// 应用设置
const applySettings = (settings: { backgroundImage: string; widgetSize: string; backgroundOpacity: number }) => {
  console.log('应用设置:', settings)
  console.log('新透明度值:', settings.backgroundOpacity)
  customBackground.value = settings.backgroundImage
  widgetSize.value = settings.widgetSize
  backgroundOpacity.value = settings.backgroundOpacity
  console.log('customBackground更新为:', customBackground.value ? '(已设置)' : '(空)')
  console.log('backgroundOpacity更新为:', backgroundOpacity.value)
}

// 从 localStorage 加载设置
const loadSettings = () => {
  try {
    const savedBg = localStorage.getItem('custom-background')
    const savedSize = localStorage.getItem('widget-size')
    const savedOpacity = localStorage.getItem('background-opacity')

    console.log('从localStorage加载设置:', {
      hasBg: !!savedBg,
      bgLength: savedBg?.length || 0,
      size: savedSize,
      opacity: savedOpacity
    })

    if (savedBg) {
      customBackground.value = savedBg
      console.log('背景图已加载')
    } else {
      console.log('没有保存的背景图')
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

onMounted(() => {
  loadSettings()

  // 强制移除bg-gradient-paper类（如果有自定义背景）
  if (customBackground.value) {
    const el = document.querySelector('.custom-bg-container')
    if (el) {
      el.classList.remove('bg-gradient-paper')
      console.log('已移除bg-gradient-paper类')
    }
  }
})
</script>

