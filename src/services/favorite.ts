import type { FavoriteItem } from '@/types/favorite'

const STORAGE_KEY = 'poetic-brushstrokes-favorites'

const isQuotaExceededError = (error: unknown): boolean => {
  return error instanceof DOMException && (
    error.name === 'QuotaExceededError' ||
    error.name === 'NS_ERROR_DOM_QUOTA_REACHED'
  )
}

/**
 * 收藏服务 - 管理用户收藏的内容
 */
export class FavoriteService {
  /**
   * 获取所有收藏
   */
  getAll(): FavoriteItem[] {
    try {
      const data = localStorage.getItem(STORAGE_KEY)
      const favorites = data ? JSON.parse(data) : []
      return Array.isArray(favorites) ? favorites : []
    } catch (error) {
      console.error('获取收藏失败:', error)
      return []
    }
  }

  /**
   * 添加收藏
   */
  add(item: Omit<FavoriteItem, 'id' | 'createdAt' | 'comment'>): FavoriteItem {
    try {
      const favorites = this.getAll()
      const newItem: FavoriteItem = {
        ...item,
        id: Date.now().toString(),
        comment: '',
        createdAt: Date.now()
      }
      favorites.unshift(newItem) // 添加到开头
      this.save(favorites)
      return newItem
    } catch (error) {
      console.error('添加收藏失败:', error)
      if (error instanceof Error) {
        throw error
      }
      throw new Error('收藏失败，请重试')
    }
  }

  /**
   * 删除收藏
   */
  remove(id: string): void {
    try {
      const favorites = this.getAll().filter(item => item.id !== id)
      this.save(favorites)
    } catch (error) {
      console.error('删除收藏失败:', error)
      if (error instanceof Error) {
        throw error
      }
      throw new Error('删除失败，请重试')
    }
  }

  /**
   * 更新收藏评价
   */
  updateComment(id: string, comment: string): void {
    try {
      const favorites = this.getAll()
      const item = favorites.find(f => f.id === id)
      if (item) {
        item.comment = comment
        this.save(favorites)
      }
    } catch (error) {
      console.error('更新收藏评价失败:', error)
      if (error instanceof Error) {
        throw error
      }
      throw new Error('保存评价失败，请重试')
    }
  }

  /**
   * 根据ID获取收藏
   */
  getById(id: string): FavoriteItem | undefined {
    return this.getAll().find(item => item.id === id)
  }

  /**
   * 保存到本地存储
   */
  private save(favorites: FavoriteItem[]): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(favorites))
    } catch (error) {
      console.error('保存收藏失败:', error)
      if (isQuotaExceededError(error)) {
        throw new Error('收藏空间不足，请删除部分旧收藏后重试')
      }
      throw new Error('保存收藏失败，请重试')
    }
  }
}

export const favoriteService = new FavoriteService()
