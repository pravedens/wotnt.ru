<template>
  <div class="min-h-screen bg-gradient-to-br from-blue-900 to-purple-900 py-12">
    <div class="container mx-auto px-4">
      <!-- Хлебные крошки с названием события -->
      <EventsBreadcrumbs :event-title="event?.title" />
      
      <!-- Состояние загрузки -->
      <div v-if="pending" class="text-center py-12">
        <div class="inline-block animate-spin rounded-full h-8 w-8 border-4 border-white border-t-transparent"></div>
        <p class="text-white/80 mt-4">Загрузка события...</p>
      </div>
      
      <!-- Ошибка -->
      <div v-else-if="error" class="bg-red-500/20 border border-red-500/50 rounded-2xl p-8 text-center max-w-2xl mx-auto">
        <p class="text-red-200 text-lg mb-4">{{ error }}</p>
        <button 
          @click="goBack"
          class="inline-block px-6 py-2 bg-red-500/30 text-red-200 rounded-lg hover:bg-red-500/40 transition"
        >
          Вернуться к календарю
        </button>
      </div>
      
      <!-- Контент события -->
      <article v-else-if="event" class="max-w-4xl mx-auto">
        <!-- Герой-секция с изображением -->
        <header class="relative rounded-2xl overflow-hidden mb-8 h-96">
          <!-- Фоновое изображение -->
          <div 
            v-if="imageUrl"
            class="absolute inset-0 bg-cover bg-center"
            :style="{ backgroundImage: `url(${imageUrl})` }"
          ></div>
          
          <!-- Заглушка без изображения -->
          <div 
            v-else
            class="absolute inset-0 bg-gradient-to-br from-blue-500 to-purple-500"
          ></div>
          
          <!-- Затемнение -->
          <div class="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-black/30"></div>
          
          <!-- Контент поверх -->
          <div class="relative h-full flex flex-col justify-end p-8">
            <!-- Дата -->
            <div class="mb-2">
              <span class="px-3 py-1 text-sm rounded-full bg-blue-500/30 text-blue-200 backdrop-blur-sm border border-blue-400/30">
                {{ displayDate }}
              </span>
            </div>
            
            <!-- Заголовок -->
            <h1 class="text-3xl md:text-4xl font-bold text-white mb-2">{{ event.title }}</h1>
          </div>
        </header>
        
        <!-- Краткое описание -->
        <div v-if="event.description" class="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20 mb-8">
          <h2 class="text-2xl font-bold text-white mb-4">О событии</h2>
          <p class="text-white/80 whitespace-pre-line leading-relaxed">{{ event.description }}</p>
        </div>
        
        <!-- Детальная информация -->
        <div v-if="event.info" class="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20 mb-8">
          <h2 class="text-2xl font-bold text-white mb-4">Подробности</h2>
          <div class="text-white/80 prose prose-invert max-w-none" v-html="event.info"></div>
        </div>
        
        <!-- Контент -->
        <div v-if="event.content" class="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20">
          <h2 class="text-2xl font-bold text-white mb-4">Содержание</h2>
          <div class="text-white/80 prose prose-invert max-w-none" v-html="event.content"></div>
        </div>
      </article>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRoute, useRouter } from 'vue-router'
import EventsBreadcrumbs from '~/components/events/Breadcrumbs.vue'

// Типы
interface Event {
  id: number
  title: string
  slug: string
  thumbnail?: string
  description?: string
  info?: string
  content?: string
  event_date?: string
  startDate?: string
  startTime?: string
  display_date_time?: string
  members_only?: boolean
  is_published?: boolean
}

// Composables
const route = useRoute()
const router = useRouter()
const config = useRuntimeConfig()

// Состояния
const slug = computed(() => route.params.slug as string)
const event = ref<Event | null>(null)
const pending = ref(true)
const error = ref<string | null>(null)

// Получение токена авторизации
const getAuthToken = (): string | null => {
  if (process.client) {
    return localStorage.getItem('auth_token')
  }
  return null
}

// Загрузка события (используем прокси для избежания CORS)
const loadEvent = async () => {
  pending.value = true
  error.value = null
  
  try {
    const headers: Record<string, string> = {
      'Accept': 'application/json'
    }
    
    const token = getAuthToken()
    if (token) {
      headers['Authorization'] = `Bearer ${token}`
    }
    
    // Используем прокси вместо прямого URL
    const data = await $fetch(`/api/events/${slug.value}`, { headers })
    event.value = data
  } catch (err: any) {
    console.error('Error loading event:', err)
    
    const status = err.response?.status || err.status
    if (status === 403) {
      error.value = 'Доступ запрещён. Это событие только для членов церкви.'
    } else if (status === 404) {
      error.value = 'Событие не найдено'
    } else {
      error.value = 'Ошибка загрузки события'
    }
  } finally {
    pending.value = false
  }
}

