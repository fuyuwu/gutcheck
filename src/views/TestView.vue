<script setup lang="ts">
import { ref, computed } from 'vue'
import { createPinia, setActivePinia } from 'pinia'
import { useSettings } from '@/stores/useSettings'
import { useFoodLog } from '@/stores/useFoodLog'
import { useBodyStats } from '@/stores/useBodyStats'
import { useToast } from '@/composables/useToast'
import router from '@/router'

// ---------- types ----------
interface TestResult {
  suite: string
  name: string
  passed: boolean
  error?: string
  duration: number
}
interface TestCase {
  name: string
  fn: () => void | Promise<void>
}
interface Suite {
  name: string
  icon: string
  tests: TestCase[]
}

// ---------- assertion helpers ----------
function assert(cond: boolean, msg: string) {
  if (!cond) throw new Error(msg)
}
function eq<T>(a: T, b: T, msg?: string) {
  if (JSON.stringify(a) !== JSON.stringify(b))
    throw new Error(msg ?? `expected ${JSON.stringify(b)}, got ${JSON.stringify(a)}`)
}

// ---------- suites ----------
const suites: Suite[] = [
  {
    name: 'useSettings',
    icon: '⚙️',
    tests: [
      {
        name: '預設值 waterGoal=8, sleepGoal=7',
        fn() {
          const s = useSettings()
          eq(s.settings.waterGoal, 8)
          eq(s.settings.sleepGoal, 7)
        },
      },
      {
        name: 'updateSettings 只更新指定欄位',
        fn() {
          const s = useSettings()
          s.updateSettings({ waterGoal: 12 })
          eq(s.settings.waterGoal, 12)
          eq(s.settings.sleepGoal, 7)
        },
      },
      {
        name: 'resetSettings 恢復預設',
        fn() {
          const s = useSettings()
          s.updateSettings({ waterGoal: 20, sleepGoal: 3 })
          s.resetSettings()
          eq(s.settings.waterGoal, 8)
          eq(s.settings.sleepGoal, 7)
        },
      },
      {
        name: 'weightGoal 選填，預設為 undefined',
        fn() {
          const s = useSettings()
          eq(s.settings.weightGoal, undefined)
        },
      },
    ],
  },
  {
    name: 'useFoodLog',
    icon: '🍱',
    tests: [
      {
        name: 'addFoodEntry 後 todayFoodEntries 長度 +1',
        fn() {
          const log = useFoodLog()
          const before = log.todayFoodEntries?.length ?? 0
          log.addFoodEntry({ meal: 'lunch', foodItemId: 'x', foodName: '測試便當', calories: 600, quantity: 1 })
          eq(log.todayFoodEntries?.length, before + 1)
        },
      },
      {
        name: 'addFoodEntry 正確儲存 foodName 與 calories',
        fn() {
          const log = useFoodLog()
          log.addFoodEntry({ meal: 'breakfast', foodItemId: 'y', foodName: '蛋餅', calories: 280, quantity: 1 })
          const entry = log.todayFoodEntries?.find((e) => e.foodName === '蛋餅')
          assert(entry !== undefined, '找不到剛新增的蛋餅')
          eq(entry!.calories, 280)
          eq(entry!.meal, 'breakfast')
        },
      },
      {
        name: 'removeFoodEntry 後 entry 消失',
        fn() {
          const log = useFoodLog()
          log.addFoodEntry({ meal: 'snack', foodItemId: 'z', foodName: '刪除測試', calories: 100, quantity: 1 })
          const entry = log.todayFoodEntries?.find((e) => e.foodName === '刪除測試')
          assert(entry !== undefined, '新增失敗')
          log.removeFoodEntry(entry!.id)
          eq(log.todayFoodEntries?.find((e) => e.foodName === '刪除測試'), undefined)
        },
      },
      {
        name: 'sortedLogs 最新日期排在最前',
        fn() {
          const log = useFoodLog()
          if (log.sortedLogs.length < 2) return
          const dates = log.sortedLogs.map((l) => l.date)
          for (let i = 1; i < dates.length; i++)
            assert(dates[i - 1]! >= dates[i]!, `日期未由新到舊：${dates[i - 1]} < ${dates[i]}`)
        },
      },
    ],
  },
  {
    name: 'useBodyStats',
    icon: '⚖️',
    tests: [
      {
        name: 'incrementWater 後 water +1',
        fn() {
          const bs = useBodyStats()
          const before = bs.todayStats.water
          bs.incrementWater()
          eq(bs.todayStats.water, before + 1)
        },
      },
      {
        name: 'decrementWater 後 water -1，不低於 0',
        fn() {
          const bs = useBodyStats()
          bs.incrementWater()
          const before = bs.todayStats.water
          bs.decrementWater()
          eq(bs.todayStats.water, before - 1)
          for (let i = 0; i < before + 5; i++) bs.decrementWater()
          assert(bs.todayStats.water >= 0, 'water 不應低於 0')
        },
      },
      {
        name: 'updateTodayStats 設定 weight',
        fn() {
          const bs = useBodyStats()
          bs.updateTodayStats({ weight: 62.5 })
          eq(bs.todayStats.weight, 62.5)
        },
      },
      {
        name: '無記錄時 weeklyAvgWeight 為 null',
        fn() {
          const bs = useBodyStats()
          if (bs.last7Days.every((s) => s.weight === undefined))
            eq(bs.weeklyAvgWeight, null)
        },
      },
    ],
  },
  {
    name: 'useToast',
    icon: '🔔',
    tests: [
      {
        name: 'show() 加入一筆 toast',
        fn() {
          const toast = useToast()
          const before = toast.toasts.value.length
          toast.show('測試訊息', 'info', 99999)
          eq(toast.toasts.value.length, before + 1)
          toast.toasts.value.splice(before)
        },
      },
      {
        name: 'dismiss() 移除指定 toast',
        fn() {
          const toast = useToast()
          toast.show('要被刪掉的', 'info', 99999)
          const t = toast.toasts.value[toast.toasts.value.length - 1]!
          toast.dismiss(t.id)
          assert(!toast.toasts.value.find((x) => x.id === t.id), 'dismiss 後 toast 應消失')
        },
      },
      {
        name: 'success / warning / info helpers type 正確',
        fn() {
          const toast = useToast()
          toast.success('s')
          toast.warning('w')
          toast.info('i')
          const last3 = toast.toasts.value.slice(-3)
          eq(last3[0]?.type, 'success')
          eq(last3[1]?.type, 'warning')
          eq(last3[2]?.type, 'info')
          last3.forEach((t) => toast.dismiss(t.id))
        },
      },
    ],
  },
  {
    name: 'Router',
    icon: '🗺️',
    tests: [
      {
        name: '包含 today / log / trend / settings / not-found',
        fn() {
          const names = router.getRoutes().map((r) => r.name)
          ;['today', 'log', 'trend', 'settings', 'not-found'].forEach((n) =>
            assert(names.includes(n), `缺少路由 ${n}`),
          )
        },
      },
      {
        name: '/ → today，/log → log，/trend → trend，/settings → settings',
        fn() {
          eq(router.resolve('/').name, 'today')
          eq(router.resolve('/log').name, 'log')
          eq(router.resolve('/trend').name, 'trend')
          eq(router.resolve('/settings').name, 'settings')
        },
      },
      {
        name: '未知路徑 → not-found',
        fn() {
          eq(router.resolve('/does-not-exist').name, 'not-found')
          eq(router.resolve('/a/b/c').name, 'not-found')
        },
      },
    ],
  },
]

