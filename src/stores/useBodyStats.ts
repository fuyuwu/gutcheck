import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { BodyStats } from '@/types'

export const useBodyStats = defineStore('bodyStats', () => {
  // --- state ---
  const statsList = ref<BodyStats[]>(loadFromStorage())

  // --- getters ---
  const todayStats = computed(() => {
    const today = toDateString(new Date())
    return statsList.value.find((s) => s.date === today) ?? createStats(today)
  })

  const last7Days = computed(() => {
    const result: BodyStats[] = []
    for (let i = 6; i >= 0; i--) {
      const date = toDateString(daysAgo(i))
      const stats = statsList.value.find((s) => s.date === date)
      result.push(stats ?? createStats(date))
    }
    return result
  })

  const weeklyAvgWeight = computed(() => {
    const weights = last7Days.value.map((s) => s.weight).filter((w): w is number => w !== undefined)
    if (weights.length === 0) return null
    return +(weights.reduce((a, b) => a + b, 0) / weights.length).toFixed(1)
  })

  const weeklyAvgSleep = computed(() => {
    const sleeps = last7Days.value.map((s) => s.sleep).filter((s): s is number => s !== undefined)
    if (sleeps.length === 0) return null
    return +(sleeps.reduce((a, b) => a + b, 0) / sleeps.length).toFixed(1)
  })

  // 已經有記錄過的值（過濾掉無有效數據的紀錄，並依日期由新到舊排序）
  const recordedStats = computed(() => {
    return [...statsList.value]
      .filter((s) => s.weight !== undefined || s.sleep !== undefined || s.water > 0 || s.sleepQuality !== undefined)
      .sort((a, b) => b.date.localeCompare(a.date))
  })

  // --- actions ---
  function updateTodayStats(payload: Partial<Omit<BodyStats, 'date'>>) {
    const today = toDateString(new Date())
    const existing = statsList.value.find((s) => s.date === today)
    if (existing) {
      Object.assign(existing, payload)
    } else {
      statsList.value.push({ ...createStats(today), ...payload })
    }
    saveToStorage()
  }

  function incrementWater() {
    const today = toDateString(new Date())
    const existing = statsList.value.find((s) => s.date === today)
    if (existing) {
      existing.water += 1
    } else {
      statsList.value.push(createStats(today, { water: 1 }))
    }
    saveToStorage()
  }

  function decrementWater() {
    const today = toDateString(new Date())
    const existing = statsList.value.find((s) => s.date === today)
    if (!existing || existing.water === 0) return
    existing.water -= 1
    saveToStorage()
  }

  // --- helpers ---
  function toDateString(date: Date) {
    return date.toISOString().split('T')[0] ?? ''
  }

  function daysAgo(n: number) {
    const d = new Date()
    d.setDate(d.getDate() - n)
    return d
  }

  function createStats(date: string, overrides: Partial<BodyStats> = {}): BodyStats {
    return { date, water: 0, ...overrides }
  }

  function saveToStorage() {
    localStorage.setItem('gutcheck_stats', JSON.stringify(statsList.value))
  }

  function loadFromStorage(): BodyStats[] {
    const raw = localStorage.getItem('gutcheck_stats')
    return raw ? JSON.parse(raw) : []
  }

  return {
    statsList,
    todayStats,
    last7Days,
    weeklyAvgWeight,
    weeklyAvgSleep,
    recordedStats,
    updateTodayStats,
    incrementWater,
    decrementWater,
  }
})
