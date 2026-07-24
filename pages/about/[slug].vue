<template>
  <div class="min-h-screen bg-gradient-to-br from-blue-900 to-purple-900 py-12">
    <div class="container mx-auto px-4">
      <AboutBreadcrumbs 
        :denomination-title="about?.denomination?.title"
        :about-title="about?.title"
      />
      
      <div v-if="loading" class="flex flex-col items-center justify-center py-16">
        <div class="relative">
          <div class="w-16 h-16 border-4 border-white/20 rounded-full animate-spin border-t-blue-500"></div>
          <div class="absolute inset-0 flex items-center justify-center">
            <div class="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full animate-pulse"></div>
          </div>
        </div>
        <p class="text-white/80 mt-4">Загрузка статьи...</p>
      </div>
      
      <div v-else-if="error" class="bg-red-500/20 border border-red-500/50 rounded-2xl p-8 text-center max-w-2xl mx-auto">
        <div class="text-5xl mb-4">😢</div>
        <p class="text-red-200 text-lg mb-4">{{ error }}</p>
        <button @click="router.back()" class="px-6 py-2 bg-red-500/30 text-red-200 rounded-lg hover:bg-red-500/40 transition">
          Вернуться назад
        </button>
      </div>
      
      <article v-else-if="about" class="max-w-4xl mx-auto">
        <!-- Hero секция -->
        <div class="relative rounded-2xl overflow-hidden mb-8 h-96 animate-fade-in">
          <img 
            v-if="imageUrl"
            :src="imageUrl"
            :alt="about.title"
            class="w-full h-full object-cover"
            @error="handleImageError"
          >
          <div v-else class="w-full h-full bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center text-8xl">
            {{ getArticleIcon(about.title) }}
          </div>
          
          <div class="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-black/30"></div>
          
          <div class="absolute inset-0 flex flex-col justify-end p-8 animate-slide-up">
            <div class="mb-2">
              <button
                @click="goToCategory(about.denomination?.slug)"
                class="px-3 py-1 text-sm rounded-full bg-blue-500/30 text-blue-200 backdrop-blur-sm border border-blue-400/30 hover:bg-blue-500/40 transition flex items-center gap-1"
              >
                <span class="text-sm">{{ getCategoryIcon(about.denomination?.title) }}</span>
                {{ about.denomination?.title || 'Без категории' }}
              </button>
            </div>
            <h1 class="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-2">{{ about.title }}</h1>
            <div class="flex items-center gap-4 text-white/60 text-sm">
              <span class="flex items-center gap-1">
                <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                {{ formatDate(about.created_at || about.updated_at) }}
              </span>
              <span class="flex items-center gap-1">
                <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
                {{ about.views || 0 }} просмотров
              </span>
            </div>
          </div>
        </div>
        
        <!-- Краткое описание -->
        <div class="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20 mb-8 animate-fade-in">
          <div class="flex items-center gap-2 mb-4">
            <span class="text-2xl">📖</span>
            <h2 class="text-2xl font-bold text-white">О чём статья</h2>
          </div>
          <p class="text-white/80 text-lg leading-relaxed whitespace-pre-line">{{ about.description }}</p>
        </div>
        
        <!-- Основной контент -->
        <div class="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20 prose prose-invert max-w-none animate-fade-in">
          <div class="text-white/80 leading-relaxed" v-html="about.content"></div>
        </div>
        
        <!-- Навигация -->
        <div class="mt-8 flex justify-between items-center">
          <button 
            @click="router.back()"
            class="text-white/60 hover:text-white transition flex items-center gap-2 group"
          >
            <svg class="w-5 h-5 group-hover:-translate-x-1 transition duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Назад
          </button>
          
          <button
            v-if="about.denomination?.slug"
            @click="goToCategory(about.denomination?.slug)"
            class="text-white/60 hover:text-white transition flex items-center gap-2 group"
          >
            <span>Все статьи категории</span>
            <svg class="w-5 h-5 group-hover:translate-x-1 transition duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </button>
        </div>
      </article>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useAbout } from '~/composables/useAbout'
import { useImageUrl } from '~/composables/useImageUrl'
import AboutBreadcrumbs from '~/components/about/Breadcrumbs.vue'
import { useNotificationStore } from '~/stores/notification'

const router = useRouter()
const route = useRoute()
const notificationStore = useNotificationStore()

const { currentAbout: about, loading, error, loadAbout } = useAbout()
const { getImageUrl } = useImageUrl()
const imageError = ref(false)

const imageUrl = computed(() => {
  if (!about.value?.thumbnail) return null
  return getImageUrl(about.value.thumbnail, 'abouts')
})

const getArticleIcon = (title: string): string => {
  const icons: Record<string, string> = {
    'История церкви': '📜',
    'Наша миссия': '🎯',
    'Наши ценности': '💎',
    'Пастор': '👨‍💼'
  }
  return icons[title] || '📖'
}

const getCategoryIcon = (title?: string): string => {
  const icons: Record<string, string> = {
    'История': '📜',
    'Миссия': '🎯',
    'Ценности': '💎',
    'Пасторы': '👨‍💼',
    'Команда': '🤝',
    'Служения': '⛪'
  }
  return icons[title || ''] || '📄'
}

const handleImageError = (e: Event) => {
  imageError.value = true
  const img = e.target as HTMLImageElement
  img.style.display = 'none'
}

const formatDate = (dateStr: string | null): string => {
  if (!dateStr) return 'Дата неизвестна'
  return new Date(dateStr).toLocaleDateString('ru-RU', { 
    day: 'numeric', 
    month: 'long', 
    year: 'numeric' 
  })
}

const goToCategory = (slug?: string) => {
  if (slug) router.push(`/about?category=${slug}`)
  else router.push('/about')
}

// Загружаем статью при монтировании
onMounted(async () => {
  const slug = route.params.slug as string
  if (slug) {
    const result = await loadAbout(slug)
    console.log('Loaded about:', result)
    console.log('Denomination:', result?.denomination)
  }
})
</script>

<style scoped>
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}

@keyframes slideUp {
  from { opacity: 0; transform: translateY(30px); }
  to { opacity: 1; transform: translateY(0); }
}

.animate-fade-in {
  animation: fadeIn 0.5s ease forwards;
}

.animate-slide-up {
  animation: slideUp 0.5s ease forwards;
}

.prose :deep(p) {
  margin-bottom: 1rem;
  line-height: 1.8;
}

.prose :deep(img) {
  border-radius: 0.75rem;
  margin: 1.5rem 0;
}

.prose :deep(h2) {
  color: white;
  font-size: 1.5rem;
  margin-top: 2rem;
  margin-bottom: 1rem;
}

.prose :deep(h3) {
  color: #93c5fd;
  font-size: 1.25rem;
  margin-top: 1.5rem;
}
</style>