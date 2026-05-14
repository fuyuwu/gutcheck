import { defineStore } from 'pinia'
import { ref, watch } from 'vue'
import type { UserSettings } from '@/types'

export const useSettings = defineStore('settings', () => {
  // --- state ---
  const settings = ref<UserSettings>(loadFromStorage())

  // 監聽設定變動自動存檔，不用每個 action 都手動呼叫 saveToStorage
  watch(settings, saveToStorage, { deep: true })

  // --- actions ---
  function updateSettings(payload: Partial<UserSettings>) {
    Object.assign(settings.value, payload)
  }

  function resetSettings() {
    settings.value = defaultSettings()
  }

  // --- helpers ---
  function defaultSettings(): UserSettings {
    return {
      waterGoal: 8,
      sleepGoal: 7,
    }
  }

  function saveToStorage() {
    localStorage.setItem('gutcheck_settings', JSON.stringify(settings.value))
  }

  function loadFromStorage(): UserSettings {
    const raw = localStorage.getItem('gutcheck_settings')
    return raw ? JSON.parse(raw) : defaultSettings()
  }

  return {
    settings,
    updateSettings,
    resetSettings,
  }
})
