import type { FavoriteItem } from '@/types/favorite'

const STORAGE_KEY = 'poetic-brushstrokes-favorites'

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
      return data ? JSON.parse(data) : []
    } catch (error) {
      console.error('获取收藏失败:', error)
      return []
    }
  }

  /**
   * 添加收藏
   */
  add(item: Omit<FavoriteItem, 'id' | 'createdAt' | 'comment'>): FavoriteItem {
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
  }

  /**
   * 删除收藏
   */
  remove(id: string): void {
    const favorites = this.getAll().filter(item => item.id !== id)
    this.save(favorites)
  }

  /**
   * 更新收藏评价
   */
  updateComment(id: string, comment: string): void {
    const favorites = this.getAll()
    const item = favorites.find(f => f.id === id)
    if (item) {
      item.comment = comment
      this.save(favorites)
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
    }
  }
}

export const favoriteService = new FavoriteService()
