<template>
  <button
    @click="handleToggle"
    :disabled="loading"
    class="absolute top-2 right-2 p-2 rounded-full transition-all hover:scale-110 z-50 cursor-pointer"
    :class="{
      'bg-red-500/30 text-red-200 hover:bg-red-500/50': isFavorite,
      'bg-black/30 text-white/80 hover:bg-black/50 backdrop-blur-sm': !isFavorite,
    }"
    :title="tooltip"
  >
    <svg
      class="w-5 h-5"
      :class="{ 'fill-current': isFavorite }"
      :fill="isFavorite ? 'currentColor' : 'none'"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
    </svg>
    
    <span v-if="loading" class="absolute inset-0 flex items-center justify-center">
      <span class="animate-spin">⟳</span>
    </span>
  </button>
</template>

<script setup>
import { useAuthStore } from '~/stores/auth'
import { useFavoritesStore } from '~/stores/favorites'
import { storeToRefs } from 'pinia'

const props = defineProps({
  postId: {
    type: Number,
    required: true
  }
})

const emit = defineEmits(['toggle'])

const authStore = useAuthStore()
const favoritesStore = useFavoritesStore()

const { loading } = storeToRefs(favoritesStore)
const { toggleFavorite, isFavorite: checkIsFavorite } = favoritesStore

// Вычисляемое свойство для текущего статуса
const isFavorite = computed(() => checkIsFavorite(props.postId))

const tooltip = computed(() => {
  if (!authStore.isAuthenticated) return 'Войдите, чтобы добавить в избранное'
  return isFavorite.value ? 'Удалить из избранного' : 'Добавить в избранное'
})

const handleToggle = async () => {
  if (!authStore.isAuthenticated) {
    await navigateTo('/auth/login')
    return
  }

  const result = await toggleFavorite(props.postId)

  if (result.success) {
    emit('toggle', { postId: props.postId, isFavorite: isFavorite.value })
  }
}
</script>