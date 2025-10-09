<template>
  <div class="w-full h-full overflow-hidden flex flex-col relative bg-transparent">
    <!-- Content -->
    <div class="relative z-10 px-4 py-2 pt-20 h-full flex flex-col justify-center max-w-4xl mx-auto">
      <!-- Header flex-shrink-0 -->
      <div class="text-center mb-6 flex-shrink-0">
        <!-- 标签 -->
        <div class="mb-4 inline-flex items-center gap-2 px-4 py-2 rounded-full glass-card shadow-lg">
          <div class="w-2 h-2 bg-rose-500 rounded-full animate-pulse"></div>
          <span class="text-sm font-medium bg-gradient-to-r from-rose-600 to-orange-600 bg-clip-text text-transparent">
            AI 诗画创作工具
          </span>
        </div>

        <!-- 主标题 -->
        <h1 class="text-4xl md:text-5xl font-bold mb-3 leading-tight">
          <span class="bg-gradient-to-r from-orange-600 via-rose-600 to-pink-600 bg-clip-text text-transparent">
            诗画传情
          </span>
        </h1>

        <!-- 副标题 -->
        <div class="inline-block px-5 py-2 mb-4 rounded-full bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200/50">
          <p class="text-base text-emerald-700 font-semibold">
            隔代美育教学工具
          </p>
        </div>

        <!-- 描述 -->
        <p class="text-xl text-ink-wash/80 mb-2 max-w-2xl mx-auto leading-relaxed font-medium">
          让古诗词与绘画在AI的笔下相遇
        </p>

        <p class="text-sm text-muted-foreground max-w-md mx-auto opacity-80">
          输入诗词生成绘画，上传画作生成诗词
        </p>
      </div>

      <!-- Feature Cards flex-1 -->
      <div class="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto flex-1 items-center px-4">
        <!-- 诗生画卡片 -->
        <div
          class="relative overflow-hidden p-8 glass-card hover:shadow-2xl transition-all duration-500 group cursor-pointer flex flex-col justify-center rounded-2xl"
          @click="$emit('navigate', 'text-to-image')"
        >
          <!-- 装饰性图片背景 -->
          <div
            class="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
            style="background-image: url('/text-to-image-bg.png'); background-size: cover; background-position: center; background-repeat: no-repeat;"
          ></div>

          <div class="relative z-10 text-center">
            <!-- 图标容器 -->
            <div class="relative mb-5">
              <div class="absolute inset-0 bg-gradient-to-br from-orange-400 to-rose-500 opacity-20 rounded-2xl blur-xl group-hover:opacity-30 transition-opacity"></div>
              <div class="relative w-16 h-16 bg-gradient-to-br from-orange-400 to-rose-500 rounded-2xl flex items-center justify-center mx-auto transform group-hover:scale-110 group-hover:rotate-3 transition-all duration-500 shadow-lg">
                <FeatherIcon class="w-8 h-8 text-white" />
              </div>
            </div>

            <!-- 标题 -->
            <h3 class="text-2xl font-bold text-ink-wash mb-3 group-hover:text-accent transition-colors">
              寻诗入画
            </h3>

            <!-- 描述 -->
            <p class="text-base text-muted-foreground leading-relaxed mb-4">
              输入古诗词，AI 为您生成对应意境的绘画作品
            </p>

            <!-- 装饰性底部线条 -->
            <div class="h-1 w-20 bg-gradient-to-r from-orange-400 to-rose-500 rounded-full mx-auto opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          </div>
        </div>

        <!-- 画生诗卡片 -->
        <div
          class="relative overflow-hidden p-8 glass-card hover:shadow-2xl transition-all duration-500 group cursor-pointer flex flex-col justify-center rounded-2xl"
          @click="$emit('navigate', 'image-to-text')"
        >
          <!-- 装饰性图片背景 -->
          <div
            class="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
            style="background-image: url('/image-to-text-bg.png'); background-size: cover; background-position: center; background-repeat: no-repeat;"
          ></div>

          <div class="relative z-10 text-center">
            <!-- 图标容器 -->
            <div class="relative mb-5">
              <div class="absolute inset-0 bg-gradient-to-br from-emerald-500 to-teal-600 opacity-20 rounded-2xl blur-xl group-hover:opacity-30 transition-opacity"></div>
              <div class="relative w-16 h-16 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center mx-auto transform group-hover:scale-110 group-hover:rotate-3 transition-all duration-500 shadow-lg">
                <BrushIcon class="w-8 h-8 text-white" />
              </div>
            </div>

            <!-- 标题 -->
            <h3 class="text-2xl font-bold text-ink-wash mb-3 group-hover:text-bamboo-green transition-colors">
              览画成诗
            </h3>

            <!-- 描述 -->
            <p class="text-base text-muted-foreground leading-relaxed mb-4">
              上传绘画作品，AI 为您创作对应的诗词
            </p>

            <!-- 装饰性底部线条 -->
            <div class="h-1 w-20 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-full mx-auto opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Heart as HeartIcon, Feather as FeatherIcon, Paintbrush as BrushIcon, Sparkles as SparklesIcon } from 'lucide-vue-next'

// 使用本地背景图片
const backgroundImage = new URL('@/assets/bg.jpg', import.meta.url).href

defineEmits<{
  navigate: [tab: string]
}>()
</script>