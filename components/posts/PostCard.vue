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

const props = defineProps<{
  post: any
}>()

const { filters } = usePosts()

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

const cleanDescription = computed(() => {
  let text = ''
  
  if (props.post.clean_description) {
    text = props.post.clean_description
  } else if (props.post.description) {
    text = props.post.description
  } else if (props.post.content) {
    text = props.post.content
  } else {
    return ''
  }
  
  text = decodeHtml(text)
  text = stripHtml(text)
  text = text.replace(/\s+/g, ' ').trim()
  
  if (text.length > 150) {
    text = text.substring(0, 150) + '...'
  }
  
  return text
})

const imageUrl = computed(() => {
  if (props.post.thumbnail_url) {
    return props.post.thumbnail_url;
  }
  
  if (props.post.thumbnail) {
    if (props.post.thumbnail.startsWith('http')) {
      return props.post.thumbnail;
    }
    if (props.post.thumbnail.startsWith('posts/')) {
      return `https://storage.yandexcloud.net/wotgospel-media/${props.post.thumbnail}`;
    }
    return `https://wotgospel.ru/storage/${props.post.thumbnail.replace('public/', '')}`;
  }
  
  return null;
})

const postLink = computed(() => {
  const query: any = {}
  
  // Сохраняем только фильтры, КРОМЕ search и page
  if (filters.value.category_id) {
    query.category_id = String(filters.value.category_id)
  }
  if (filters.value.group_id) {
    query.group_id = String(filters.value.group_id)
  }
  if (filters.value.conference_id) {
    query.conference_id = String(filters.value.conference_id)
  }
  // search НЕ сохраняем
  // page НЕ сохраняем (возвращаемся на первую страницу)
  
  return {
    path: `/sermons/${props.post.slug}`,
    query: Object.keys(query).length > 0 ? query : undefined
  }
})

const formatDate = (dateString: string) => {
  if (!dateString) return ''
  return new Date(dateString).toLocaleDateString('ru-RU', { 
    day: 'numeric', 
    month: 'long', 
    year: 'numeric' 
  })
}

const handleFavoriteToggle = ({ postId, isFavorite }: { postId: number, isFavorite: boolean }) => {
}
</script>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.line-clamp-3 {
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>