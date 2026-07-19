<!-- components/friends/FriendsCarousel.vue (упрощённая версия без Swiper) -->

<template>
  <div v-if="!loading && friends.length > 0" class="friends-section">
    <div class="container mx-auto px-4">
      <h2 class="text-2xl md:text-3xl font-bold text-white text-center mb-8">
        Наши друзья
      </h2>
      
      <div class="relative">
        <div class="overflow-x-auto pb-4 scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent">
          <div class="flex gap-5 min-w-max px-2">
            <a
              v-for="friend in friends"
              :key="friend.id"
              :href="friend.link"
              target="_blank"
              rel="noopener noreferrer"
              class="block group w-[120px] md:w-[150px] flex-shrink-0"
              :title="friend.title"
            >
              <div class="bg-white/10 backdrop-blur-lg rounded-2xl p-4 border border-white/20 transition-all duration-300 hover:bg-white/20 hover:scale-105">
                <div class="aspect-square flex items-center justify-center">
                  <img
                    :src="friend.thumbnail_url || '/images/church-placeholder.png'"
                    :alt="friend.title"
                    class="w-full h-full object-contain rounded-xl"
                    loading="lazy"
                    @error="handleImageError"
                  />
                </div>
                <p class="text-white/80 text-center text-sm mt-3 truncate group-hover:text-white transition">
                  {{ friend.title }}
                </p>
              </div>
            </a>
          </div>
        </div>
        
        <!-- Тень справа для индикации прокрутки -->
        <div class="absolute right-0 top-0 bottom-0 w-12 bg-gradient-to-l from-purple-900 to-transparent pointer-events-none"></div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useFriends } from '~/composables/useFriends'

const { friends, loading, loadFriends } = useFriends()

const handleImageError = (event: Event) => {
  const img = event.target as HTMLImageElement
  img.src = '/images/church-placeholder.png'
}

onMounted(() => {
  loadFriends()
})
</script>

<style scoped>
.friends-section {
  margin: 4rem 0;
}

/* Стили для скроллбара */
.overflow-x-auto {
  scrollbar-width: thin;
  scrollbar-color: rgba(255, 255, 255, 0.2) transparent;
}

.overflow-x-auto::-webkit-scrollbar {
  height: 6px;
}

.overflow-x-auto::-webkit-scrollbar-track {
  background: transparent;
}

.overflow-x-auto::-webkit-scrollbar-thumb {
  background-color: rgba(255, 255, 255, 0.2);
  border-radius: 10px;
}
</style>