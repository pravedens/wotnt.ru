<script setup lang="ts">
import type { Event } from '~/types/event'
import { useSwiper } from '#imports'
import { ref } from 'vue'

// ✅ Данные с бэкенда через props
const props = defineProps<{
  events: Event[]
}>()

const config = useRuntimeConfig()
const { storageUrl, apiBase } = config.public

// ✅ Функция для получения URL изображения
const getImageUrl = (thumbnail: string | undefined): string | undefined => {
  if (!thumbnail) return undefined

  if (thumbnail.startsWith('http')) {
    return thumbnail
  }

  if (thumbnail.startsWith('events/thumbnails/')) {
    return `${storageUrl}/${thumbnail}`
  }

  if (thumbnail.startsWith('public/')) {
    return `${apiBase}/storage/${thumbnail.replace('public/', '')}`
  }

  return `${apiBase}/storage/${thumbnail}`
}

// ✅ Форматирование даты
const formatEventDate = (event: Event) => {
  if (!event) return 'Дата уточняется'
  
  const parts: string[] = []
  
  if (event.startDate) {
    const date = new Date(event.startDate)
    parts.push(
      date.toLocaleDateString('ru-RU', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      })
    )
  }
  
  const timeValue = event.startTime || event.time
  if (timeValue && timeValue !== '') {
    parts.push(timeValue)
  }
  
  return parts.join(' • ') || 'Дата уточняется'
}

// ✅ Swiper refs
const swiperCreativeRef = ref(null)

// ✅ Creative Effect с вашими данными
const swiper = useSwiper(swiperCreativeRef, {
  effect: 'creative',
  autoplay: {
    delay: 6000,
    disableOnInteraction: true,
  },
  creativeEffect: {
    prev: {
      translate: ['-125%', 0, -800],
      rotate: [0, 0, -90],
    },
    next: {
      translate: ['125%', 0, -800],
      rotate: [0, 0, 90],
    },
  },
})

onMounted(() => {
  console.log('Swiper initialized with events:', props.events.length)
})
</script>

<template>
  <div class="swiper-wrapper">
    <div class="swiper-wrapper__inner">
      <ClientOnly>
        <swiper-container 
          ref="swiperCreativeRef" 
          class="swiper-creative" 
          :loop="true" 
          :init="false"
        >
          <swiper-slide
            v-for="event in events"
            :key="event.id"
            class="relative overflow-hidden rounded-xl group"
          >
            <!-- ✅ Весь слайд — ссылка -->
            <NuxtLink
              :to="`/events/${event.slug}`"
              class="block w-full h-full"
            >
              <!-- Картинка -->
              <img
                v-if="getImageUrl(event.thumbnail)"
                :src="getImageUrl(event.thumbnail)"
                :alt="event.title"
                class="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                loading="lazy"
              />
              
              <!-- Затемнение -->
              <div class="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent"></div>
              
              <!-- Контент -->
              <div class="absolute bottom-0 left-0 right-0 p-6 text-white">
                <!-- Дата и время -->
                <div class="flex items-center gap-2 text-white/80 text-sm mb-2">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span>{{ formatEventDate(event) }}</span>
                </div>
                
                <!-- Заголовок -->
                <h3 class="text-2xl font-bold">{{ event.title }}</h3>
                
                <!-- Описание -->
                <p v-if="event.description" class="text-white/80 mt-2 line-clamp-2">
                  {{ event.description }}
                </p>
              </div>
            </NuxtLink>
          </swiper-slide>
        </swiper-container>
      </ClientOnly>
    </div>
  </div>
</template>

<style lang="css" scoped>
/* ✅ Ограничиваем ширину до 1278px */
.swiper-wrapper {
  display: flex;
  flex-direction: column;
  max-width: 1278px;
  margin: 0 auto;
  width: 100%;
}

.swiper-wrapper__inner {
  border: 1px solid rgba(255, 255, 255, 0.1);
  background: rgba(255, 255, 255, 0.05);
  padding: 1rem;
  border-radius: 12px;
  backdrop-filter: blur(10px);
  width: 100%;
}

swiper-slide {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 40vh;
  min-height: 300px;
  border-radius: 12px;
  overflow: hidden;
  background: linear-gradient(135deg, #1a1a2e, #16213e);
}

/* ✅ Адаптация под мобильные */
@media (max-width: 1278px) {
  .swiper-wrapper {
    max-width: 100%;
    padding: 0 16px;
  }
}

.line-clamp-2 {
  display: -webkit-box;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>