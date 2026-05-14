<script setup lang="ts">
import { ref } from 'vue'
import { useSettings } from '@/stores/useSettings'
import { useToast } from '@/composables/useToast'

const settingsStore = useSettings()
const toast = useToast()

const waterGoal = ref(settingsStore.settings.waterGoal)
const sleepGoal = ref(settingsStore.settings.sleepGoal)
const weightGoal = ref<number | undefined>(settingsStore.settings.weightGoal)
const dailyCaloriesGoal = ref<number | undefined>(settingsStore.settings.dailyCaloriesGoal)

function save() {
  settingsStore.updateSettings({
    waterGoal: waterGoal.value,
    sleepGoal: sleepGoal.value,
    weightGoal: weightGoal.value || undefined,
    dailyCaloriesGoal: dailyCaloriesGoal.value || undefined,
  })
  toast.success('設定已儲存 ✓')
}

function reset() {
  settingsStore.resetSettings()
  waterGoal.value = settingsStore.settings.waterGoal
  sleepGoal.value = settingsStore.settings.sleepGoal
  weightGoal.value = undefined
  dailyCaloriesGoal.value = undefined
  toast.info('已恢復預設值')
}
</script>

<template>
  <div class="flex flex-col gap-6">
    <h1 class="text-xl font-semibold text-gray-800">設定</h1>

    <!-- 每日目標 -->
    <section class="flex flex-col gap-3">
      <h2 class="text-sm font-medium text-gray-500 uppercase tracking-wide">每日目標</h2>

      <div class="bg-white rounded-2xl shadow-sm divide-y divide-gray-100">
        <!-- 水分目標 -->
        <div class="flex items-center gap-3 px-4 py-3.5">
          <span class="text-xl w-7 text-center">💧</span>
          <label class="flex-1 text-sm text-gray-700">水分目標</label>
          <div class="flex items-center gap-1.5">
            <input
              v-model.number="waterGoal"
              type="number"
              min="1"
              max="20"
              step="1"
              class="w-16 text-right border border-gray-200 rounded-lg px-2 py-1 text-sm outline-none focus:border-emerald-400 transition-colors"
            />
            <span class="text-xs text-gray-400">杯</span>
          </div>
        </div>

        <!-- 睡眠目標 -->
        <div class="flex items-center gap-3 px-4 py-3.5">
          <span class="text-xl w-7 text-center">😴</span>
          <label class="flex-1 text-sm text-gray-700">睡眠目標</label>
          <div class="flex items-center gap-1.5">
            <input
              v-model.number="sleepGoal"
              type="number"
              min="1"
              max="12"
              step="0.5"
              class="w-16 text-right border border-gray-200 rounded-lg px-2 py-1 text-sm outline-none focus:border-emerald-400 transition-colors"
            />
            <span class="text-xs text-gray-400">hr</span>
          </div>
        </div>

        <!-- 體重目標 -->
        <div class="flex items-center gap-3 px-4 py-3.5">
          <span class="text-xl w-7 text-center">⚖️</span>
          <label class="flex-1 text-sm text-gray-700">體重目標</label>
          <div class="flex items-center gap-1.5">
            <input
              v-model.number="weightGoal"
              type="number"
              min="20"
              max="300"
              step="0.1"
              placeholder="選填"
              class="w-20 text-right border border-gray-200 rounded-lg px-2 py-1 text-sm outline-none focus:border-emerald-400 transition-colors placeholder:text-gray-300"
            />
            <span class="text-xs text-gray-400">kg</span>
          </div>
        </div>

        <!-- 每日熱量目標 -->
        <div class="flex items-center gap-3 px-4 py-3.5">
          <span class="text-xl w-7 text-center">🔥</span>
          <label class="flex-1 text-sm text-gray-700">每日熱量目標</label>
          <div class="flex items-center gap-1.5">
            <input
              v-model.number="dailyCaloriesGoal"
              type="number"
              min="500"
              max="5000"
              step="50"
              placeholder="選填"
              class="w-20 text-right border border-gray-200 rounded-lg px-2 py-1 text-sm outline-none focus:border-emerald-400 transition-colors placeholder:text-gray-300"
            />
            <span class="text-xs text-gray-400">kcal</span>
          </div>
        </div>
      </div>
    </section>

    <!-- 操作按鈕 -->
    <div class="flex flex-col gap-2">
      <button
        class="w-full py-3 rounded-xl text-sm font-medium bg-emerald-500 text-white hover:bg-emerald-600 active:bg-emerald-700 transition-colors"
        @click="save"
      >
        儲存設定
      </button>
      <button
        class="w-full py-3 rounded-xl text-sm font-medium text-gray-400 hover:text-gray-600 transition-colors"
        @click="reset"
      >
        恢復預設值
      </button>
    </div>
  </div>
</template>
