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

const props = defineProps({
  postId: {
    type: Number,
    required: true
  },
  initialLiked: {
    type: Boolean,
    required: false,
    default: false
  },
  initialLikesCount: {
    type: Number,
    required: false,
    default: 0
  }
})

const statsStore = useStatsStore()

// ✅ Используем store только для обновления после лайка
const isLiked = computed(() => {
  // Если в store есть данные - используем их, иначе начальные
  const storeLiked = statsStore.isLiked(props.postId)
  return storeLiked !== undefined ? storeLiked : props.initialLiked
})

const likesCount = computed(() => {
  const storeCount = statsStore.getLikesCount(props.postId)
  return storeCount !== undefined && storeCount !== 0 ? storeCount : props.initialLikesCount
})

const isLoading = computed(() => statsStore.isLoading(props.postId))

const tooltip = computed(() => {
  return isLiked.value ? 'Убрать лайк' : 'Поставить лайк'
})

const handleLike = async () => {
  await statsStore.toggleLike(props.postId)
}

// ✅ НЕ запрашиваем статистику при монтировании - она уже загружена на странице
</script>