<script setup lang="ts">
import { computed } from 'vue'
import { useBodyStats } from '@/stores/useBodyStats'
import { useFoodLog } from '@/stores/useFoodLog'
import { useSettings } from '@/stores/useSettings'

const bodyStats = useBodyStats()
const foodLog = useFoodLog()
const settingsStore = useSettings()

// 過去 7 天日期字串（從舊到新）
const last7Dates = computed(() => bodyStats.last7Days.map((s) => s.date))

// 過去 7 天每日熱量（對應 last7Days）
const caloriesByDate = computed(() => {
  return last7Dates.value.map((date) => {
    const log = foodLog.logs.find((l) => l.date === date)
    if (!log) return 0
    return Math.round(log.foodEntries.reduce((sum, e) => sum + e.calories * e.quantity, 0))
  })
})

// 7 日平均熱量（只計算有記錄的天）
const avgCalories = computed(() => {
  const nonZero = caloriesByDate.value.filter((c) => c > 0)
  if (nonZero.length === 0) return null
  return Math.round(nonZero.reduce((a, b) => a + b, 0) / nonZero.length)
})

// bar chart 高度計算
function barHeights(values: (number | undefined)[], minNonZero = true) {
  const nums = values.map((v) => v ?? 0)
  const max = Math.max(...nums)
  if (max === 0) return nums.map(() => 0)
  return nums.map((v) => (minNonZero && v === 0 ? 0 : Math.max(4, Math.round((v / max) * 100))))
}

const weightHeights = computed(() => barHeights(bodyStats.last7Days.map((s) => s.weight)))
const sleepHeights = computed(() => barHeights(bodyStats.last7Days.map((s) => s.sleep)))
const waterHeights = computed(() => barHeights(bodyStats.last7Days.map((s) => s.water)))
const calorieHeights = computed(() => barHeights(caloriesByDate.value))

function shortDate(dateStr: string) {
  const d = new Date(dateStr + 'T00:00:00')
  return d.toLocaleDateString('zh-TW', { month: 'numeric', day: 'numeric' })
}

function shortWeekday(dateStr: string) {
  const d = new Date(dateStr + 'T00:00:00')
  return ['日', '一', '二', '三', '四', '五', '六'][d.getDay()]
}

const isToday = (dateStr: string) => dateStr === last7Dates.value[last7Dates.value.length - 1]
</script>

