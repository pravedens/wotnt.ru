<template>
  <button
    @click="handleLike"
    :disabled="isLoading"
    class="flex items-center gap-1.5 px-2 py-1.5 rounded-full transition-all hover:scale-105 focus:outline-none"
    :class="{
      'text-red-500': isLiked,
      'text-white/60 hover:text-white/80': !isLiked,
    }"
    :title="tooltip"
  >
    <svg
      class="w-5 h-5 transition-colors"
      :class="{ 'fill-current': isLiked }"
      :fill="isLiked ? 'currentColor' : 'none'"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
    </svg>
    
    <span class="text-sm font-medium">{{ likesCount }}</span>
    
    <span v-if="isLoading" class="ml-1">
      <span class="animate-spin text-xs">⟳</span>
    </span>
  </button>
</template>

<script setup>
import { useStatsStore } from '~/stores/stats'
import { storeToRefs } from 'pinia'

const props = defineProps({
  postId: {
    type: Number,
    required: true
  }
})

const statsStore = useStatsStore()

// Используем геттеры для получения данных конкретного поста
const isLoading = computed(() => statsStore.isLoading(props.postId))
const isLiked = computed(() => statsStore.isLiked(props.postId))
const likesCount = computed(() => statsStore.getLikesCount(props.postId))

const tooltip = computed(() => {
  return isLiked.value ? 'Убрать лайк' : 'Поставить лайк'
})

const handleLike = async () => {
  await statsStore.toggleLike(props.postId)
}

// Загружаем статистику при монтировании
onMounted(async () => {
  await statsStore.fetchPostStats(props.postId)
})
</script>