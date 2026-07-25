<template>
  <div class="relative group rounded-2xl overflow-hidden shadow-xl transition-all duration-300 hover:scale-105 hover:shadow-2xl h-full flex flex-col bg-transparent">
    <!-- Фоновое изображение -->
    <img 
      v-if="imageUrl"
      :src="imageUrl"
      :alt="post?.title || 'Изображение проповеди'"
      width="400"
      height="300"
      class="absolute inset-0 w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
      loading="lazy"
      decoding="async"
      @error="handleImageError"
    />
    
    <!-- Затемнение -->
    <div class="absolute inset-0 bg-gradient-to-t from-black/90 via-black/60 to-black/40"></div>
    
    <!-- Контент -->
    <div class="relative flex flex-col h-full p-3 z-10">
      <!-- Верхняя строка с категорией и фаворитом -->
      <div class="flex items-center justify-between mb-3">
        <span 
          v-if="post.category"
          class="inline-flex items-center px-2 py-1 text-xs rounded-full bg-blue-500/30 text-blue-200 backdrop-blur-sm border border-blue-400/30"
        >
          {{ post.category.title }}
        </span>
        <span v-else class="w-0"></span>
        
        <FavoriteButton
          :post-id="post.id"
          :initial-is-favorite="post.is_favorite"
          @toggle="handleFavoriteToggle"
        />
      </div>
      
      <!-- Заголовок -->
      <h3 class="text-xl font-bold text-white mb-2 line-clamp-2">{{ post.title }}</h3>
      
      <!-- Дата и лайки -->
      <div class="flex items-center justify-between mb-4">
        <p class="text-white/60 text-sm">
          {{ formatDate(post.created_at) }}
        </p>
  
        <div class="flex items-center gap-2">
          <ViewsCount :post-id="post.id" />
          <LikeButton :post-id="post.id" />
        </div>
      </div>
      
      <!-- Описание -->
      <p class="text-white/80 mb-4 line-clamp-3 flex-grow">
        {{ cleanDescription }}
      </p>
      
      <!-- Кнопка подробнее -->
      <NuxtLink 
        :to="postLink"
        class="inline-block w-full text-center px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg hover:from-blue-600 hover:to-purple-600 transition mt-auto"
      >
        Читать далее
      </NuxtLink>
    </div>
  </div>
</template>

<script setup lang="ts">
import { usePosts } from '~/composables/usePosts'
import FavoriteButton from '~/components/posts/FavoriteButton.vue'
import LikeButton from '~/components/posts/LikeButton.vue'
import ViewsCount from '~/components/posts/ViewsCount.vue'
import type { Post } from '~/types/sermon'

// ============================================
// КОНФИГУРАЦИЯ
// ============================================
const config = useRuntimeConfig()
const { apiBase, storageUrl } = config.public

// ============================================
// PROPS
// ============================================
const props = defineProps<{
  post: Post
}>()

// ============================================
// COMPOSABLES
// ============================================
const { filters } = usePosts()

// ============================================
// UTILITY FUNCTIONS
// ============================================
const stripHtml = (html: string) => {
  if (!html) return ''
  return html.replace(/<[^>]*>/g, '')
}

const decodeHtml = (html: string) => {
  if (!html) return ''
  const txt = document.createElement('textarea')
  txt.innerHTML = html
  return txt.value
}

// ============================================
// COMPUTED
// ============================================

// ✅ Очищенное описание
const cleanDescription = computed(() => {
  const text = props.post.clean_description || props.post.description || props.post.content || ''
  
  if (!text) return ''
  
  return decodeHtml(text)
    .replace(/<[^>]*>/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 150)
    .concat('...')
})

// ✅ URL изображения с более чистой логикой
const imageUrl = computed(() => {
  const thumbnail = props.post.thumbnail_url || props.post.thumbnail
  
  if (!thumbnail) return null
  
  if (thumbnail.startsWith('http')) {
    return thumbnail
  }
  
  if (thumbnail.startsWith('posts/')) {
    return `${storageUrl}/${thumbnail}`
  }
  
  return `${apiBase}/storage/${thumbnail.replace('public/', '')}`
})

// ✅ Ссылка на пост с фильтрами
const postLink = computed(() => {
  const route = useRoute()
  const query: Record<string, string> = {}
  
  // Сохраняем все параметры из текущего URL
  if (route.query.category_id) {
    query.category_id = String(route.query.category_id)
  }
  if (route.query.group_id) {
    query.group_id = String(route.query.group_id)
  }
  if (route.query.conference_id) {
    query.conference_id = String(route.query.conference_id)
  }
  if (route.query.search) {
    query.search = String(route.query.search)
  }
  if (route.query.page) {
    query.page = String(route.query.page)
  }
  
  return {
    path: `/sermons/${props.post.slug}`,
    query: Object.keys(query).length > 0 ? query : undefined
  }
})

// ============================================
// METHODS
// ============================================

// ✅ Форматирование даты
const formatDate = (dateString: string | null) => {
  if (!dateString) return ''
  return new Date(dateString).toLocaleDateString('ru-RU', { 
    day: 'numeric', 
    month: 'long', 
    year: 'numeric' 
  })
}

// ✅ Обработка ошибки изображения
const handleImageError = (event: Event) => {
  const img = event.target as HTMLImageElement
  if (img) {
    img.style.display = 'none'
    img.parentElement?.classList.add('image-error')
  }
}

// ✅ Обработка переключения избранного
const handleFavoriteToggle = ({ postId, isFavorite }: { postId: number, isFavorite: boolean }) => {
  console.log('Favorite toggled:', { postId, isFavorite })
}
</script>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  line-clamp: 2;
  overflow: hidden;
}

.line-clamp-3 {
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  line-clamp: 3;
  overflow: hidden;
}

.image-error {
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
}

.image-error::after {
  content: '🖼️';
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: 3rem;
  opacity: 0.3;
}
</style>