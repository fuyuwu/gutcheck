<script setup lang="ts">
import { ref, computed } from 'vue'
import { useFoodLog } from '@/stores/useFoodLog'
import { useFoodDB } from '@/stores/useFoodDB'
import AddFoodItemModal from './AddFoodItemModal.vue'
import type { FoodItem, FoodEntry } from '@/types'

const props = defineProps<{
  defaultMeal?: FoodEntry['meal']
}>()

const emit = defineEmits<{ close: [] }>()

const foodLog = useFoodLog()
const foodDB = useFoodDB()

// --- 步驟控制：search → confirm ---
type Step = 'search' | 'confirm'
const step = ref<Step>('search')

// --- 搜尋 ---
const query = ref('')
const selectedTag = ref('')

const searchResults = computed(() => {
  if (selectedTag.value) return foodDB.filterByTag(selectedTag.value)
  return foodDB.search(query.value)
})

// --- 選擇食物 ---
const selectedItem = ref<FoodItem | null>(null)

const selectItem = (item: FoodItem) => {
  selectedItem.value = item
  quantity.value = 1
  customQuantity.value = ''
  meal.value = props.defaultMeal ?? 'breakfast'
  note.value = ''
  step.value = 'confirm'
}

const clickFilterTag = (tag: string) => {
  selectedTag.value = selectedTag.value === tag ? '' : tag
  query.value = ''
}

// --- 確認記錄 ---
const meal = ref<FoodEntry['meal']>(props.defaultMeal ?? 'breakfast')
const quantity = ref(1)
const customQuantity = ref('')
const note = ref('')
const showAddItemModal = ref(false)

// 快速份量 presets（依單位調整）
const portionPresets = computed(() => {
  if (!selectedItem.value) return [0.5, 1, 1.5, 2]
  const u = selectedItem.value.unit
  return u === 'g' || u === 'ml' ? [50, 100, 150, 200] : [0.5, 1, 1.5, 2]
})

const selectPreset = (val: number) => {
  quantity.value = val
  customQuantity.value = ''
}

// 自行輸入時同步 quantity
const onCustomInput = () => {
  const n = parseFloat(customQuantity.value)
  if (!isNaN(n) && n > 0) quantity.value = n
}

const isPresetActive = (val: number) =>
  customQuantity.value === '' && quantity.value === val

const totalCalories = computed(() =>
  selectedItem.value ? Math.round(selectedItem.value.calories * quantity.value) : 0,
)

const mealOptions: { value: FoodEntry['meal']; label: string; icon: string }[] = [
  { value: 'breakfast', label: '早餐', icon: '🍳' },
  { value: 'lunch', label: '午餐', icon: '🍱' },
  { value: 'snack', label: '下午茶', icon: '🧋' },
  { value: 'dinner', label: '晚餐', icon: '🍽️' },
]

const onItemAdded = (id: string) => {
  const item = foodDB.items.find((i) => i.id === id)
  if (item) selectItem(item)
}

const submit = () => {
  if (!selectedItem.value) return
  foodLog.addFoodEntry({
    meal: meal.value,
    foodItemId: selectedItem.value.id,
    foodName: selectedItem.value.name,
    calories: totalCalories.value,
    quantity: quantity.value,
    note: note.value.trim() || undefined,
  })
  emit('close')
}
</script>

