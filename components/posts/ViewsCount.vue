<template>
  <div class="flex items-center gap-1 text-white/60 text-sm">
    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
    </svg>
    <span>{{ displayViews }}</span>
  </div>
</template>

<script setup>
import { useStatsStore } from '~/stores/stats'
import { storeToRefs } from 'pinia'

const props = defineProps({
  postId: {
    type: Number,
    required: false,
    default: null
  },
  views: {
    type: Number,
    required: false,
    default: null
  }
})

const statsStore = useStatsStore()
const { getViewsCount } = storeToRefs(statsStore)

// ✅ Если передан views - используем его, иначе берем из store
const displayViews = computed(() => {
  // Если есть напрямую переданные views
  if (props.views !== null && props.views !== undefined) {
    return props.views
  }
  // Если есть postId - берем из store
  if (props.postId) {
    const storeViews = getViewsCount.value(props.postId)
    return storeViews || 0
  }
  return 0
})

// ✅ Загружаем статистику, если есть postId и нет переданных views
onMounted(async () => {
  if (props.postId && (props.views === null || props.views === undefined)) {
    const storeData = statsStore.getPostStats(props.postId)
    // Если в store нет данных или views_count = 0 - загружаем
    if (!storeData || storeData.views_count === 0) {
      await statsStore.fetchPostStats(props.postId)
    }
  }
})
</script>