<script setup lang="ts">
import { ref } from 'vue'
import { useFoodDB } from '@/stores/useFoodDB'

const props = defineProps<{
  initialName?: string
}>()

const emit = defineEmits<{ close: []; added: [id: string] }>()

const foodDB = useFoodDB()

const name = ref(props.initialName ?? '')
const brand = ref('')
const calories = ref<number | undefined>(undefined)
const unit = ref('份')
const tagInput = ref('')
const tags = ref<string[]>([])

const unitOptions = ['份', '個', '碗', '杯', '片', 'g', 'ml']

const addTag = () => {
  const t = tagInput.value.trim()
  if (!t || tags.value.includes(t)) return
  tags.value.push(t)
  tagInput.value = ''
}

const removeTag = (tag: string) => {
  tags.value = tags.value.filter((t) => t !== tag)
}

const handleTagKeydown = (e: KeyboardEvent) => {
  if (e.key === 'Enter') addTag()
}

const canSubmit = ref(false)
const checkCanSubmit = () => {
  canSubmit.value = !!name.value.trim() && !!calories.value && calories.value > 0
}

const submit = () => {
  if (!name.value.trim() || !calories.value) return
  // const id = crypto.randomUUID()
  foodDB.addItem({
    name: name.value.trim(),
    brand: brand.value.trim() || undefined,
    calories: calories.value,
    unit: unit.value,
    tags: tags.value,
  })
  // 取得剛新增的品項 id
  const newItem = foodDB.items[foodDB.items.length - 1]
  if (!newItem) return
  emit('added', newItem.id)
  emit('close')
}
</script>

<template>
  <Teleport to="body">
    <div
      class="fixed inset-0 bg-black/40 z-[60] flex items-end justify-center modal-overlay"
      @click.self="emit('close')"
    >
      <div
        class="bg-white w-full max-w-2xl rounded-t-3xl p-6 flex flex-col gap-4 modal-sheet h-[85vh] overflow-y-auto"
      >
        <div class="flex items-center justify-between">
          <h2 class="text-base font-semibold text-gray-800">新增食物到資料庫</h2>
          <button class="text-gray-400 hover:text-gray-600" @click="emit('close')">✕</button>
        </div>

        <!-- 食物名稱 -->
        <div class="flex flex-col gap-1.5">
          <label class="text-sm text-gray-500">食物名稱</label>
          <input
            v-model="name"
            type="text"
            placeholder="例如：雞肉炒飯"
            class="border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-emerald-400 transition-colors"
            @input="checkCanSubmit"
          />
        </div>

        <!-- 店家 / 品牌 -->
        <div class="flex flex-col gap-1.5">
          <label class="text-sm text-gray-500">店家 / 品牌（選填）</label>
          <input
            v-model="brand"
            type="text"
            placeholder="例如：麥當勞、7-11"
            class="border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-emerald-400 transition-colors"
          />
        </div>

        <!-- 熱量 + 單位 -->
        <div class="flex gap-3">
          <div class="flex flex-col gap-1.5 flex-1">
            <label class="text-sm text-gray-500">熱量（kcal）</label>
            <input
              v-model.number="calories"
              type="number"
              min="0"
              placeholder="例如：500"
              class="border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-emerald-400 transition-colors"
              @input="checkCanSubmit"
            />
          </div>
          <div class="flex flex-col gap-1.5 w-28">
            <label class="text-sm text-gray-500">單位</label>
            <select
              v-model="unit"
              class="border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-emerald-400 transition-colors bg-white"
            >
              <option v-for="u in unitOptions" :key="u" :value="u">{{ u }}</option>
            </select>
          </div>
        </div>

        <!-- 標籤 -->
        <div class="flex flex-col gap-2">
          <label class="text-sm text-gray-500">標籤（選填，按 Enter 新增）</label>
          <div class="flex gap-2">
            <input
              v-model="tagInput"
              type="text"
              placeholder="例如：低醣、可換地瓜"
              class="flex-1 border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-emerald-400 transition-colors"
              @keydown="handleTagKeydown"
            />
            <button
              class="px-4 py-2 rounded-xl bg-gray-100 text-gray-600 text-sm hover:bg-gray-200 transition-colors"
              @click="addTag"
            >
              新增
            </button>
          </div>
          <div v-if="tags.length > 0" class="flex gap-2 flex-wrap">
            <span
              v-for="tag in tags"
              :key="tag"
              class="flex items-center gap-1 text-xs bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full"
            >
              {{ tag }}
              <button class="hover:text-emerald-900" @click="removeTag(tag)">✕</button>
            </span>
          </div>
        </div>

        <div class="flex-1" />

        <!-- 送出 -->
        <button
          class="w-full py-3 rounded-xl text-sm font-medium transition-colors"
          :class="
            name.trim() && calories
              ? 'bg-emerald-500 text-white hover:bg-emerald-600'
              : 'bg-gray-100 text-gray-400 cursor-not-allowed'
          "
          @click="submit"
        >
          新增到資料庫
        </button>
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
.modal-overlay {
  animation: fadeIn 0.25s ease;
}
.modal-sheet {
  animation: slideUp 0.3s cubic-bezier(0.32, 0.72, 0, 1);
}
@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}
@keyframes slideUp {
  from {
    transform: translateY(100%);
  }
  to {
    transform: translateY(0);
  }
}
</style>