// ---------- state ----------
// resultMap key: "SuiteName::testName"
const resultMap = ref<Record<string, TestResult>>({})
const runningMap = ref<Record<string, boolean>>({})

const appPinia = useSettings().$pinia

function testKey(suiteName: string, testName: string) {
  return `${suiteName}::${testName}`
}
function getResult(suiteName: string, testName: string) {
  return resultMap.value[testKey(suiteName, testName)]
}
function isRunning(suiteName: string, testName: string) {
  return !!runningMap.value[testKey(suiteName, testName)]
}

// ---------- localStorage helpers ----------
const STORAGE_KEYS = ['gutcheck_settings', 'gutcheck_logs', 'gutcheck_stats', 'gutcheck_fooddb']
function saveStorage() {
  const saved: Record<string, string | null> = {}
  STORAGE_KEYS.forEach((k) => { saved[k] = localStorage.getItem(k) })
  return saved
}
function clearStorage() {
  STORAGE_KEYS.forEach((k) => localStorage.removeItem(k))
}
function restoreStorage(saved: Record<string, string | null>) {
  STORAGE_KEYS.forEach((k) => {
    if (saved[k] != null) localStorage.setItem(k, saved[k]!)
    else localStorage.removeItem(k)
  })
}

// ---------- runners ----------
async function runOne(suite: Suite, test: TestCase) {
  const key = testKey(suite.name, test.name)
  runningMap.value[key] = true

  const saved = saveStorage()
  clearStorage()
  setActivePinia(createPinia())

  const start = performance.now()
  try {
    await test.fn()
    resultMap.value[key] = {
      suite: suite.name, name: test.name, passed: true,
      duration: +(performance.now() - start).toFixed(2),
    }
  } catch (e) {
    resultMap.value[key] = {
      suite: suite.name, name: test.name, passed: false,
      error: (e as Error).message,
      duration: +(performance.now() - start).toFixed(2),
    }
  }

  restoreStorage(saved)
  setActivePinia(appPinia)
  runningMap.value[key] = false
}

