<template>
  <div class="min-h-screen bg-gradient-to-br from-blue-900 to-purple-900 py-12">
    <div class="container mx-auto px-4">
      <!-- Хлебные крошки -->
      <PostsBreadcrumbs :post-title="post?.title" :post-slug="post?.slug" />
      
      <!-- Состояние загрузки -->
      <div v-if="pending" class="text-center py-12">
        <div class="inline-block animate-spin rounded-full h-8 w-8 border-4 border-white border-t-transparent"></div>
        <p class="text-white/80 mt-4">Загрузка проповеди...</p>
      </div>
      
      <!-- Ошибка -->
      <div v-else-if="error" class="bg-red-500/20 border border-red-500/50 rounded-2xl p-8 text-center max-w-2xl mx-auto">
        <p class="text-red-200 text-lg mb-4">{{ error }}</p>
        <NuxtLink 
          :to="backLink"
          class="inline-block px-6 py-2 bg-red-500/30 text-red-200 rounded-lg hover:bg-red-500/40 transition"
        >
          Вернуться к списку
        </NuxtLink>
      </div>
      
      <!-- Контент проповеди -->
      <article v-else-if="post" class="max-w-4xl mx-auto">
        <!-- Герой-секция с изображением -->
        <header class="relative rounded-2xl overflow-hidden mb-8 h-96">
          <img
            v-if="imageUrl"
            :src="imageUrl"
            :alt="post.title"
            class="absolute inset-0 w-full h-full object-cover"
            loading="eager"
            fetchpriority="high"
            decoding="async"
          />
          <div class="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-black/30"></div>
          
          <div class="relative h-full flex flex-col justify-end p-8">
            <div class="flex flex-wrap gap-2 mb-3">
              <span 
                v-if="post.category"
                class="px-3 py-1 text-sm rounded-full bg-blue-500/30 text-blue-200 backdrop-blur-sm border border-blue-400/30"
              >
                {{ post.category.title }}
              </span>
              <span 
                v-if="post.group"
                class="px-3 py-1 text-sm rounded-full bg-purple-500/30 text-purple-200 backdrop-blur-sm border border-purple-400/30"
              >
                {{ post.group.title }}
              </span>
              <span 
                v-if="post.conference"
                class="px-3 py-1 text-sm rounded-full bg-green-500/30 text-green-200 backdrop-blur-sm border border-green-400/30"
              >
                {{ post.conference.title }}
              </span>
            </div>
            
            <!-- H1 - главный заголовок страницы -->
            <h1 class="text-3xl md:text-4xl font-bold text-white mb-2">{{ post.title }}</h1>
            
            <div class="flex items-center justify-between">
              <p class="text-white/70">{{ formatDate(post.created_at) }}</p>
              <div class="flex items-center gap-4">
                <ViewsCount :post-id="post.id" />
                <LikeButton :post-id="post.id" />
              </div>
            </div>
          </div>
        </header>
        
        <!-- Основной контент -->
        <div class="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20 mb-8">
          <!-- Описание проповеди (если есть) -->
          <div v-if="post.clean_description" class="mb-6">
            <h2 class="text-2xl font-semibold text-white mb-3">Описание проповеди</h2>
            <p class="text-white/80 whitespace-pre-line leading-relaxed border-l-4 border-pink-500 pl-3 italic">
              {{ post.clean_description }}
            </p>
          </div>
          
          <!-- Текст проповеди (если есть) -->
          <div v-if="post.clean_content">
            <h2 class="text-2xl font-semibold text-white mb-3">Текст проповеди</h2>
            <div class="text-white/80 prose prose-invert max-w-none">
              {{ post.clean_content }}
            </div>
          </div>
        </div>
        
        <!-- Блок шаринга -->
        <section class="mb-8">
          <h2 class="text-2xl font-semibold text-white text-center mb-4">Поделиться проповедью</h2>
          <div class="flex flex-wrap gap-3 justify-center">
            <a
              :href="vkShareUrl"
              target="_blank"
              rel="noopener noreferrer"
              @click="handleVkClick"
              class="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-all shadow-lg hover:shadow-xl cursor-pointer"
              aria-label="Поделиться в ВКонтакте"
            >
              <svg class="w-5 h-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M21.485 7.097c.139-.445-.05-.678-.526-.678h-1.966c-.43 0-.646.24-.756.505 0 0-.89 2.131-2.155 3.514-.398.418-.58.55-.797.55-.109 0-.27-.132-.27-.577V7.097c0-.459-.134-.678-.522-.678h-3.119c-.294 0-.473.226-.473.44 0 .46.668.567.735 1.862v2.815c0 .617-.112.73-.357.73-.658 0-2.257-2.386-3.207-5.115-.187-.544-.373-.733-.806-.733H4.827c-.478 0-.574.24-.574.505 0 .473.627 2.842 2.915 5.97 1.526 2.181 3.676 3.37 5.634 3.37 1.174 0 1.32-.26 1.32-.712v-1.642c0-.495.104-.594.453-.594.257 0 .698.129 1.727 1.126 1.175 1.175 1.368 1.703 2.03 1.703h1.966c.478 0 .719-.237.58-.707-.151-.479-.694-1.172-1.414-1.994-.398-.472-.995-.981-1.176-1.235-.253-.33-.18-.477 0-.771 0 0 2.074-2.896 2.29-3.876z"/>
              </svg>
              <span class="hidden sm:inline">ВКонтакте</span>
            </a>
            
            <button
              @click="handleShareOK"
              class="flex items-center gap-2 px-5 py-2.5 bg-orange-500 hover:bg-orange-600 text-white rounded-xl transition-all shadow-lg hover:shadow-xl"
              aria-label="Поделиться в Одноклассниках"
            >
              <svg class="w-5 h-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M12 2a5 5 0 1 0 5 5 5 5 0 0 0-5-5zm0 8a3 3 0 1 1 3-3 3 3 0 0 1-3 3zm6.3 6.3a8 8 0 0 0-12.6 0l1.8 1.8a6 6 0 0 1 9 0zM20 19a10 10 0 0 0-16 0l1.8 1.8a8 8 0 0 1 12.4 0z"/>
              </svg>
              <span class="hidden sm:inline">Одноклассники</span>
            </button>
          </div>
        </section>
        
        <!-- Видео Rutube -->
        <ClientOnly v-if="post.rutube">
          <section class="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 mb-8">
            <h2 class="text-2xl font-semibold text-white mb-3">Видео проповеди на Rutube</h2>
            <div class="aspect-video rounded-lg overflow-hidden">
              <iframe 
                width="100%" 
                height="100%" 
                :src="`https://rutube.ru/play/embed/${post.rutube}`"
                frameborder="0" 
                allow="clipboard-write; autoplay"
                allowfullscreen
                loading="lazy"
                :title="`Видео проповеди: ${post.title}`"
              ></iframe>
            </div>
          </section>
          
          <template #fallback>
            <div class="aspect-video bg-white/5 rounded-lg animate-pulse"></div>
          </template>
        </ClientOnly>
        
        <!-- Другие источники просмотра -->
        <section v-if="hasMediaLinks" class="mb-8">
          <h2 class="text-2xl font-semibold text-white text-center mb-4">Смотреть на других платформах</h2>
          <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            <a 
              v-if="post.youtube" 
              :href="post.youtube" 
              target="_blank" 
              rel="noopener noreferrer" 
              class="flex flex-col items-center p-4 bg-white/10 rounded-xl hover:bg-white/20 transition-all hover:scale-105 border border-white/20"
              @click="trackExternalLink('YouTube')"
            >
              <img class="h-10 mb-2" src="/icons/Youtube_red.png" alt="YouTube" loading="lazy" />
              <span class="text-sm text-white">YouTube</span>
            </a>
            <a 
              v-if="post.dzen" 
              :href="post.dzen" 
              target="_blank" 
              rel="noopener noreferrer" 
              class="flex flex-col items-center p-4 bg-white/10 rounded-xl hover:bg-white/20 transition-all hover:scale-105 border border-white/20"
              @click="trackExternalLink('Dzen')"
            >
              <img class="h-10 mb-2" src="/icons/dark-icon.png" alt="Яндекс.Дзен" loading="lazy" />
              <span class="text-sm text-white">Дзен</span>
            </a>
            <a 
              v-if="post.vkVideo" 
              :href="post.vkVideo" 
              target="_blank" 
              rel="noopener noreferrer" 
              class="flex flex-col items-center p-4 bg-white/10 rounded-xl hover:bg-white/20 transition-all hover:scale-105 border border-white/20"
              @click="trackExternalLink('VK')"
            >
              <img class="h-10 mb-2" src="/icons/vk_logo_icon_257028.png" alt="VK Видео" loading="lazy" />
              <span class="text-sm text-white">VK</span>
            </a>
          </div>
        </section>
        
        <!-- Аудио плеер -->
        <section v-if="post.audio_url" class="mb-8">
          <h2 class="text-2xl font-semibold text-white mb-3">Аудио запись проповеди</h2>
          <AudioPlayer
            :audio-url="post.audio_url"
            :audio-filename="post.audio_filename"
            :audio-size="post.audio_size_formatted"
            @play="trackAudioPlay"
          />
        </section>
        
        <!-- Текстовый файл -->
        <section v-if="post.text_url" class="mb-8">
          <h2 class="text-2xl font-semibold text-white mb-3">Скачать текст проповеди</h2>
          <TextFile
            :file-url="post.text_url"
            :filename="post.text_filename"
            :display-filename="post.display_text_filename"
            :file-size="post.text_size_formatted"
            :mime="post.text_mime"
            @download="trackFileDownload('text')"
          />
        </section>
      </article>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRoute, useRouter } from 'vue-router'
