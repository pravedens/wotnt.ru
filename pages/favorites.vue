<template>
  <div class="min-h-screen bg-gradient-to-br from-blue-900 to-purple-900">
    <div class="container mx-auto px-4 py-12">
      <h1 class="text-4xl font-bold text-white text-center mb-8">
        Избранное
        <span class="text-lg text-white/60 ml-2">({{ favoritesStore.favoritesCount }})</span>
      </h1>
      
      <!-- Требуется авторизация -->
      <div v-if="!isAuthenticated" class="text-center py-12 bg-white/10 rounded-2xl">
        <p class="text-white/80 text-lg mb-4">Войдите, чтобы увидеть избранные проповеди</p>
        <NuxtLink 
          to="/auth/login"
          class="inline-block px-6 py-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg hover:from-blue-600 hover:to-purple-600 transition"
        >
          Войти
        </NuxtLink>
      </div>
      
      <!-- Состояние загрузки -->
      <div v-else-if="favoritesStore.loading" class="text-center py-12">
        <div class="inline-block animate-spin rounded-full h-8 w-8 border-4 border-white border-t-transparent"></div>
        <p class="text-white/80 mt-4">Загрузка избранного...</p>
      </div>
      
      <!-- Ошибка -->
      <div v-else-if="favoritesStore.error" class="bg-red-500/20 border border-red-500/50 rounded-2xl p-8 text-center max-w-2xl mx-auto">
        <p class="text-red-200 text-lg mb-4">{{ favoritesStore.error }}</p>
        <button 
          @click="favoritesStore.loadFavorites"
          class="inline-block px-6 py-2 bg-red-500/30 text-red-200 rounded-lg hover:bg-red-500/40 transition"
        >
          Попробовать снова
        </button>
      </div>
      
      <!-- Список избранного -->
      <div v-else-if="favoritesStore.favorites.length > 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-12">
        <div v-for="post in favoritesStore.favorites" :key="post.id" class="relative">
          <PostCard :post="post" />
        </div>
      </div>
      
      <!-- Нет избранного -->
      <div v-else class="text-center py-12 bg-white/10 rounded-2xl">
        <p class="text-white/80 text-lg mb-4">У вас пока нет избранных проповедей</p>
        <NuxtLink 
          to="/sermons"
          class="inline-block px-6 py-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg hover:from-blue-600 hover:to-purple-600 transition"
        >
          Перейти к проповедям
        </NuxtLink>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useAuthStore } from '~/stores/auth'
import { useFavoritesStore } from '~/stores/favorites'
import PostCard from '~/components/posts/PostCard.vue'

definePageMeta({
  middleware: 'auth'
})

const authStore = useAuthStore()
const favoritesStore = useFavoritesStore()

const { isAuthenticated } = storeToRefs(authStore)

// Загружаем избранное при монтировании
onMounted(async () => {
  if (isAuthenticated.value) {
    await favoritesStore.loadFavorites()
  }
})

// Обновляем при изменении авторизации
watch(isAuthenticated, async (newVal) => {
  if (newVal) {
    await favoritesStore.loadFavorites()
  }
})
</script>