<script setup lang="ts">
import { computed } from 'vue'
import { useFoodLog } from '@/stores/useFoodLog'
import { useBodyStats } from '@/stores/useBodyStats'
import type { FoodEntry } from '@/types'

const foodLog = useFoodLog()
const bodyStats = useBodyStats()

const mealMeta: Record<string, { label: string; icon: string }> = {
  breakfast: { label: '早餐', icon: '🍳' },
  lunch: { label: '午餐', icon: '🍱' },
  snack: { label: '下午茶', icon: '🧋' },
  dinner: { label: '晚餐', icon: '🍽️' },
}

const mealOrder: string[] = ['breakfast', 'lunch', 'snack', 'dinner']

// 合併 foodLog 與 bodyStats，以日期為 key
const allLogs = computed(() => {
  const byDate = new Map<
    string,
    { date: string; foodEntries: FoodEntry[]; weight?: number; water: number; sleep?: number }
  >()

  for (const log of foodLog.logs) {
    byDate.set(log.date, {
      date: log.date,
      foodEntries: log.foodEntries,
      weight: log.bodyStats.weight,
      water: log.bodyStats.water,
      sleep: log.bodyStats.sleep,
    })
  }

  for (const stats of bodyStats.statsList) {
    if (!byDate.has(stats.date)) {
      byDate.set(stats.date, {
        date: stats.date,
        foodEntries: [],
        weight: stats.weight,
        water: stats.water,
        sleep: stats.sleep,
      })
    }
  }

  return [...byDate.values()]
    .filter((d) => d.foodEntries.length > 0 || d.weight !== undefined || d.water > 0 || d.sleep !== undefined)
    .sort((a, b) => b.date.localeCompare(a.date))
})

function totalCalories(entries: FoodEntry[]) {
  return entries.reduce((sum, e) => sum + e.calories * e.quantity, 0)
}

function groupByMeal(entries: FoodEntry[]) {
  return mealOrder
    .map((meal) => ({ meal: meal as FoodEntry['meal'], entries: entries.filter((e) => e.meal === meal) }))
    .filter((g) => g.entries.length > 0)
}

function formatDate(dateStr: string) {
  const d = new Date(dateStr + 'T00:00:00')
  return d.toLocaleDateString('zh-TW', { month: 'long', day: 'numeric', weekday: 'short' })
}
</script>

<template>
  <div class="flex flex-col gap-4">
    <h1 class="text-xl font-semibold text-gray-800">歷史記錄</h1>

    <!-- 空狀態 -->
    <div v-if="allLogs.length === 0" class="text-center py-16 text-gray-400 text-sm">
      <p class="text-4xl mb-3">📭</p>
      <p>還沒有任何記錄</p>
      <p class="mt-1 text-xs">從今日頁面開始記錄吧！</p>
    </div>

    <!-- 日誌卡片列表 -->
    <div v-for="log in allLogs" :key="log.date" class="bg-white rounded-2xl shadow-sm overflow-hidden">
      <!-- 日期標頭 -->
      <div class="flex items-center justify-between px-4 py-3 border-b border-gray-100">
        <span class="text-sm font-semibold text-gray-700">{{ formatDate(log.date) }}</span>
        <div class="flex items-center gap-3 text-xs text-gray-400">
          <span v-if="log.weight">⚖️ {{ log.weight }} kg</span>
          <span v-if="log.sleep">😴 {{ log.sleep }} hr</span>
          <span v-if="log.water > 0">💧 {{ log.water }} 杯</span>
        </div>
      </div>

      <!-- 飲食記錄（按 meal 分組） -->
      <div v-if="log.foodEntries.length > 0" class="divide-y divide-gray-50">
        <div v-for="group in groupByMeal(log.foodEntries)" :key="group.meal">
          <!-- Meal 標頭 -->
          <div class="flex items-center gap-2 px-4 pt-3 pb-1">
            <span class="text-base">{{ mealMeta[group.meal]?.icon }}</span>
            <span class="text-xs font-medium text-gray-500">{{ mealMeta[group.meal]?.label }}</span>
          </div>
          <!-- 食物項目 -->
          <div
            v-for="entry in group.entries"
            :key="entry.id"
            class="flex items-center gap-3 px-4 py-2"
          >
            <div class="flex-1 min-w-0">
              <p class="text-sm text-gray-800 truncate">{{ entry.foodName }}</p>
              <p v-if="entry.note" class="text-xs text-gray-400 truncate">{{ entry.note }}</p>
            </div>
            <span class="text-xs text-gray-400 shrink-0">
              {{ entry.quantity !== 1 ? `×${entry.quantity} · ` : '' }}{{ Math.round(entry.calories * entry.quantity) }} kcal
            </span>
          </div>
        </div>

        <!-- 總熱量 -->
        <div class="flex items-center justify-between px-4 py-3 bg-gray-50">
          <span class="text-xs text-gray-500">今日熱量合計</span>
          <span class="text-sm font-semibold text-emerald-600">
            {{ Math.round(totalCalories(log.foodEntries)) }} kcal
          </span>
        </div>
      </div>

      <!-- 只有 bodyStats，沒有食物記錄 -->
      <div v-else class="px-4 py-3 text-xs text-gray-400">
        無飲食記錄
      </div>
    </div>
  </div>
</template>
