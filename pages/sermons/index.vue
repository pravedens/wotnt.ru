<template>
  <div class="min-h-screen bg-gradient-to-br from-blue-900 to-purple-900">
    <div class="container mx-auto px-4 py-12">
      <!-- Хлебные крошки -->
      <PostsBreadcrumbs />
      
      <h1 class="text-4xl font-bold text-white text-center mb-8">
        Проповеди
        <span class="text-lg text-white/60 ml-2">({{ pagination?.total || 0 }})</span>
      </h1>
      
      <!-- Строка поиска -->
      <div class="max-w-2xl mx-auto mb-6">
        <SearchBar
          v-model="searchQuery"
          :min-chars="3"
          placeholder="Введите не менее 3 символов для поиска..."
          @search="handleSearch"
        />
      </div>
      
      <!-- Фильтры -->
      <PostFilters
        v-if="!loadingFilters"
        :categories="categories"
        :groups="groups"
        :conferences="conferences"
        :model-value="filters"
        :total-posts="pagination?.total || 0"
        @filter-change="handleFilterChange"
      />
      
      <!-- Результаты поиска -->
      <div v-if="filters?.search" class="text-white/80 mb-4 text-center">
        <h2 class="text-lg font-medium">Результаты поиска: "{{ filters.search }}"</h2>
        <button 
          @click="clearSearch" 
          class="ml-2 text-red-300 hover:text-red-200 underline text-sm"
        >
          сбросить
        </button>
      </div>
      
      <!-- Состояние загрузки -->
      <div v-if="loading" class="text-center py-12">
        <div class="inline-block animate-spin rounded-full h-8 w-8 border-4 border-white border-t-transparent"></div>
        <p class="text-white/80 mt-4">Загрузка проповедей...</p>
      </div>
      
      <!-- Ошибка -->
      <div v-else-if="error" class="bg-red-500/20 border border-red-500/50 rounded-2xl p-8 text-center max-w-2xl mx-auto">
        <p class="text-red-200 text-lg mb-4">{{ error }}</p>
        <button 
          @click="loadPosts"
          class="inline-block px-6 py-2 bg-red-500/30 text-red-200 rounded-lg hover:bg-red-500/40 transition"
        >
          Попробовать снова
        </button>
      </div>
      
      <!-- Сетка проповедей -->
      <div v-else-if="posts?.length" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-12">
        <div 
          v-for="post in posts" 
          :key="post.id"
          class="block no-underline h-full"
          style="text-decoration: none; color: inherit;"
        >
          <h2 class="sr-only">{{ post.title }}</h2>
          <PostCard 
            :post="post" 
            :stats="getPostStats(post.id)"
          />
        </div>
      </div>
      
      <!-- Нет результатов -->
      <div v-else-if="!loading && !error" class="text-white text-center py-12 bg-white/10 rounded-2xl">
        <p class="text-lg mb-4">По вашему запросу ничего не найдено</p>
        <button 
          @click="resetFilters"
          class="px-6 py-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg hover:from-blue-600 hover:to-purple-600 transition"
        >
          Сбросить фильтры
        </button>
      </div>
      
      <!-- Пагинация -->
      <Pagination
        v-if="pagination?.last_page && pagination.last_page > 1"
        :current-page="pagination.current_page || 1"
        :last-page="pagination.last_page"
        :total="pagination.total || 0"
        :per-page="pagination.per_page || 8"
        @page-change="goToPage"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRoute, useRouter } from 'vue-router'
import { usePosts } from '~/composables/usePosts'
import PostFilters from '~/components/posts/PostFilters.vue'
import Pagination from '~/components/posts/Pagination.vue'
import SearchBar from '~/components/posts/SearchBar.vue'
import PostsBreadcrumbs from '~/components/posts/Breadcrumbs.vue'
// ✅ Переименовываем импорт типа, чтобы избежать конфликта
import type { PostFilters as PostFiltersType } from '~/types/sermon'

const PostCard = defineAsyncComponent(() => 
  import('~/components/posts/PostCard.vue')
)

const route = useRoute()
const router = useRouter()