import LikeButton from '~/components/posts/LikeButton.vue'
import ViewsCount from '~/components/posts/ViewsCount.vue'
import { useStatsStore } from '~/stores/stats'
import PostsBreadcrumbs from '~/components/posts/Breadcrumbs.vue'
import AudioPlayer from '~/components/posts/AudioPlayer.vue'
import TextFile from '~/components/posts/TextFile.vue'

const route = useRoute()
const router = useRouter()
const statsStore = useStatsStore()

// Получаем slug из параметров
const slug = computed(() => route.params.slug as string)

// Загружаем данные с прямым URL API
const { data: post, pending, error: fetchError } = useAsyncData(
  () => `post-${slug.value}`,
  async () => {
    return await $fetch(`https://wotgospel.ru/api/posts/${slug.value}`)
  },
  { 
    server: true,
    initialCache: false
  }
)

// Обработка ошибки
const error = computed(() => {
  if (fetchError.value) return 'Проповедь не найдена'
  return null
})

// ============================================
// GOOGLE ANALYTICS & YANDEX METRIKA ТРЕКИНГ
// ============================================

// Отправка события в GA4 и Яндекс.Метрику
const trackEvent = (eventName: string, eventParams: Record<string, any> = {}) => {
  if (process.client) {
    // Google Analytics 4
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', eventName, {
        ...eventParams,
        event_category: eventParams.event_category || 'sermons',
        event_label: eventParams.event_label || post.value?.title
      })
    }
    
    // Яндекс.Метрика
    if (typeof window !== 'undefined' && window.ym) {
      window.ym(95320948, 'reachGoal', eventName, eventParams)
    }
    
  }
}

