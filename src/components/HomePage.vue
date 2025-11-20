<template>
  <div class="w-full h-full overflow-hidden flex flex-col relative bg-transparent">
    <!-- Content -->
    <div class="relative z-10 px-6 py-4 pt-20 h-full flex flex-col justify-center max-w-6xl mx-auto">
      <!-- Header flex-shrink-0 -->
      <div class="text-center mb-8 flex-shrink-0">
        <!-- 主标题 -->
        <h1 class="text-5xl md:text-6xl font-bold my-6 leading-tight">
          <span class="bg-gradient-to-r from-orange-600 via-rose-600 to-pink-600 bg-clip-text text-transparent">
            诗画传情
          </span>
        </h1>

        <!-- 副标题 -->
        <div class="inline-block px-6 py-3 mb-4 rounded-full bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200/50">
          <p class="text-xl text-emerald-700 font-semibold">
            隔代美育教学工具
          </p>
        </div>

        <!-- 描述 -->
        <p class="text-2xl text-ink-wash/80 mb-4 max-w-2xl mx-auto leading-relaxed font-medium">
          让古诗词与绘画在AI的笔下相遇
        </p>

        <p class="text-lg text-muted-foreground max-w-md mx-auto opacity-80">
          输入诗词生成绘画，上传画作生成诗词
        </p>
      </div>

      <!-- Feature Cards flex-1 -->
      <div class="grid md:grid-cols-2 gap-10 max-w-6xl mx-auto flex-1 items-center px-6">
        <!-- 诗生画卡片 -->
        <div
          class="relative overflow-hidden p-10 glass-card hover:shadow-2xl transition-all duration-500 group cursor-pointer flex flex-col justify-center rounded-3xl min-h-[350px]"
          @click="$emit('navigate', 'text-to-image')"
        >
          <!-- 装饰性图片背景 -->
          <div
            class="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
            style="background-image: url('/text-to-image-bg.png'); background-size: cover; background-position: center; background-repeat: no-repeat;"
          ></div>

          <div class="relative z-10 text-center">
            <!-- 图标容器 -->
            <div class="relative mb-6">
              <div class="absolute inset-0 bg-gradient-to-br from-orange-400 to-rose-500 opacity-20 rounded-full blur-xl group-hover:opacity-30 transition-opacity"></div>
              <div class="relative w-32 h-32 bg-gradient-to-br from-orange-400 to-rose-500 rounded-full flex items-center justify-center mx-auto transform group-hover:scale-110 group-hover:rotate-3 transition-all duration-500 shadow-xl overflow-hidden">
                <img 
                  :src="poetryIcon" 
                  alt="寻诗入画图标" 
                  class="w-20 h-20 object-contain p-2"
                />
              </div>
            </div>

            <!-- 标题 -->
            <h3 class="text-3xl font-bold text-ink-wash mb-4 group-hover:text-accent transition-colors">
              寻诗入画
            </h3>

            <!-- 描述 -->
            <p class="text-xl text-muted-foreground leading-relaxed mb-6">
              输入古诗词，生成绘画作品
            </p>

            <!-- 装饰性底部线条 -->
            <div class="h-2 w-24 bg-gradient-to-r from-orange-400 to-rose-500 rounded-full mx-auto opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          </div>
        </div>

        <!-- 画生诗卡片 -->
        <div
          class="relative overflow-hidden p-10 glass-card hover:shadow-2xl transition-all duration-500 group cursor-pointer flex flex-col justify-center rounded-3xl min-h-[350px]"
          @click="$emit('navigate', 'image-to-text')"
        >
          <!-- 装饰性图片背景 -->
          <div
            class="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
            style="background-image: url('/image-to-text-bg.png'); background-size: cover; background-position: center; background-repeat: no-repeat;"
          ></div>

          <div class="relative z-10 text-center">
            <!-- 图标容器 -->
            <div class="relative mb-6">
              <div class="absolute inset-0 bg-gradient-to-br from-emerald-500 to-teal-600 opacity-20 rounded-full blur-xl group-hover:opacity-30 transition-opacity"></div>
              <div class="relative w-32 h-32 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-full flex items-center justify-center mx-auto transform group-hover:scale-110 group-hover:rotate-3 transition-all duration-500 shadow-xl overflow-hidden">
                <img 
                  :src="galleryIcon" 
                  alt="览画成诗图标" 
                  class="w-20 h-20 object-contain p-2"
                />
              </div>
            </div>

            <!-- 标题 -->
            <h3 class="text-3xl font-bold text-ink-wash mb-4 group-hover:text-bamboo-green transition-colors">
              览画成诗
            </h3>

            <!-- 描述 -->
            <p class="text-xl text-muted-foreground leading-relaxed mb-6">
              上传绘画作品，创作古诗词
            </p>

            <!-- 装饰性底部线条 -->
            <div class="h-2 w-24 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-full mx-auto opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// 导入自定义图标
import poetryIcon from '@/assets/poetry-icon.png'
import galleryIcon from '@/assets/gallery-icon.png'

// 使用本地背景图片
const backgroundImage = new URL('@/assets/bg.jpg', import.meta.url).href

defineEmits<{
  navigate: [tab: string]
}>()
</script>