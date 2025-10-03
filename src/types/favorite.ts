/**
 * 收藏项类型
 */
export interface FavoriteItem {
  id: string
  type: 'text-to-image' | 'image-to-text'
  content: string // 诗词文本或图片URL
  result: string // 生成的图片URL或诗词文本
  style?: string // 风格类型
  comment: string // 用户评价
  createdAt: number // 创建时间戳
}
