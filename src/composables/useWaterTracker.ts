import { computed } from 'vue'
import { useBodyStats } from '@/stores/useBodyStats'
import { useSettings } from '@/stores/useSettings'

export function useWaterTracker() {
  const bodyStats = useBodyStats()
  const settings = useSettings()

  const current = computed(() => bodyStats.todayStats.water)
  const goal = computed(() => settings.settings.waterGoal)

  const percentage = computed(() => Math.min(Math.round((current.value / goal.value) * 100), 100))

  const isGoalReached = computed(() => current.value >= goal.value)

  const cups = computed(() =>
    Array.from({ length: goal.value }, (_, i) => ({
      index: i,
      filled: i < current.value,
    })),
  )

  function add() {
    if (current.value >= goal.value) return
    bodyStats.incrementWater()
  }

  function remove() {
    bodyStats.decrementWater()
  }

  return {
    current,
    goal,
    percentage,
    isGoalReached,
    cups,
    add,
    remove,
  }
}
