import { reactive } from 'vue'

export type ToastVariant = 'success' | 'error' | 'info'

interface ToastPayload {
  duration?: number
  message: string
  title: string
  variant?: ToastVariant
}

interface ToastState {
  duration: number
  message: string
  title: string
  variant: ToastVariant
  visible: boolean
}

const DEFAULT_DURATIONS: Record<ToastVariant, number> = {
  success: 2600,
  error: 3600,
  info: 3000,
}

export const toastState = reactive<ToastState>({
  duration: DEFAULT_DURATIONS.info,
  message: '',
  title: '',
  variant: 'info',
  visible: false,
})

let hideTimer: number | null = null

const clearHideTimer = () => {
  if (hideTimer !== null) {
    window.clearTimeout(hideTimer)
    hideTimer = null
  }
}

const show = ({ duration, message, title, variant = 'info' }: ToastPayload) => {
  clearHideTimer()

  toastState.title = title
  toastState.message = message
  toastState.variant = variant
  toastState.duration = duration ?? DEFAULT_DURATIONS[variant]
  toastState.visible = false

  window.requestAnimationFrame(() => {
    toastState.visible = true
  })

  hideTimer = window.setTimeout(() => {
    toastState.visible = false
    hideTimer = null
  }, toastState.duration)
}

const hide = () => {
  clearHideTimer()
  toastState.visible = false
}

export const toastService = {
  error(message: string, title = '操作失败', duration?: number) {
    show({ duration, message, title, variant: 'error' })
  },

  hide,

  info(message: string, title = '提示', duration?: number) {
    show({ duration, message, title, variant: 'info' })
  },

  success(message: string, title = '操作成功', duration?: number) {
    show({ duration, message, title, variant: 'success' })
  },
}
