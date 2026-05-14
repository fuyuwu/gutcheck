import { ref } from 'vue'
import { v4 as uuidv4 } from 'uuid'
import type { Toast } from '@/types'

// store 放在 composable 外面，讓所有呼叫方共用同一份 toasts
const toasts = ref<Toast[]>([])

export function useToast() {
  function show(message: string, type: Toast['type'] = 'info', duration = 3000) {
    const id = uuidv4()
    toasts.value.push({ id, message, type, duration })
    setTimeout(() => dismiss(id), duration)
  }

  function dismiss(id: string) {
    toasts.value = toasts.value.filter((t) => t.id !== id)
  }

  // 語意化的 helper，讓呼叫端不用傳 type
  const success = (msg: string) => show(msg, 'success')
  const warning = (msg: string) => show(msg, 'warning')
  const info = (msg: string) => show(msg, 'info')

  return { toasts, show, dismiss, success, warning, info }
}