async function runSuite(suite: Suite) {
  const saved = saveStorage()
  clearStorage()

  for (const test of suite.tests) {
    const key = testKey(suite.name, test.name)
    runningMap.value[key] = true
    setActivePinia(createPinia())
    clearStorage()

    const start = performance.now()
    try {
      await test.fn()
      resultMap.value[key] = { suite: suite.name, name: test.name, passed: true, duration: +(performance.now() - start).toFixed(2) }
    } catch (e) {
      resultMap.value[key] = { suite: suite.name, name: test.name, passed: false, error: (e as Error).message, duration: +(performance.now() - start).toFixed(2) }
    }
    runningMap.value[key] = false
  }

  restoreStorage(saved)
  setActivePinia(appPinia)
}

const globalRunning = computed(() => Object.values(runningMap.value).some(Boolean))

async function runAll() {
  const saved = saveStorage()
  clearStorage()

  for (const suite of suites) {
    for (const test of suite.tests) {
      const key = testKey(suite.name, test.name)
      runningMap.value[key] = true
      setActivePinia(createPinia())
      clearStorage()

      const start = performance.now()
      try {
        await test.fn()
        resultMap.value[key] = { suite: suite.name, name: test.name, passed: true, duration: +(performance.now() - start).toFixed(2) }
      } catch (e) {
        resultMap.value[key] = { suite: suite.name, name: test.name, passed: false, error: (e as Error).message, duration: +(performance.now() - start).toFixed(2) }
      }
      runningMap.value[key] = false
    }
  }

  restoreStorage(saved)
  setActivePinia(appPinia)
}

// ---------- summary ----------
const allResults = computed(() => Object.values(resultMap.value))
const totalCount = computed(() => allResults.value.length)
const passCount = computed(() => allResults.value.filter((r) => r.passed).length)
const failCount = computed(() => totalCount.value - passCount.value)

const totalTests = suites.reduce((n, s) => n + s.tests.length, 0)

function suitePassCount(suiteName: string) {
  return suites
    .find((s) => s.name === suiteName)!
    .tests.filter((t) => getResult(suiteName, t.name)?.passed).length
}
function suiteRanCount(suiteName: string) {
  return suites
    .find((s) => s.name === suiteName)!
    .tests.filter((t) => getResult(suiteName, t.name) !== undefined).length
}
function suiteRunning(suiteName: string) {
  return suites.find((s) => s.name === suiteName)!.tests.some((t) => isRunning(suiteName, t.name))
}
</script>

