<script setup lang="ts">
import { useWaterTracker } from '@/composables/useWaterTracker'

const { current, goal, percentage, isGoalReached, add, remove, cups } = useWaterTracker()
</script>

<template>
  <div class="bg-white rounded-2xl p-4 shadow-sm flex flex-col gap-3">
    <div class="flex items-center justify-between">
      <span class="text-sm font-medium text-gray-700">💧 今日水分</span>
      <span class="text-sm text-gray-400">{{ current }} / {{ goal }} 杯</span>
    </div>

    <!-- 進度條 -->
    <div class="h-2 bg-gray-100 rounded-full overflow-hidden">
      <div
        class="h-full rounded-full transition-all duration-300"
        :class="isGoalReached ? 'bg-emerald-400' : 'bg-blue-400'"
        :style="{ width: `${percentage}%` }"
      />
    </div>

    <!-- 杯子格 -->
    <div class="flex flex-wrap gap-2">
      <div
        v-for="cup in cups"
        :key="cup.index"
        class="w-8 h-8 rounded-lg flex items-center justify-center text-base transition-all duration-200"
        :class="cup.filled ? 'bg-blue-100 text-blue-500' : 'bg-gray-100 text-gray-300'"
      >
        💧
      </div>
    </div>

    <!-- 按鈕 -->
    <div class="flex gap-2 mt-1">
      <button
        class="flex-1 py-2 rounded-xl text-sm font-medium bg-gray-100 text-gray-500 hover:bg-gray-200 transition-colors"
        @click="remove"
      >
        － 減一杯
      </button>
      <button
        class="flex-1 py-2 rounded-xl text-sm font-medium bg-blue-500 text-white hover:bg-blue-600 transition-colors"
        :class="isGoalReached ? 'opacity-50 cursor-not-allowed' : ''"
        @click="add"
      >
        ＋ 加一杯
      </button>
    </div>
  </div>
</template>