const {
  posts,
  pagination,
  loading,
  error,
  filters,
  categories,
  groups,
  conferences,
  loadFilterData,
  loadPosts,
  setFilter,
  resetFilters,
  goToPage
} = usePosts()

// ✅ Подключаем store статистики
const statsStore = useStatsStore()

// ✅ Геттер для получения статистики поста
const getPostStats = (postId: number) => {
  return statsStore.getPostStats(postId)
}

const loadingFilters = ref(true)
const searchQuery = ref(filters.value?.search || '')

// ============================================
// SEO МЕТА-ТЕГИ
// ============================================

useSeoMeta({
  title: 'Проповеди | Церковь Слово Истины',
  description: 'Архив проповедей церкви Слово Истины. Аудио, видео и текстовые версии проповедей. Поиск по категориям, спикерам и годам. Слушайте и смотрите проповеди онлайн.',
  ogTitle: 'Проповеди | Церковь Слово Истины',
  ogDescription: 'Архив проповедей церкви Слово Истины. Аудио, видео и текстовые версии проповедей. Поиск по категориям, спикерам и годам.',
  ogType: 'website',
  ogUrl: 'https://wotnt.ru/sermons',
  ogSiteName: 'Церковь Слово Истины',
  ogLocale: 'ru_RU',
  twitterCard: 'summary_large_image',
  twitterTitle: 'Проповеди | Церковь Слово Истины',
  twitterDescription: 'Архив проповедей церкви Слово Истины. Аудио, видео и текстовые версии проповедей.'
})

useHead({
  meta: [
    { 
      name: 'description', 
      content: 'Архив проповедей церкви Слово Истины. Аудио, видео и текстовые версии проповедей. Поиск по категориям, спикерам и годам. Слушайте и смотрите проповеди онлайн.' 
    },
    { 
      name: 'keywords', 
      content: 'проповеди, аудио проповеди, видео проповеди, тексты проповедей, церковь, слово истины, библейские учения' 
    }
  ],
  link: [
    { rel: 'canonical', href: 'https://wotnt.ru/sermons' }
  ]
})

// ============================================
// ЛОГИКА КОМПОНЕНТА
// ============================================

// Обработка поиска
const handleSearch = (query: string, resetPage = true) => {
  setFilter('search', query || null)
  
  if (resetPage && filters.value.page !== 1) {
    setFilter('page', 1)
  }
}

// Очистка поиска
const clearSearch = () => {
  searchQuery.value = ''
  setFilter('search', null)
  if (filters.value.page !== 1) {
    setFilter('page', 1)
  }
}

// Обработка изменения фильтров
const handleFilterChange = (key: string, value: any) => {
  if (key === 'reset') {
    resetFilters()
    searchQuery.value = ''
  } else {
    // ✅ Используем переименованный тип
    const filterKey = key as keyof PostFiltersType
    setFilter(filterKey, value)
    if (key !== 'page') {
      setFilter('page', 1)
    }
  }
}

// Загружаем фильтры и проповеди
onMounted(async () => {
  loadingFilters.value = true
  await loadFilterData()
  loadingFilters.value = false
  
  // ✅ Восстанавливаем параметры из URL
  const categoryId = route.query.category_id
  if (categoryId) {
    setFilter('category_id', Number(categoryId))
  }
  
  const groupId = route.query.group_id
  if (groupId) {
    setFilter('group_id', Number(groupId))
  }
  
  const conferenceId = route.query.conference_id
  if (conferenceId) {
    setFilter('conference_id', Number(conferenceId))
  }
  
  const search = route.query.search
  if (search) {
    searchQuery.value = String(search)
    setFilter('search', String(search))
  }
  
  const page = route.query.page
  if (page) {
    setFilter('page', Number(page))
  }
  
  await loadPosts()

  // ✅ Загружаем статистику ОДНИМ запросом
  if (posts.value.length) {
    const postIds = posts.value.map(p => p.id)
    await statsStore.fetchMultipleStats(postIds)
  }
})
</script>

<style scoped>
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border-width: 0;
}
</style>