// Отслеживание прослушивания аудио
const trackAudioPlay = () => {
  trackEvent('audio_play', {
    event_category: 'sermons',
    event_label: post.value?.title,
    sermon_id: post.value?.id,
    sermon_slug: post.value?.slug
  })
}

// Отслеживание скачивания файлов
const trackFileDownload = (fileType: string) => {
  trackEvent('file_download', {
    event_category: 'sermons',
    event_label: `${fileType} - ${post.value?.title}`,
    file_type: fileType,
    sermon_id: post.value?.id,
    sermon_title: post.value?.title
  })
}

// Отслеживание внешних ссылок
const trackExternalLink = (platform: string) => {
  trackEvent('external_link_click', {
    event_category: 'social',
    event_label: platform,
    platform: platform,
    sermon_id: post.value?.id,
    sermon_title: post.value?.title
  })
}

// URL для шаринга во ВКонтакте
const vkShareUrl = computed(() => {
  return `https://vk.com/share.php?url=${encodeURIComponent(currentUrl.value)}`
})

// Обработчик клика на ВКонтакте
const handleVkClick = () => {
  trackEvent('share', {
    event_category: 'social',
    event_label: 'VKontakte',
    platform: 'vk',
    sermon_id: post.value?.id,
    sermon_title: post.value?.title
  })
}

