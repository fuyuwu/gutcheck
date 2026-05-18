<script setup lang="ts">
import { RouterView, RouterLink, useRoute } from 'vue-router'
import { useToast } from '@/composables/useToast'

const route = useRoute()
const { toasts, dismiss } = useToast()

const navItems = [
  { name: 'today', path: '/', icon: '🏠', label: '今日' },
  { name: 'log', path: '/log', icon: '📋', label: '記錄' },
  { name: 'trend', path: '/trend', icon: '📈', label: '趨勢' },
  { name: 'settings', path: '/settings', icon: '⚙️', label: '設定' },
  { name: 'test', path: '/test', icon: '🧪', label: '測試' },
]

const toastColors = {
  success: 'bg-emerald-500',
  warning: 'bg-amber-400',
  info: 'bg-gray-700',
}
</script>

<template>
  <div class="min-h-screen bg-gray-50 flex flex-col">
    <!-- 頂部 Header -->
    <header class="sticky top-0 z-10 bg-white/80 backdrop-blur border-b border-gray-100">
      <div class="max-w-2xl mx-auto px-4 h-12 flex items-center justify-between">
        <span class="text-base font-bold text-emerald-600 tracking-tight">gutcheck</span>
        <span class="text-xs text-gray-400">by Fufu</span>
      </div>
    </header>

    <!-- 主內容區 -->
    <main class="flex-1 w-full max-w-2xl mx-auto px-4 pt-5 pb-24">
      <RouterView />
    </main>

    <!-- 底部導覽列 -->
    <nav class="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-10">
      <ul class="max-w-2xl mx-auto flex justify-around items-center h-16">
        <li v-for="item in navItems" :key="item.name">
          <RouterLink
            :to="item.path"
            class="flex flex-col items-center gap-0.5 px-4 py-1 rounded-xl transition-colors"
            :class="
              route.name === item.name ? 'text-emerald-600' : 'text-gray-400 hover:text-gray-600'
            "
          >
            <span class="text-xl">{{ item.icon }}</span>
            <span class="text-xs font-medium">{{ item.label }}</span>
          </RouterLink>
        </li>
      </ul>
    </nav>

    <!-- Toast 通知 -->
    <Teleport to="body">
      <div class="fixed top-4 left-0 right-0 z-50 flex flex-col items-center gap-2 pointer-events-none px-4">
        <TransitionGroup name="toast">
          <div
            v-for="toast in toasts"
            :key="toast.id"
            class="pointer-events-auto flex items-center gap-2 px-4 py-2.5 rounded-xl shadow-lg text-white text-sm font-medium max-w-sm w-full"
            :class="toastColors[toast.type]"
            @click="dismiss(toast.id)"
          >
            <span class="flex-1">{{ toast.message }}</span>
            <button class="text-white/70 hover:text-white text-base leading-none">✕</button>
          </div>
        </TransitionGroup>
      </div>
    </Teleport>
  </div>
</template>

<style scoped>
.toast-enter-active,
.toast-leave-active {
  transition: all 0.3s ease;
}
.toast-enter-from {
  opacity: 0;
  transform: translateY(-12px) scale(0.95);
}
.toast-leave-to {
  opacity: 0;
  transform: translateY(-8px) scale(0.95);
}
</style>