<template>
  <Teleport to="body">
    <div
      class="fixed inset-0 bg-black/40 z-50 flex items-end justify-center modal-overlay"
      @click.self="emit('close')"
    >
      <div
        class="bg-white w-full max-w-2xl rounded-t-3xl p-6 flex flex-col gap-4 modal-sheet h-[85vh] overflow-y-auto"
      >
        <!-- Header -->
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-2">
            <button
              v-if="step === 'confirm'"
              class="text-gray-400 hover:text-gray-600 text-lg"
              @click="step = 'search'"
            >
              ←
            </button>
            <h2 class="text-base font-semibold text-gray-800">
              {{ step === 'search' ? '選擇食物' : '確認記錄' }}
            </h2>
          </div>
          <button class="text-gray-400 hover:text-gray-600" @click="emit('close')">✕</button>
        </div>

        <!-- 搜尋步驟 -->
        <template v-if="step === 'search'">
          <input
            v-model="query"
            type="text"
            placeholder="搜尋食物、店家、標籤..."
            class="border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-emerald-400 transition-colors"
            @input="selectedTag = ''"
          />

          <div class="flex gap-2 flex-wrap">
            <button
              v-for="tag in foodDB.allTags"
              :key="tag"
              class="text-xs px-3 py-1 rounded-full transition-colors"
              :class="
                selectedTag === tag
                  ? 'bg-emerald-500 text-white'
                  : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
              "
              @click="clickFilterTag(tag)"
            >
              {{ tag }}
            </button>
          </div>

          <div class="flex flex-col gap-2">
            <div
              v-for="item in searchResults"
              :key="item.id"
              class="flex items-center justify-between px-4 py-3 rounded-xl bg-gray-50 hover:bg-emerald-50 transition-colors cursor-pointer"
              @click="selectItem(item)"
            >
              <div>
                <p class="text-sm font-medium text-gray-800">{{ item.name }}</p>
                <p class="text-xs text-gray-400">
                  {{ item.brand ? `${item.brand} ·` : '' }} {{ item.calories }} kcal /
                  {{ item.unit }}
                </p>
              </div>
              <div class="flex gap-1 flex-wrap justify-end max-w-[120px]">
                <span
                  v-for="tag in item.tags"
                  :key="tag"
                  class="text-xs bg-gray-200 text-gray-500 px-2 py-0.5 rounded-full"
                >
                  {{ tag }}
                </span>
              </div>
            </div>

            <div v-if="searchResults.length === 0" class="flex flex-col items-center gap-3 py-8">
              <p class="text-gray-400 text-sm">找不到「{{ query }}」相關食物</p>
              <button
                class="flex items-center gap-1.5 text-sm font-medium text-emerald-600 bg-emerald-50 px-4 py-2 rounded-xl hover:bg-emerald-100 transition-colors"
                @click="showAddItemModal = true"
              >
                ＋ 新增「{{ query }}」到資料庫
              </button>
            </div>
          </div>
        </template>

        <!-- 確認步驟 -->
        <template v-if="step === 'confirm' && selectedItem">
          <!-- 食物資訊 -->
          <div class="bg-emerald-50 rounded-xl px-4 py-3">
            <p class="text-sm font-medium text-emerald-800">{{ selectedItem.name }}</p>
            <p class="text-xs text-emerald-600 mt-0.5">
              {{ selectedItem.brand ? `${selectedItem.brand} ·` : '' }}
              {{ selectedItem.calories }} kcal / {{ selectedItem.unit }}
            </p>
          </div>

          <!-- 餐別 -->
          <div class="grid grid-cols-4 gap-2">
            <button
              v-for="option in mealOptions"
              :key="option.value"
              class="flex flex-col items-center gap-1 py-2 rounded-xl text-sm transition-colors"
              :class="
                meal === option.value
                  ? 'bg-emerald-500 text-white'
                  : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
              "
              @click="meal = option.value"
            >
              <span class="text-lg">{{ option.icon }}</span>
              <span>{{ option.label }}</span>
            </button>
          </div>

          <!-- 份量選擇 -->
          <div class="flex flex-col gap-2.5">
            <label class="text-sm text-gray-500">份量</label>

            <!-- 快速選擇 chips -->
            <div class="grid grid-cols-4 gap-2">
              <button
                v-for="preset in portionPresets"
                :key="preset"
                class="py-2.5 rounded-xl text-sm font-medium transition-colors"
                :class="
                  isPresetActive(preset)
                    ? 'bg-emerald-500 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                "
                @click="selectPreset(preset)"
              >
                {{ preset }}{{ selectedItem.unit }}
              </button>
            </div>

            <!-- 自行輸入 -->
            <div class="flex items-center gap-2">
              <span class="text-sm text-gray-400 shrink-0 w-16">自行輸入</span>
              <input
                v-model="customQuantity"
                type="number"
                min="0.1"
                step="0.1"
                :placeholder="`${quantity}`"
                class="flex-1 border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-emerald-400 transition-colors"
                @input="onCustomInput"
              />
              <span class="text-sm text-gray-500 shrink-0">{{ selectedItem.unit }}</span>
            </div>
          </div>

          <!-- 熱量預覽 -->
          <div class="flex items-center justify-between bg-gray-50 rounded-xl px-4 py-3">
            <span class="text-sm text-gray-500">預估熱量</span>
            <span class="text-lg font-semibold text-emerald-600">{{ totalCalories }} kcal</span>
          </div>

          <!-- 備註 -->
          <div class="flex flex-col gap-1.5">
            <label class="text-sm text-gray-500">備註（選填）</label>
            <input
              v-model="note"
              type="text"
              placeholder="身體感受、口感..."
              class="border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-emerald-400 transition-colors"
            />
          </div>

          <!-- 送出 -->
          <button
            class="w-full py-3 rounded-xl text-sm font-medium bg-emerald-500 text-white hover:bg-emerald-600 transition-colors"
            @click="submit"
          >
            新增記錄
          </button>
        </template>
      </div>
    </div>
  </Teleport>
  <AddFoodItemModal
    v-if="showAddItemModal"
    :initial-name="query"
    @close="showAddItemModal = false"
    @added="onItemAdded"
  />
</template>

<style scoped>
.modal-overlay {
  animation: fadeIn 0.25s ease;
}
.modal-sheet {
  animation: slideUp 0.3s cubic-bezier(0.32, 0.72, 0, 1);
}
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}
@keyframes slideUp {
  from { transform: translateY(100%); }
  to { transform: translateY(0); }
}
</style>