// Функция шаринга в Одноклассники
const shareOnOK = () => {
  const shareUrl = `https://connect.ok.ru/dk?st.cmd=WidgetSharePreview&st.shareUrl=${encodeURIComponent(currentUrl.value)}&st.title=${encodeURIComponent(shareTitle.value)}&st.description=${encodeURIComponent(cleanDescription.value)}`
  window.open(shareUrl, '_blank', 'width=600,height=400')
}

// Отслеживание шаринга в OK
const handleShareOK = () => {
  trackEvent('share', {
    event_category: 'social',
    event_label: 'Odnoklassniki',
    platform: 'ok',
    sermon_id: post.value?.id,
    sermon_title: post.value?.title
  })
  shareOnOK()
}

// Отслеживание скролла страницы
let scrollTriggered = false
const trackScroll = () => {
  if (!scrollTriggered && typeof window !== 'undefined') {
    const scrollPercent = (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100
    if (scrollPercent >= 50) {
      scrollTriggered = true
      trackEvent('scroll_depth', {
        event_category: 'engagement',
        event_label: '50%',
        scroll_percent: 50,
        sermon_id: post.value?.id
      })
    }
  }
}

// Отслеживание времени на странице
let pageLoadTime = Date.now()
const trackTimeOnPage = () => {
  const timeSpent = Math.round((Date.now() - pageLoadTime) / 1000)
  if (timeSpent >= 30) {
    trackEvent('time_on_page', {
      event_category: 'engagement',
      event_label: `${timeSpent}s`,
      time_seconds: timeSpent,
      sermon_id: post.value?.id
    })
  }
}

// Получаем все параметры из URL
const currentQuery = computed(() => {
  const query: any = {}
  if (route.query.category_id) query.category_id = String(route.query.category_id)
  if (route.query.group_id) query.group_id = String(route.query.group_id)
  if (route.query.conference_id) query.conference_id = String(route.query.conference_id)
  if (route.query.search) query.search = String(route.query.search)
  if (route.query.page) query.page = String(route.query.page)
  return query
})

// Формируем ссылку для возврата (без search параметра)
const backLink = computed(() => {
  const query: any = {}
  if (route.query.category_id) query.category_id = String(route.query.category_id)
  if (route.query.group_id) query.group_id = String(route.query.group_id)
  if (route.query.conference_id) query.conference_id = String(route.query.conference_id)
  // search и page не включаем
  
  return {
    path: '/sermons',
    query: Object.keys(query).length > 0 ? query : undefined
  }
})

// URL для изображения
const imageUrl = computed(() => {
  if (!post.value) return null
  if (post.value.thumbnail_url) return post.value.thumbnail_url
  if (post.value.thumbnail) {
    if (post.value.thumbnail.startsWith('http')) return post.value.thumbnail
    if (post.value.thumbnail.startsWith('posts/')) {
      return `https://storage.yandexcloud.net/wotgospel-media/${post.value.thumbnail}`
    }
    return `https://wotgospel.ru/storage/${post.value.thumbnail.replace('public/', '')}`
  }
  return null
})

// Полный URL текущей страницы
const currentUrl = computed(() => {
  return `https://wotnt.ru${route.fullPath}`
})

// Очищенное описание (без HTML)
const cleanDescription = computed(() => {
  if (!post.value?.clean_description) return ''
  return post.value.clean_description.substring(0, 300)
})

// Форматированная дата
const formatDate = (dateString: string) => {
  if (!dateString) return ''
  const d = new Date(dateString)
  return `${d.getDate()} ${d.toLocaleString('ru-RU', { month: 'long' })} ${d.getFullYear()}`
}

// Заголовок для шаринга
const shareTitle = computed(() => {
  if (!post.value) return 'Проповедь'

  let title = ''

  if (post.value.created_at) {
    title = formatDate(post.value.created_at)
  }

  if (post.value.category?.title) {
    title = title
      ? `${title} — ${post.value.category.title}`
      : post.value.category.title
  }

  if (post.value.title) {
    title = title
      ? `${title} — ${post.value.title}`
      : post.value.title
  }

  return title || 'Проповедь'
})

// Основная картинка для соцсетей
const socialImage = computed(() => {
  if (post.value?.og_image) return post.value.og_image
  if (imageUrl.value && !imageUrl.value.endsWith('.webp')) return imageUrl.value

  return 'https://storage.yandexcloud.net/wotgospel-media/og-images/default-og-image.jpg'
})

// SEO мета-теги
useServerSeoMeta({
  title: () => shareTitle.value,
  description: () => cleanDescription.value || 'Проповедь церкви Слово Истины',

  ogTitle: () => shareTitle.value,
  ogDescription: () => cleanDescription.value || 'Проповедь церкви Слово Истины',
  ogUrl: () => currentUrl.value,
  ogType: 'article',
  ogImage: () => socialImage.value,
  ogImageSecureUrl: () => socialImage.value,
  ogImageWidth: '1200',
  ogImageHeight: '630',
  ogImageType: 'image/jpeg',
  ogSiteName: 'Церковь Слово Истины',
  ogLocale: 'ru_RU',

  twitterCard: 'summary_large_image',
  twitterTitle: () => shareTitle.value,
  twitterDescription: () => cleanDescription.value || 'Проповедь церкви Слово Истины',
  twitterImage: () => socialImage.value
})

// Добавляем VK-specific мета-теги
useHead(() => ({
  meta: [
    {
      name: 'description', 
      content: cleanDescription.value || 'Проповедь церкви Слово Истины'
    },
    {
      name: 'keywords',
      content: `проповедь, ${post.value?.category?.title || ''}, ${post.value?.title || ''}, церковь, слово истины`
    },
    {
      property: 'vk:title',
      content: shareTitle.value
    },
    {
      property: 'vk:description',
      content: cleanDescription.value || 'Проповедь церкви Слово Истины'
    },
    {
      property: 'vk:image',
      content: socialImage.value
    }
  ],
  link: [
    { rel: 'canonical', href: currentUrl.value },
    ...(imageUrl.value ? [{
      rel: 'preload',
      as: 'image',
      href: imageUrl.value
    }] : [])
  ]
}))

// Проверка наличия медиа-ссылок
const hasMediaLinks = computed(() => {
  return post.value?.youtube || post.value?.dzen || post.value?.vkVideo || post.value?.audio || post.value?.text
})

// Отслеживаем просмотр после загрузки
watch(
  () => post.value?.id,
  async (id) => {
    if (!id || !process.client) return
    
    await statsStore.trackView(id)
    await statsStore.fetchPostStats(id)
  },
  { immediate: true }
)

// ============================================
// КЛЮЧЕВОЕ: очищаем параметры URL при загрузке
// ============================================
onMounted(() => {
  // Если в URL есть query параметры (например, ?search=...), удаляем их
  if (Object.keys(route.query).length > 0) {
    router.replace(`/sermons/${route.params.slug}`)
  }
  
  window.addEventListener('scroll', trackScroll)
  window.addEventListener('beforeunload', trackTimeOnPage)
})

onUnmounted(() => {
  window.removeEventListener('scroll', trackScroll)
  window.removeEventListener('beforeunload', trackTimeOnPage)
})
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