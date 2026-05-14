<script setup lang="ts">
import { useFoodLog } from '@/stores/useFoodLog'

const foodLog = useFoodLog()

const mealMeta: Record<string, { label: string; icon: string }> = {
  breakfast: { label: '早餐', icon: '🍳' },
  lunch: { label: '午餐', icon: '🍱' },
  dinner: { label: '晚餐', icon: '🍽️' },
  snack: { label: '點心', icon: '🍪' },
}
</script>

<template>
  <div class="flex flex-col gap-2">
    <TransitionGroup name="food" tag="div" class="flex flex-col gap-2">
      <div
        v-for="entry in foodLog.todayFoodEntries"
        :key="entry.id"
        class="bg-white rounded-2xl px-4 py-3 flex items-center gap-3 shadow-sm"
      >
        <span class="text-2xl">{{ mealMeta[entry.meal]?.icon }}</span>
        <div class="flex-1 min-w-0">
          <p class="text-sm font-medium text-gray-800 truncate">{{ entry.foodName }}</p>
          <p v-if="entry.note" class="text-xs text-gray-400 truncate">{{ entry.note }}</p>
        </div>
        <div class="flex items-center gap-2">
          <span class="text-xs text-gray-400">{{ mealMeta[entry.meal]?.label }}</span>
          <button
            class="text-gray-300 hover:text-red-400 transition-colors text-lg"
            @click="foodLog.removeFoodEntry(entry.id)"
          >
            ✕
          </button>
        </div>
      </div>
    </TransitionGroup>

    <div
      v-if="foodLog.todayFoodEntries.length === 0"
      class="text-center py-6 text-gray-400 text-sm"
    >
      今天還沒有飲食記錄
    </div>
  </div>
</template>

<style scoped>
.food-enter-active,
.food-leave-active {
  transition: all 0.25s ease;
}
.food-enter-from {
  opacity: 0;
  transform: translateY(-8px);
}
.food-leave-to {
  opacity: 0;
  transform: translateX(16px);
}
</style>