// Загружаем событие при монтировании
onMounted(() => {
  loadEvent()
})

onUnmounted(() => {
    if (process.client) {
        document.body.style.overflow = ''
        document.body.style.position = ''
        document.body.style.top = ''
        document.body.style.width = ''
    }
})

// Навигация назад
const goBack = () => {
    if (process.client) {
        document.body.style.overflow = ''
        document.body.style.position = ''
        document.body.style.top = ''
        document.body.style.width = ''
    }
    router.back()
}
// =====================================================
// ИЗОБРАЖЕНИЕ ИЗ S3
// =====================================================

const getStorageUrl = (thumbnail: string): string => {
  if (thumbnail.startsWith('http')) return thumbnail
  if (thumbnail.startsWith('events/thumbnails/')) {
    return `https://storage.yandexcloud.net/wotgospel-media/${thumbnail}`
  }
  if (thumbnail.startsWith('posts/thumbnails/')) {
    return `https://storage.yandexcloud.net/wotgospel-media/${thumbnail}`
  }
  if (thumbnail.startsWith('public/')) {
    return `https://wotgospel.ru/storage/${thumbnail.replace('public/', '')}`
  }
  return `https://wotgospel.ru/storage/${thumbnail}`
}

const imageUrl = computed(() => {
  if (!event.value?.thumbnail) return null
  return getStorageUrl(event.value.thumbnail)
})

// Картинка для соцсетей
const socialImage = computed(() => {
  if (imageUrl.value) {
    let image = imageUrl.value
    if (image.includes('.webp')) {
      image = image.replace('.webp', '.jpg')
    }
    return image
  }
  return 'https://storage.yandexcloud.net/wotgospel-media/og-images/default-og-image.jpg'
})

// =====================================================
// ДАТА
// =====================================================

const formatDate = (dateString: string): string => {
  if (!dateString) return ''
  const d = new Date(dateString)
  return d.toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  })
}

const displayDate = computed(() => {
  if (!event.value) return ''
  if (event.value.display_date_time) return event.value.display_date_time
  if (event.value.startDate) return formatDate(event.value.startDate)
  if (event.value.event_date) return formatDate(event.value.event_date)
  return 'Дата уточняется'
})

// =====================================================
// SEO
// =====================================================

const currentUrl = computed(() => `https://wotnt.ru${route.fullPath}`)

const cleanDescription = computed(() => {
  if (!event.value?.description) return ''
  return event.value.description
    .replace(/<[^>]*>/g, '')
    .substring(0, 300)
})

const shareTitle = computed(() => {
  if (!event.value) return 'Событие'
  
  let title = displayDate.value !== 'Дата уточняется' ? displayDate.value : ''
  if (event.value.title) {
    title = title ? `${title} — ${event.value.title}` : event.value.title
  }
  return title || 'Событие'
})

// Обновляем мета-теги после загрузки данных
watch(event, (newEvent) => {
  if (!newEvent) return
  
  useServerSeoMeta({
    title: shareTitle.value,
    description: cleanDescription.value || 'Событие церкви Слово Истины',
    ogTitle: shareTitle.value,
    ogDescription: cleanDescription.value,
    ogUrl: currentUrl.value,
    ogType: 'event',
    ogImage: socialImage.value,
    ogImageSecureUrl: socialImage.value,
    ogImageWidth: 1200,
    ogImageHeight: 630,
    ogImageType: 'image/jpeg',
    ogSiteName: 'Церковь Слово Истины',
    ogLocale: 'ru_RU',
    twitterCard: 'summary_large_image',
    twitterTitle: shareTitle.value,
    twitterDescription: cleanDescription.value,
    twitterImage: socialImage.value
  })

  useHead({
    meta: [
      {
        property: 'vk:title',
        content: shareTitle.value
      },
      {
        property: 'vk:description',
        content: cleanDescription.value
      },
      {
        property: 'vk:image',
        content: socialImage.value
      }
    ],
    link: [
      { rel: 'canonical', href: currentUrl.value }
    ]
  })
}, { immediate: true })
</script>

<style scoped>
.prose {
  color: rgba(255, 255, 255, 0.9);
}
.prose p {
  margin-bottom: 1rem;
  line-height: 1.7;
}
.prose h1, .prose h2, .prose h3, .prose h4 {
  color: white;
  margin-top: 1.5rem;
  margin-bottom: 1rem;
}
.prose a {
  color: #93c5fd;
  text-decoration: underline;
}
.prose a:hover {
  color: #bfdbfe;
}
.prose ul, .prose ol {
  margin-bottom: 1rem;
  padding-left: 1.5rem;
}
.prose li {
  margin-bottom: 0.25rem;
}
.prose img {
  max-width: 100%;
  height: auto;
  border-radius: 0.5rem;
  margin: 1rem 0;
}
</style>