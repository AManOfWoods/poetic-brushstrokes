<template>
  <div class="w-full h-full overflow-hidden bg-transparent relative">
    <div class="h-full max-w-6xl mx-auto px-8 p-2 pt-20 pb-8 flex flex-col relative z-10">
      <!-- Header -->
      <div class="text-center mb-4 flex-shrink-0">
        <h2 class="text-2xl md:text-3xl font-bold text-ink-wash mb-2">我的收藏</h2>
        <p class="text-base text-muted-foreground">记录您喜爱的作品和感悟</p>
      </div>

      <!-- Favorites List -->
      <div class="flex-1 overflow-y-auto">
        <div v-if="favorites.length === 0" class="flex items-center justify-center h-full">
          <div class="text-center">
            <HeartIcon class="w-16 h-16 text-mountain-mist mx-auto mb-4" />
            <p class="text-lg text-mountain-mist mb-2">还没有收藏</p>
            <p class="text-sm text-muted-foreground">在寻诗入画或览画成诗界面收藏您喜欢的作品</p>
          </div>
        </div>

        <div v-else class="grid md:grid-cols-2 lg:grid-cols-3 gap-4 pb-4">
          <div
            v-for="item in favorites"
            :key="item.id"
            class="bg-silk-white/80 rounded-lg shadow-paper overflow-hidden hover:shadow-floating transition-brush"
          >
            <!-- Content Area -->
            <div class="p-4">
              <div class="flex items-start justify-between mb-3">
                <span class="text-xs px-2 py-1 rounded-full" :class="item.type === 'text-to-image' ? 'bg-accent/10 text-accent' : 'bg-bamboo-green/10 text-bamboo-green'">
                  {{ item.type === 'text-to-image' ? '寻诗入画' : '览画成诗' }}
                </span>
                <button
                  @click="handleDelete(item.id)"
                  class="text-mountain-mist hover:text-red-500 transition-colors"
                >
                  <TrashIcon class="w-4 h-4" />
                </button>
              </div>

              <!-- 诗生画：显示图片 -->
              <div v-if="item.type === 'text-to-image'" class="mb-3">
                <div class="relative bg-gradient-mist rounded-lg overflow-hidden" style="aspect-ratio: 1/1;">
                  <img
                    :src="item.result"
                    alt="Generated artwork"
                    class="w-full h-full object-cover"
                  />
                </div>
                <p class="text-sm text-ink-wash mt-2 line-clamp-2">{{ item.content }}</p>
              </div>

              <!-- 画生诗：显示诗词 -->
              <div v-else class="mb-3">
                <div class="bg-gradient-mist/30 rounded-lg p-3 max-h-32 overflow-y-auto">
                  <p class="text-sm text-ink-wash whitespace-pre-line">{{ item.result }}</p>
                </div>
              </div>

              <!-- 评价输入框 -->
              <div class="mt-3">
                <textarea
                  :value="item.comment"
                  @input="handleCommentChange(item.id, ($event.target as HTMLTextAreaElement).value)"
                  placeholder="写下您的感悟和评价..."
                  class="w-full text-sm border border-mountain-mist/30 rounded-md p-2 resize-none focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20 bg-white/90"
                  rows="3"
                />
              </div>

              <!-- 创建时间 -->
              <div class="mt-2 text-xs text-muted-foreground">
                {{ formatDate(item.createdAt) }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { Heart as HeartIcon, Trash2 as TrashIcon } from 'lucide-vue-next'
import { favoriteService } from '@/services/favorite'
import type { FavoriteItem } from '@/types/favorite'

// 使用本地背景图片
const backgroundImage = new URL('@/assets/bg.jpg', import.meta.url).href

const favorites = ref<FavoriteItem[]>([])

// 加载收藏列表
const loadFavorites = () => {
  favorites.value = favoriteService.getAll()
}

// 删除收藏
const handleDelete = (id: string) => {
  if (confirm('确定要删除这个收藏吗？')) {
    favoriteService.remove(id)
    loadFavorites()
  }
}

// 更新评价
const handleCommentChange = (id: string, comment: string) => {
  favoriteService.updateComment(id, comment)
  // 本地更新，避免重新加载整个列表
  const item = favorites.value.find(f => f.id === id)
  if (item) {
    item.comment = comment
  }
}

// 格式化日期
const formatDate = (timestamp: number) => {
  const date = new Date(timestamp)
  const now = new Date()
  const diff = now.getTime() - date.getTime()

  // 小于1分钟
  if (diff < 60000) {
    return '刚刚'
  }
  // 小于1小时
  if (diff < 3600000) {
    return `${Math.floor(diff / 60000)}分钟前`
  }
  // 小于24小时
  if (diff < 86400000) {
    return `${Math.floor(diff / 3600000)}小时前`
  }
  // 小于7天
  if (diff < 604800000) {
    return `${Math.floor(diff / 86400000)}天前`
  }

  // 否则显示完整日期
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

onMounted(() => {
  loadFavorites()
})
</script>
