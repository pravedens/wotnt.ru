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
          @click="router.back()"
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
          
          <!-- Затемнение -->
          <div class="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-black/30"></div>
          
          <!-- Контент поверх -->
          <div class="relative h-full flex flex-col justify-end p-8">
            <!-- Дата -->
            <div class="mb-2">
              <span class="px-3 py-1 text-sm rounded-full bg-blue-500/30 text-blue-200 backdrop-blur-sm border border-blue-400/30">
                {{ event.display_date_time || formatDate(event.event_date) }}
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

const route = useRoute()
const router = useRouter()

// =====================================================
// ✅ ЗАГРУЗКА СОБЫТИЯ С ТОКЕНОМ АВТОРИЗАЦИИ
// =====================================================

const slug = computed(() => route.params.slug as string)
const event = ref<any>(null)
const pending = ref(true)
const error = ref<string | null>(null)

// Функция для получения заголовков с токеном
const getAuthHeaders = () => {
  const headers: Record<string, string> = {
    'Accept': 'application/json'
  }
  
  // Получаем токен из localStorage (только на клиенте)
  if (process.client) {
    const token = localStorage.getItem('auth_token')
    if (token) {
      headers['Authorization'] = `Bearer ${token}`
    }
  }
  
  return headers
}

// Загружаем событие
const loadEvent = async () => {
  pending.value = true
  error.value = null
  
  try {
    const headers = getAuthHeaders()
    const data = await $fetch(`https://wotgospel.ru/api/events/${slug.value}`, { headers })
    event.value = data
  } catch (err: any) {
    console.error('Error loading event:', err)
    
    if (err.response?.status === 403 || err.status === 403) {
      error.value = 'Доступ запрещён. Это событие только для членов церкви.'
    } else if (err.response?.status === 404 || err.status === 404) {
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

// =====================================================
// ✅ ИЗОБРАЖЕНИЕ ИЗ S3
// =====================================================

const imageUrl = computed(() => {
  if (!event.value?.thumbnail) return null

  if (event.value.thumbnail.startsWith('http')) {
    return event.value.thumbnail
  }

  if (event.value.thumbnail.startsWith('events/thumbnails/')) {
    return `https://storage.yandexcloud.net/wotgospel-media/${event.value.thumbnail}`
  }

  if (event.value.thumbnail.startsWith('posts/thumbnails/')) {
    return `https://storage.yandexcloud.net/wotgospel-media/${event.value.thumbnail}`
  }

  if (event.value.thumbnail.startsWith('public/')) {
    return `https://wotgospel.ru/storage/${event.value.thumbnail.replace('public/', '')}`
  }

  return `https://wotgospel.ru/storage/${event.value.thumbnail}`
})

// Картинка для соцсетей (без webp)
const socialImage = computed(() => {
  if (imageUrl.value) {
    let image = imageUrl.value

    if (image.includes('.webp')) {
      image = image.replace('.webp', '.jpg')
    }

    if (image.startsWith('http')) {
      return image
    }

    return `https://wotnt.ru${image}`
  }

  return 'https://storage.yandexcloud.net/wotgospel-media/og-images/default-og-image.jpg'
})

// =====================================================
// ✅ URL И ОПИСАНИЕ
// =====================================================

const currentUrl = computed(() => {
  return `https://wotnt.ru${route.fullPath}`
})

const cleanDescription = computed(() => {
  if (!event.value?.description) return ''
  return event.value.description
    .replace(/<[^>]*>/g, '')
    .substring(0, 300)
})

// =====================================================
// ✅ ФОРМАТ ДАТЫ
// =====================================================

const formatDate = (dateString: string) => {
  if (!dateString) return ''
  const d = new Date(dateString)
  return d.toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  })
}

// =====================================================
// ✅ ЗАГОЛОВОК ДЛЯ SEO
// =====================================================

const shareTitle = computed(() => {
  if (!event.value) return 'Событие'

  let title = ''

  if (event.value.event_date) {
    title = formatDate(event.value.event_date)
  }

  if (event.value.title) {
    title = title
      ? `${title} — ${event.value.title}`
      : event.value.title
  }

  return title || 'Событие'
})

// =====================================================
// ✅ SEO (SSR)
// =====================================================

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
</style>