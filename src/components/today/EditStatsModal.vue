<script setup lang="ts">
import { ref } from 'vue'
import { useBodyStats } from '@/stores/useBodyStats'

const emit = defineEmits<{ close: [] }>()

const bodyStats = useBodyStats()

const weight = ref<number | undefined>(bodyStats.todayStats.weight)
const sleep = ref<number | undefined>(bodyStats.todayStats.sleep)
const sleepQuality = ref<1 | 2 | 3 | 4 | 5 | undefined>(bodyStats.todayStats.sleepQuality)

const qualityOptions: { value: 1 | 2 | 3 | 4 | 5; label: string }[] = [
  { value: 1, label: '😫' },
  { value: 2, label: '😕' },
  { value: 3, label: '😐' },
  { value: 4, label: '🙂' },
  { value: 5, label: '😄' },
]

function submit() {
  bodyStats.updateTodayStats({
    weight: weight.value,
    sleep: sleep.value,
    sleepQuality: sleepQuality.value,
  })
  emit('close')
}
</script>

<template>
  <Teleport to="body">
    <div class="fixed inset-0 bg-black/40 z-50 flex items-end justify-center modal-overlay">
      <div class="bg-white w-full max-w-2xl rounded-t-3xl p-6 flex flex-col gap-5 modal-sheet">
        <div class="flex items-center justify-between">
          <h2 class="text-base font-semibold text-gray-800">更新今日數據</h2>
          <button class="text-gray-400 hover:text-gray-600" @click="emit('close')">✕</button>
        </div>

        <div class="flex flex-col gap-1.5">
          <label class="text-sm text-gray-500">⚖️ 體重（kg）</label>
          <input
            v-model.number="weight"
            type="number"
            step="0.1"
            min="20"
            max="300"
            :placeholder="`${bodyStats.todayStats.weight || bodyStats.recordedStats[0]?.weight || '尚未記錄'}`"
            class="border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-emerald-400 transition-colors"
          />
        </div>

        <div class="flex flex-col gap-1.5">
          <label class="text-sm text-gray-500">😴 睡眠時數（hr）</label>
          <input
            v-model.number="sleep"
            type="number"
            step="0.5"
            min="0"
            max="24"
            placeholder="例如：7.5"
            class="border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-emerald-400 transition-colors"
          />
        </div>

        <div class="flex flex-col gap-2">
          <label class="text-sm text-gray-500">睡眠品質</label>
          <div class="flex gap-2">
            <button
              v-for="option in qualityOptions"
              :key="option.value"
              class="flex-1 py-2.5 rounded-xl text-xl transition-colors"
              :class="
                sleepQuality === option.value
                  ? 'bg-purple-100 ring-2 ring-purple-400'
                  : 'bg-gray-100 hover:bg-gray-200'
              "
              @click="sleepQuality = option.value"
            >
              {{ option.label }}
            </button>
          </div>
        </div>

        <button
          class="w-full py-3 rounded-xl text-sm font-medium bg-emerald-500 text-white hover:bg-emerald-600 transition-colors"
          @click="submit"
        >
          儲存
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