<template>
  <div class="flex flex-col gap-6">
    <h1 class="text-xl font-semibold text-gray-800">趨勢</h1>

    <!-- 概覽卡片 -->
    <div class="grid grid-cols-2 gap-3">
      <div class="bg-white rounded-2xl shadow-sm px-4 py-3.5">
        <p class="text-xs text-gray-400">7 日平均體重</p>
        <p class="text-2xl font-semibold text-gray-800 mt-1">
          {{ bodyStats.weeklyAvgWeight != null ? bodyStats.weeklyAvgWeight : '－' }}
          <span class="text-sm font-normal text-gray-400">kg</span>
        </p>
      </div>
      <div class="bg-white rounded-2xl shadow-sm px-4 py-3.5">
        <p class="text-xs text-gray-400">7 日平均睡眠</p>
        <p class="text-2xl font-semibold text-gray-800 mt-1">
          {{ bodyStats.weeklyAvgSleep != null ? bodyStats.weeklyAvgSleep : '－' }}
          <span class="text-sm font-normal text-gray-400">hr</span>
        </p>
      </div>
      <div class="bg-white rounded-2xl shadow-sm px-4 py-3.5">
        <p class="text-xs text-gray-400">7 日平均熱量</p>
        <p class="text-2xl font-semibold text-gray-800 mt-1">
          {{ avgCalories != null ? avgCalories : '－' }}
          <span class="text-sm font-normal text-gray-400">kcal</span>
        </p>
      </div>
      <div class="bg-white rounded-2xl shadow-sm px-4 py-3.5">
        <p class="text-xs text-gray-400">熱量目標</p>
        <p class="text-2xl font-semibold text-gray-800 mt-1">
          {{ settingsStore.settings.dailyCaloriesGoal ?? '未設定' }}
          <span v-if="settingsStore.settings.dailyCaloriesGoal" class="text-sm font-normal text-gray-400">kcal</span>
        </p>
      </div>
    </div>

    <!-- 體重趨勢 -->
    <section class="bg-white rounded-2xl shadow-sm p-4">
      <h2 class="text-sm font-semibold text-gray-700 mb-4">⚖️ 體重（過去 7 天）</h2>
      <div class="flex items-end gap-1.5 h-24">
        <div
          v-for="(s, i) in bodyStats.last7Days"
          :key="s.date"
          class="flex-1 flex flex-col items-center gap-1"
        >
          <span class="text-xs text-gray-400 leading-none" style="min-height: 1rem">
            {{ s.weight != null ? s.weight : '' }}
          </span>
          <div class="w-full flex items-end justify-center" style="height: 60px">
            <div
              class="w-full rounded-t-md transition-all duration-500"
              :class="isToday(s.date) ? 'bg-emerald-400' : 'bg-emerald-200'"
              :style="{ height: weightHeights[i] + '%' }"
            />
          </div>
          <span
            class="text-xs leading-none"
            :class="isToday(s.date) ? 'text-emerald-600 font-semibold' : 'text-gray-400'"
          >
            {{ shortWeekday(s.date) }}
          </span>
        </div>
      </div>
    </section>

    <!-- 睡眠趨勢 -->
    <section class="bg-white rounded-2xl shadow-sm p-4">
      <h2 class="text-sm font-semibold text-gray-700 mb-4">😴 睡眠（過去 7 天）</h2>
      <div class="flex items-end gap-1.5 h-24">
        <div
          v-for="(s, i) in bodyStats.last7Days"
          :key="s.date"
          class="flex-1 flex flex-col items-center gap-1"
        >
          <span class="text-xs text-gray-400 leading-none" style="min-height: 1rem">
            {{ s.sleep != null ? s.sleep : '' }}
          </span>
          <div class="w-full flex items-end justify-center" style="height: 60px">
            <div
              class="w-full rounded-t-md transition-all duration-500"
              :class="isToday(s.date) ? 'bg-purple-400' : 'bg-purple-200'"
              :style="{ height: sleepHeights[i] + '%' }"
            />
          </div>
          <span
            class="text-xs leading-none"
            :class="isToday(s.date) ? 'text-purple-600 font-semibold' : 'text-gray-400'"
          >
            {{ shortWeekday(s.date) }}
          </span>
        </div>
      </div>
    </section>

    <!-- 水分趨勢 -->
    <section class="bg-white rounded-2xl shadow-sm p-4">
      <h2 class="text-sm font-semibold text-gray-700 mb-4">💧 水分（過去 7 天）</h2>
      <div class="flex items-end gap-1.5 h-24">
        <div
          v-for="(s, i) in bodyStats.last7Days"
          :key="s.date"
          class="flex-1 flex flex-col items-center gap-1"
        >
          <span class="text-xs text-gray-400 leading-none" style="min-height: 1rem">
            {{ s.water > 0 ? s.water : '' }}
          </span>
          <div class="w-full flex items-end justify-center" style="height: 60px">
            <div
              class="w-full rounded-t-md transition-all duration-500"
              :class="isToday(s.date) ? 'bg-sky-400' : 'bg-sky-200'"
              :style="{ height: waterHeights[i] + '%' }"
            />
          </div>
          <span
            class="text-xs leading-none"
            :class="isToday(s.date) ? 'text-sky-600 font-semibold' : 'text-gray-400'"
          >
            {{ shortWeekday(s.date) }}
          </span>
        </div>
      </div>
      <div class="mt-2 flex items-center gap-1.5 text-xs text-gray-400">
        <span>目標：{{ settingsStore.settings.waterGoal }} 杯</span>
      </div>
    </section>

    <!-- 熱量趨勢 -->
    <section class="bg-white rounded-2xl shadow-sm p-4">
      <h2 class="text-sm font-semibold text-gray-700 mb-4">🔥 熱量（過去 7 天）</h2>
      <div class="flex items-end gap-1.5 h-24">
        <div
          v-for="(date, i) in last7Dates"
          :key="date"
          class="flex-1 flex flex-col items-center gap-1"
        >
          <span class="text-xs text-gray-400 leading-none" style="min-height: 1rem">
            {{ caloriesByDate[i] > 0 ? caloriesByDate[i] : '' }}
          </span>
          <div class="w-full flex items-end justify-center" style="height: 60px">
            <div
              class="w-full rounded-t-md transition-all duration-500"
              :class="isToday(date) ? 'bg-orange-400' : 'bg-orange-200'"
              :style="{ height: calorieHeights[i] + '%' }"
            />
          </div>
          <span
            class="text-xs leading-none"
            :class="isToday(date) ? 'text-orange-500 font-semibold' : 'text-gray-400'"
          >
            {{ shortWeekday(date) }}
          </span>
        </div>
      </div>
      <div v-if="settingsStore.settings.dailyCaloriesGoal" class="mt-2 text-xs text-gray-400">
        目標：{{ settingsStore.settings.dailyCaloriesGoal }} kcal
      </div>
    </section>
  </div>
</template>
