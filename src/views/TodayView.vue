<script setup lang="ts">
import { ref } from 'vue'
import { useBodyStats } from '@/stores/useBodyStats'
import { useFoodLog } from '@/stores/useFoodLog'
import StatCard from '@/components/today/StatCard.vue'
import WaterTracker from '@/components/today/WaterTracker.vue'
import AddFoodModal from '@/components/today/AddFoodModal.vue'
import EditStatsModal from '@/components/today/EditStatsModal.vue'
import type { FoodEntry } from '@/types'

const bodyStats = useBodyStats()
const foodLog = useFoodLog()
const showStatsModal = ref(false)
const activeMeal = ref<FoodEntry['meal'] | null>(null)

const meals: { meal: FoodEntry['meal']; label: string; icon: string }[] = [
  { meal: 'breakfast', label: '早餐', icon: '🍳' },
  { meal: 'lunch', label: '午餐', icon: '🍱' },
  { meal: 'snack', label: '下午茶', icon: '🧋' },
  { meal: 'dinner', label: '晚餐', icon: '🍽️' },
]

function entriesForMeal(meal: FoodEntry['meal']) {
  return foodLog.todayFoodEntries?.filter((e) => e.meal === meal) ?? []
}

function mealCalories(meal: FoodEntry['meal']) {
  return entriesForMeal(meal).reduce((sum, e) => sum + e.calories, 0)
}

const today = new Date().toLocaleDateString('zh-TW', {
  year: 'numeric',
  month: 'long',
  day: 'numeric',
  weekday: 'short',
})
</script>

<template>
  <div class="flex flex-col gap-4">
    <!-- 頂部打招呼 -->
    <div>
      <h1 class="text-xl font-semibold text-gray-800">早安 👋</h1>
      <p class="text-sm text-gray-400 mt-0.5">{{ today }}</p>
    </div>

    <!-- 三格數據卡 -->
    <div class="flex items-center justify-between">
      <h2 class="text-sm font-medium text-gray-700">今日數據</h2>
      <button
        class="text-sm font-medium text-emerald-500 hover:text-emerald-600 transition-colors"
        @click="showStatsModal = true"
      >
        ✏️ 編輯
      </button>
    </div>
    <div class="grid grid-cols-3 gap-3">
      <StatCard
        label="體重"
        :value="bodyStats.todayStats.weight ?? '－'"
        unit="kg"
        icon="⚖️"
        color="green"
      />
      <StatCard
        label="睡眠"
        :value="bodyStats.todayStats.sleep ?? '－'"
        unit="hr"
        icon="😴"
        color="purple"
      />
      <StatCard label="水分" :value="bodyStats.todayStats.water" unit="杯" icon="💧" color="blue" />
    </div>

    <!-- 喝水追蹤器 -->
    <WaterTracker />

    <!-- 餐別飲食卡片 -->
    <h2 class="text-sm font-medium text-gray-700">今日飲食</h2>

    <div v-for="{ meal, label, icon } in meals" :key="meal" class="bg-white rounded-2xl shadow-sm overflow-hidden">
      <!-- 餐別標頭 -->
      <div class="flex items-center justify-between px-4 py-3">
        <div class="flex items-center gap-2">
          <span class="text-lg">{{ icon }}</span>
          <span class="text-sm font-semibold text-gray-700">{{ label }}</span>
          <span v-if="mealCalories(meal) > 0" class="text-xs text-gray-400">
            {{ Math.round(mealCalories(meal)) }} kcal
          </span>
        </div>
        <button
          class="text-sm font-medium text-emerald-500 hover:text-emerald-600 transition-colors"
          @click="activeMeal = meal"
        >
          ＋ 新增
        </button>
      </div>

      <!-- 食物列表 -->
      <TransitionGroup
        v-if="entriesForMeal(meal).length > 0"
        name="food"
        tag="div"
        class="border-t border-gray-100 divide-y divide-gray-50"
      >
        <div
          v-for="entry in entriesForMeal(meal)"
          :key="entry.id"
          class="flex items-center gap-3 px-4 py-2.5"
        >
          <div class="flex-1 min-w-0">
            <p class="text-sm text-gray-800 truncate">{{ entry.foodName }}</p>
            <p v-if="entry.note" class="text-xs text-gray-400 truncate">{{ entry.note }}</p>
          </div>
          <div class="flex items-center gap-2 shrink-0">
            <span class="text-xs text-gray-400">
              {{ entry.quantity !== 1 ? `×${entry.quantity} · ` : '' }}{{ Math.round(entry.calories) }} kcal
            </span>
            <button
              class="text-gray-300 hover:text-red-400 transition-colors text-base"
              @click="foodLog.removeFoodEntry(entry.id)"
            >
              ✕
            </button>
          </div>
        </div>
      </TransitionGroup>

      <!-- 空狀態 -->
      <p v-else class="px-4 pb-3 text-xs text-gray-300">尚無記錄</p>
    </div>

    <!-- Modals -->
    <EditStatsModal v-if="showStatsModal" @close="showStatsModal = false" />
    <AddFoodModal
      v-if="activeMeal !== null"
      :default-meal="activeMeal"
      @close="activeMeal = null"
    />
  </div>
</template>

<style scoped>
.food-enter-active,
.food-leave-active {
  transition: all 0.2s ease;
}
.food-enter-from {
  opacity: 0;
  transform: translateY(-6px);
}
.food-leave-to {
  opacity: 0;
  transform: translateX(12px);
}
</style>
