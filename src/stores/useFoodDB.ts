import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { v4 as uuidv4 } from 'uuid'
import type { FoodItem } from '@/types'

export const useFoodDB = defineStore('foodDB', () => {
  // --- state ---
  const items = ref<FoodItem[]>(loadFromStorage())

  // --- getters ---

  // 模糊搜尋：同時比對名稱、品牌、標籤
  function search(query: string): FoodItem[] {
    if (!query.trim()) return items.value
    const q = query.trim().toLowerCase()
    return items.value.filter(
      (item) =>
        item.name.toLowerCase().includes(q) ||
        item.brand?.toLowerCase().includes(q) ||
        item.tags.some((tag) => tag.toLowerCase().includes(q)),
    )
  }

  // 所有用過的標籤（去重）
  const allTags = computed(() => [...new Set(items.value.flatMap((item) => item.tags))].sort())

  // 用標籤篩選
  function filterByTag(tag: string): FoodItem[] {
    return items.value.filter((item) => item.tags.includes(tag))
  }

  // --- actions ---
  function addItem(payload: Omit<FoodItem, 'id' | 'createdAt'>) {
    items.value.push({
      ...payload,
      id: uuidv4(),
      createdAt: new Date().toISOString(),
    })
    saveToStorage()
  }

  function updateItem(id: string, payload: Partial<Omit<FoodItem, 'id' | 'createdAt'>>) {
    const item = items.value.find((i) => i.id === id)
    if (!item) return
    Object.assign(item, payload)
    saveToStorage()
  }

  function removeItem(id: string) {
    items.value = items.value.filter((i) => i.id !== id)
    saveToStorage()
  }

  // --- helpers ---
  function saveToStorage() {
    localStorage.setItem('gutcheck_fooddb', JSON.stringify(items.value))
  }

  function loadFromStorage(): FoodItem[] {
    const raw = localStorage.getItem('gutcheck_fooddb')
    return raw ? JSON.parse(raw) : defaultItems()
  }

  // 預設幾筆台灣常見食物，讓第一次開 app 不是空的
  function defaultItems(): FoodItem[] {
    return [
      {
        id: uuidv4(),
        name: '雞腿便當',
        brand: '一般便當店',
        calories: 700,
        unit: '份',
        tags: ['便當', '米飯'],
        createdAt: new Date().toISOString(),
      },
      {
        id: uuidv4(),
        name: '麥辣雞腿堡',
        brand: '麥當勞',
        calories: 560,
        unit: '個',
        tags: ['速食', '炸物'],
        createdAt: new Date().toISOString(),
      },
      {
        id: uuidv4(),
        name: '蛋餅',
        brand: '早餐店',
        calories: 280,
        unit: '份',
        tags: ['早餐'],
        createdAt: new Date().toISOString(),
      },
      {
        id: uuidv4(),
        name: '豆漿',
        brand: '早餐店',
        calories: 100,
        unit: '杯',
        tags: ['早餐', '飲料'],
        createdAt: new Date().toISOString(),
      },
      {
        id: uuidv4(),
        name: '滷肉飯',
        brand: '',
        calories: 350,
        unit: '碗',
        tags: ['台式', '米飯'],
        createdAt: new Date().toISOString(),
      },
    ]
  }

  return {
    items,
    allTags,
    search,
    filterByTag,
    addItem,
    updateItem,
    removeItem,
  }
})