<template>
  <div class="flex flex-col gap-5">
    <div>
      <h1 class="text-xl font-semibold text-gray-800">單元測試</h1>
      <p class="text-sm text-gray-400 mt-0.5">點 ▶ 執行全部、整個 Suite 或單一測試，可重複執行</p>
    </div>

    <!-- 全體執行 + 總覽 -->
    <div class="bg-white rounded-2xl shadow-sm p-4 flex flex-col gap-3">
      <button
        class="w-full py-3 rounded-xl text-sm font-semibold transition-colors"
        :class="globalRunning ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-emerald-500 text-white hover:bg-emerald-600 active:bg-emerald-700'"
        :disabled="globalRunning"
        @click="runAll"
      >
        {{ globalRunning ? '執行中…' : '▶ 執行所有測試' }}
      </button>

      <template v-if="totalCount > 0">
        <div class="h-2 rounded-full bg-gray-100 overflow-hidden">
          <div
            class="h-full rounded-full transition-all duration-500"
            :class="failCount === 0 ? 'bg-emerald-400' : 'bg-red-400'"
            :style="{ width: (passCount / totalTests) * 100 + '%' }"
          />
        </div>
        <div class="flex justify-between text-xs font-medium">
          <span class="text-emerald-600">✓ {{ passCount }} 通過</span>
          <span class="text-gray-400">{{ totalCount }} / {{ totalTests }} 已執行</span>
          <span :class="failCount > 0 ? 'text-red-500' : 'text-gray-300'">✗ {{ failCount }} 失敗</span>
        </div>
      </template>
    </div>

    <!-- 各 Suite -->
    <div v-for="suite in suites" :key="suite.name" class="bg-white rounded-2xl shadow-sm overflow-hidden">

      <!-- Suite 標頭 -->
      <div class="flex items-center gap-2 px-4 py-3 border-b border-gray-100">
        <span class="text-lg">{{ suite.icon }}</span>
        <span class="text-sm font-semibold text-gray-700">{{ suite.name }}</span>
        <span v-if="suiteRanCount(suite.name) > 0" class="text-xs text-gray-400">
          {{ suitePassCount(suite.name) }}/{{ suiteRanCount(suite.name) }}
        </span>
        <button
          class="ml-auto text-xs px-3 py-1 rounded-lg transition-colors"
          :class="suiteRunning(suite.name)
            ? 'bg-gray-100 text-gray-300 cursor-not-allowed'
            : 'bg-gray-100 text-gray-500 hover:bg-emerald-100 hover:text-emerald-600'"
          :disabled="suiteRunning(suite.name)"
          @click="runSuite(suite)"
        >
          {{ suiteRunning(suite.name) ? '執行中…' : suiteRanCount(suite.name) > 0 ? '↺ 重跑' : '▶ 執行' }}
        </button>
      </div>

      <!-- Test 列表 -->
      <div class="divide-y divide-gray-50">
        <div
          v-for="test in suite.tests"
          :key="test.name"
          class="flex flex-col px-4 py-2.5 gap-0.5"
        >
          <div class="flex items-center gap-3">
            <!-- 狀態圓點 -->
            <span
              class="w-4 h-4 rounded-full shrink-0 flex items-center justify-center text-[10px] font-bold transition-colors"
              :class="{
                'bg-gray-100': !getResult(suite.name, test.name) && !isRunning(suite.name, test.name),
                'bg-amber-300 animate-pulse': isRunning(suite.name, test.name),
                'bg-emerald-400 text-white': !isRunning(suite.name, test.name) && getResult(suite.name, test.name)?.passed,
                'bg-red-400 text-white': !isRunning(suite.name, test.name) && getResult(suite.name, test.name)?.passed === false,
              }"
            >
              <template v-if="!isRunning(suite.name, test.name) && getResult(suite.name, test.name)">
                {{ getResult(suite.name, test.name)!.passed ? '✓' : '✗' }}
              </template>
            </span>

            <!-- 測試名稱 -->
            <span
              class="flex-1 text-sm"
              :class="{
                'text-gray-400': !getResult(suite.name, test.name),
                'text-gray-700': getResult(suite.name, test.name)?.passed,
                'text-red-600 font-medium': getResult(suite.name, test.name)?.passed === false,
              }"
            >
              {{ test.name }}
            </span>

            <!-- 執行時間 -->
            <span v-if="getResult(suite.name, test.name)" class="text-xs text-gray-300 shrink-0">
              {{ getResult(suite.name, test.name)!.duration }}ms
            </span>

            <!-- 單獨執行按鈕 -->
            <button
              class="shrink-0 text-xs px-2.5 py-1 rounded-lg transition-colors"
              :class="isRunning(suite.name, test.name)
                ? 'bg-gray-100 text-gray-300 cursor-not-allowed'
                : 'bg-gray-100 text-gray-500 hover:bg-emerald-100 hover:text-emerald-600'"
              :disabled="isRunning(suite.name, test.name)"
              @click="runOne(suite, test)"
            >
              {{ isRunning(suite.name, test.name) ? '…' : getResult(suite.name, test.name) ? '↺' : '▶' }}
            </button>
          </div>

          <!-- 錯誤訊息 -->
          <p
            v-if="getResult(suite.name, test.name)?.error"
            class="ml-7 text-xs text-red-400 font-mono break-all bg-red-50 rounded-lg px-2 py-1"
          >
            {{ getResult(suite.name, test.name)!.error }}
          </p>
        </div>
      </div>
    </div>
  </div>
</template>
