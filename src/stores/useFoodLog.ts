import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { v4 as uuidv4 } from 'uuid'
import type { FoodEntry, DayLog } from '@/types'

export const useFoodLog = defineStore('foodLog', () => {
  // --- state ---
  const logs = ref<DayLog[]>(loadFromStorage())

  // --- getters ---
  const todayLog = computed(() => {
    const today = toDateString(new Date())
    return logs.value.find((l) => l.date === today) ?? createDayLog(today)
  })

  const todayFoodEntries = computed(() => todayLog.value?.foodEntries)

  const sortedLogs = computed(() => [...logs.value].sort((a, b) => b.date.localeCompare(a.date)))

  // --- actions ---
  function addFoodEntry(payload: Omit<FoodEntry, 'id' | 'timestamp'>) {
    const today = toDateString(new Date())
    const entry: FoodEntry = {
      ...payload,
      id: uuidv4(),
      timestamp: new Date().toISOString(),
    }

    const existing = logs.value.find((l) => l.date === today)
    if (existing) {
      existing.foodEntries.push(entry)
    } else {
      logs.value.push(createDayLog(today, [entry]))
    }

    saveToStorage()
  }

  function removeFoodEntry(entryId: string) {
    const today = toDateString(new Date())
    const log = logs.value.find((l) => l.date === today)
    if (!log) return
    log.foodEntries = log.foodEntries.filter((e) => e.id !== entryId)
    saveToStorage()
  }

  function updateFoodEntry(entryId: string, payload: Partial<Omit<FoodEntry, 'id'>>) {
    for (const log of logs.value) {
      const entry = log.foodEntries.find((e) => e.id === entryId)
      if (entry) {
        Object.assign(entry, payload)
        saveToStorage()
        return
      }
    }
  }

  // --- helpers ---
  function toDateString(date: Date): string {
    return date.toISOString().split('T')[0] ?? ''
  }

  function createDayLog(date: string, foodEntries: FoodEntry[] = []): DayLog {
    return {
      date,
      foodEntries,
      bodyStats: { date, water: 0 },
    }
  }

  function saveToStorage() {
    localStorage.setItem('gutcheck_logs', JSON.stringify(logs.value))
  }

  function loadFromStorage(): DayLog[] {
    const raw = localStorage.getItem('gutcheck_logs')
    return raw ? JSON.parse(raw) : []
  }

  return {
    logs,
    todayLog,
    todayFoodEntries,
    sortedLogs,
    addFoodEntry,
    removeFoodEntry,
    updateFoodEntry,
  }
})
