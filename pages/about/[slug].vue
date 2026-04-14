<template>
  <div class="min-h-screen bg-gradient-to-br from-blue-900 to-purple-900 py-12">
    <div class="container mx-auto px-4">
      <!-- Хлебные крошки -->
      <AboutBreadcrumbs 
        :denomination-title="about?.denomination?.title"
        :about-title="about?.title"
      />
      
      <!-- Состояние загрузки -->
      <div v-if="loading" class="text-center py-12">
        <div class="inline-block animate-spin rounded-full h-8 w-8 border-4 border-white border-t-transparent"></div>
        <p class="text-white/80 mt-4">Загрузка статьи...</p>
      </div>
      
      <!-- Ошибка -->
      <div v-else-if="error" class="bg-red-500/20 border border-red-500/50 rounded-2xl p-8 text-center max-w-2xl mx-auto">
        <p class="text-red-200 text-lg mb-4">{{ error }}</p>
        <button 
          @click="router.push('/about')"
          class="px-6 py-2 bg-red-500/30 text-red-200 rounded-lg hover:bg-red-500/40 transition"
        >
          Вернуться к списку
        </button>
      </div>
      
      <!-- Статья -->
      <article v-else-if="about" class="max-w-4xl mx-auto">
        <!-- Герой-секция с изображением -->
        <div class="relative rounded-2xl overflow-hidden mb-8 h-96">
          <!-- Изображение -->
          <img 
            v-if="imageUrl"
            :src="imageUrl"
            :alt="about.title"
            class="w-full h-full object-cover"
            @error="handleImageError"
          >
          <div v-else class="w-full h-full bg-gradient-to-br from-blue-600 to-purple-600"></div>
          
          <!-- Затемнение -->
          <div class="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-black/30"></div>
          
          <!-- Контент поверх -->
          <div class="absolute inset-0 flex flex-col justify-end p-8">
            <!-- Категория -->
            <div class="mb-2">
              <button
                @click="goToCategory(about.denomination?.slug)"
                class="px-3 py-1 text-sm rounded-full bg-blue-500/30 text-blue-200 backdrop-blur-sm border border-blue-400/30 hover:bg-blue-500/40 transition"
              >
                {{ about.denomination?.title || 'Без категории' }}
              </button>
            </div>
            
            <!-- Заголовок -->
            <h1 class="text-3xl md:text-4xl font-bold text-white mb-2">{{ about.title }}</h1>
            
            <!-- Дата -->
            <div class="text-white/60 text-sm">
              {{ formatDate(about.created_at || about.updated_at) }}
            </div>
          </div>
        </div>
        
        <!-- Краткое описание -->
        <div class="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20 mb-8">
          <h2 class="text-2xl font-bold text-white mb-4">О чём статья</h2>
          <p class="text-white/80 text-lg leading-relaxed whitespace-pre-line">{{ about.description }}</p>
        </div>
        
        <!-- Основной контент -->
        <div class="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20 prose prose-invert max-w-none">
          <div class="text-white/80 whitespace-pre-line" v-html="about.content"></div>
        </div>
        
        <!-- Навигация -->
        <div class="mt-8 flex justify-between">
          <button 
            @click="router.back()"
            class="text-white/60 hover:text-white transition flex items-center gap-2"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Назад
          </button>
          
          <button
            v-if="about.denomination?.slug"
            @click="goToCategory(about.denomination?.slug)"
            class="text-white/60 hover:text-white transition flex items-center gap-2"
          >
            Все статьи категории
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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

const router = useRouter()
const route = useRoute()

const {
  currentAbout: about,
  loading,
  error,
  loadAbout
} = useAbout()

const { getImageUrl } = useImageUrl()
const imageError = ref(false)

const imageUrl = computed(() => {
  if (!about.value?.thumbnail) return null
  return getImageUrl(about.value.thumbnail, 'abouts')
})

const handleImageError = (e: Event) => {
  imageError.value = true
  const img = e.target as HTMLImageElement
  console.error('❌ Ошибка загрузки изображения:', img.src)
}

const formatDate = (dateStr: string | null) => {
  if (!dateStr) return 'Дата неизвестна'
  const date = new Date(dateStr)
  return date.toLocaleDateString('ru-RU', { 
    day: 'numeric', 
    month: 'long', 
    year: 'numeric' 
  })
}

const goToCategory = (slug?: string) => {
  if (slug) {
    router.push(`/about?category=${slug}`)
  } else {
    router.push('/about')
  }
}

onMounted(() => {
  if (route.params.slug) {
    loadAbout(route.params.slug as string)
  }
})
</script>