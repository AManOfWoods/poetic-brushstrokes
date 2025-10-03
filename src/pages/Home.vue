<template>
  <div class="w-screen h-screen overflow-hidden bg-gradient-paper relative" :style="backgroundStyle">
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
              诗生画
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
              画生诗
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

// 提供全局生成状态
provide('isGenerating', isGenerating)

// 背景样式
const backgroundStyle = computed(() => {
  if (customBackground.value) {
    return {
      backgroundImage: `url(${customBackground.value})`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat'
    }
  }
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
const applySettings = (settings: { backgroundImage: string; widgetSize: string }) => {
  customBackground.value = settings.backgroundImage
  widgetSize.value = settings.widgetSize
}

// 从 localStorage 加载设置
const loadSettings = () => {
  try {
    const savedBg = localStorage.getItem('custom-background')
    const savedSize = localStorage.getItem('widget-size')

    if (savedBg) {
      customBackground.value = savedBg
    }
    if (savedSize) {
      widgetSize.value = savedSize
    }
  } catch (error) {
    console.error('加载设置失败:', error)
  }
}

onMounted(() => {
  loadSettings()
})
</script>