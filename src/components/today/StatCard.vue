<script setup lang="ts">
defineProps<{
  label: string
  value: string | number
  unit: string
  icon: string
  color: 'green' | 'blue' | 'purple'
}>()

const colorMap = {
  green: 'bg-emerald-50 text-emerald-600',
  blue: 'bg-blue-50 text-blue-600',
  purple: 'bg-purple-50 text-purple-600',
}
</script>

<template>
  <div class="bg-white rounded-2xl p-4 flex flex-col gap-2 shadow-sm">
    <div class="flex items-center justify-between">
      <span class="text-sm text-gray-400">{{ label }}</span>
      <span
        class="text-xl w-9 h-9 rounded-xl flex items-center justify-center"
        :class="colorMap[color]"
      >
        {{ icon }}
      </span>
    </div>
    <div class="flex items-end gap-1">
      <span class="text-2xl font-semibold text-gray-800">{{ value ?? '－' }}</span>
      <span class="text-sm text-gray-400 mb-0.5">{{ unit }}</span>
    </div>
  </div>
</template>
