<template>
  <div class="min-h-screen bg-gradient-to-br from-blue-900 to-purple-900">
    <!-- Hero секция -->
    <header class="container mx-auto px-4 py-12 text-center">
      <h1 class="text-4xl md:text-6xl font-bold text-white mb-4">
        Церковь Слово Истины
      </h1>
      <p class="text-xl text-white/80 max-w-3xl mx-auto">
        Добро пожаловать на сайт Церкви Слово Истины! Здесь вы найдете проповеди и анонсы предстоящих событий нашей церковной семьи.
      </p>
    </header>
    
    <!-- Прямая трансляция (компонент сам решает, показываться или нет) -->
    <ClientOnly>
      <LiveStream />
    </ClientOnly>
    
    <!-- Декоративный разделитель -->
    <div class="container mx-auto px-4 mb-16">
      <div class="w-full max-w-2xl mx-auto">
        <div class="h-px bg-gradient-to-r from-transparent via-white/30 to-transparent"></div>
      </div>
    </div>
    
    <!-- Ближайшие события -->
    <section aria-labelledby="events-heading" class="mb-16 events-section">
      <div class="events-container">
        <h2 id="events-heading" class="sr-only">
          Ближайшие события
        </h2>
        <UpcomingCarousel :limit="6" />
      </div>
    </section>
    
    <!-- Декоративный разделитель -->
    <div class="container mx-auto px-4 mb-16">
      <div class="w-full max-w-2xl mx-auto">
        <div class="h-px bg-gradient-to-r from-transparent via-white/30 to-transparent"></div>
      </div>
    </div>
    
    <!-- Стих дня -->
    <div class="container mx-auto px-4 mb-16">
      <VerseOfTheDay />
    </div>
    
    <!-- Декоративный разделитель -->
    <div class="container mx-auto px-4 mb-16">
      <div class="w-full max-w-2xl mx-auto">
        <div class="h-px bg-gradient-to-r from-transparent via-white/30 to-transparent"></div>
      </div>
    </div>
    
    <!-- Рекомендуемые проповеди -->
    <section aria-labelledby="sermons-heading">
      <div class="container mx-auto px-4">
        <h2 id="sermons-heading" class="sr-only">
          Рекомендуемые проповеди
        </h2>
        <RecommendedSermons :limit="4" />
      </div>
    </section>
    
    <!-- Декоративный разделитель -->
    <div class="container mx-auto px-4 mb-16">
      <div class="w-full max-w-2xl mx-auto">
        <div class="h-px bg-gradient-to-r from-transparent via-white/30 to-transparent"></div>
      </div>
    </div>
    
    <!-- Дружественные церкви -->
    <FriendsCarousel />
    
    <!-- Декоративный разделитель -->
    <div class="container mx-auto px-4 mb-16">
      <div class="w-full max-w-2xl mx-auto">
        <div class="h-px bg-gradient-to-r from-transparent via-white/30 to-transparent"></div>
      </div>
    </div>
    
    <!-- Дополнительный контент -->
    <div class="container mx-auto px-4 py-12 text-white max-w-4xl mx-auto space-y-10">
      <section>
        <h2 class="text-2xl font-bold mb-4">О церкви «Слово Истины»</h2>
        <p class="text-white/80 mb-4">
          Церковь «Слово Истины» — это христианское сообщество верующих, объединённых любовью к Богу, изучением Библии и живыми богослужениями. 
          Мы регулярно проводим воскресные служения, молитвенные встречи и разборы Писания.
        </p>
        <p class="text-white/80">
          На сайте вы можете смотреть и слушать проповеди, узнавать о предстоящих событиях и присоединяться к жизни нашей церковной семьи.
        </p>
      </section>

      <section>
        <h2 class="text-2xl font-bold mb-4">Наша миссия</h2>
        <p class="text-white/80">
          Наша миссия — проповедь Евангелия, духовный рост верующих и созидание сильного христианского сообщества. 
          Мы стремимся, чтобы каждое богослужение, каждая проповедь и каждое служение помогали людям укрепляться в вере.
        </p>
      </section>

      <section>
        <h2 class="text-2xl font-bold mb-4">Присоединяйтесь к нам</h2>
        <p class="text-white/80">
          Приглашаем вас посетить богослужение, посмотреть проповеди онлайн или узнать о ближайших событиях. 
          Будем рады видеть вас на служении и в нашем сообществе.
        </p>
      </section>

      <section>
        <h2 class="text-2xl font-bold mb-4">Часто задаваемые вопросы</h2>
        <div class="text-white/80 space-y-3">
          <p><strong>Когда проходят богослужения?</strong><br>
          Постоянные богослужения проходят каждое воскресенье, начало в 11:00.</p>
          <p><strong>Можно ли смотреть проповеди онлайн?</strong><br>
          Да, на сайте доступны видео-, аудио- и текстовые форматы проповедей.</p>
          <p><strong>Как стать частью церкви?</strong><br>
          Вы можете посетить служение лично, познакомиться с пастором и участниками церкви и принять решение самостоятельно.</p>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
// ============================================
// ВСЕ КОМПОНЕНТЫ ЗАГРУЖАЮТСЯ АСИНХРОННО
// ============================================
const LiveStream = defineAsyncComponent(() => import('~/components/live/LiveStream.vue'))
const UpcomingCarousel = defineAsyncComponent(() => import('~/components/events/UpcomingCarousel.vue'))
const RecommendedSermons = defineAsyncComponent(() => import('~/components/posts/RecommendedSermons.vue'))
const VerseOfTheDay = defineAsyncComponent(() => import('~/components/bible/VerseOfTheDay.vue'))
const FriendsCarousel = defineAsyncComponent(() => import('~/components/friends/FriendsCarousel.vue'))

// ============================================
// SEO МЕТА-ТЕГИ
// ============================================
useServerSeoMeta({
  title: 'Церковь Слово Истины | Главная',
  description: 'Церковь Слово Истины — рекомендуемые проповеди, видео и аудио записи, текстовые, события, стих дня. Присоединяйтесь к нашим служениям!',
  ogTitle: 'Церковь Слово Истины',
  ogDescription: 'Церковь Слово Истины — проповеди, видео и аудио записи, анонсы событий, стих дня. Присоединяйтесь к нашим служениям!',
  ogType: 'website',
  ogUrl: 'https://wotnt.ru',
  ogImage: 'https://storage.yandexcloud.net/wotgospel-media/og-images/default-og-image.jpg',
  ogImageSecureUrl: 'https://storage.yandexcloud.net/wotgospel-media/og-images/default-og-image.jpg',
  ogImageWidth: 1200,
  ogImageHeight: 630,
  ogImageType: 'image/jpeg',
  ogSiteName: 'Церковь Слово Истины',
  ogLocale: 'ru_RU',
  twitterCard: 'summary_large_image',
  twitterTitle: 'Церковь Слово Истины',
  twitterDescription: 'Церковь Слово Истины — рекомендуемые проповеди, видео и аудио записи, анонсы событий, стих дня. Присоединяйтесь к нашим служениям!',
  twitterImage: 'https://storage.yandexcloud.net/wotgospel-media/og-images/default-og-image.jpg'
})

// ============================================
// МИКРОРАЗМЕТКА SCHEMA.ORG
// ============================================
useHead(() => ({
  script: [
    {
      type: 'application/ld+json',
      children: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'Organization',
        name: 'Церковь Слово Истины',
        url: 'https://wotnt.ru',
        logo: 'https://storage.yandexcloud.net/wotgospel-media/og-images/default-og-image.jpg',
        description: 'Церковь Слово Истины — Проповеди, видео, аудио и текстовые, события, стих дня.',
        sameAs: [
          'https://vk.com/your_church',
          'https://www.youtube.com/your_church',
          'https://t.me/your_church'
        ],
        address: {
          '@type': 'PostalAddress',
          addressLocality: 'Москва',
          addressCountry: 'RU'
        },
        contactPoint: {
          '@type': 'ContactPoint',
          telephone: '+7-XXX-XXX-XX-XX',
          contactType: 'customer service',
          availableLanguage: ['Russian']
        }
      })
    },
    {
      type: 'application/ld+json',
      children: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'WebSite',
        name: 'Церковь Слово Истины',
        url: 'https://wotnt.ru',
        description: 'Официальный сайт Церкви Слово Истины города Нижнего Тагила. Проповеди, видео, аудио и текстовые, события, стих дня.',
        potentialAction: {
          '@type': 'SearchAction',
          target: {
            '@type': 'EntryPoint',
            urlTemplate: 'https://wotnt.ru/sermons?search={search_term_string}'
          },
          'query-input': 'required name=search_term_string'
        }
      })
    },
    {
      type: 'application/ld+json',
      children: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'Event',
        name: 'Воскресное служение',
        description: 'Еженедельное воскресное богослужение церкви Слово Истины',
        startDate: '2024-03-31T11:00:00+03:00',
        endDate: '2024-03-31T13:00:00+03:00',
        location: {
          '@type': 'Place',
          name: 'Церковь Слово Истины',
          address: {
            '@type': 'PostalAddress',
            addressLocality: 'Москва',
            addressCountry: 'RU'
          }
        },
        eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
        eventStatus: 'https://schema.org/EventScheduled'
      })
    }
  ],
  meta: [
    {
      name: 'keywords',
      content: 'церковь, слово истины, проповеди, христианство, богослужение, события, община верующих'
    },
    {
      name: 'description',
      content: 'Церковь Слово Истины — проповеди, видео и аудио записи, анонсы событий, община верующих. Присоединяйтесь к нашим служениям!'
    }
  ],
  link: [
    { rel: 'canonical', href: 'https://wotnt.ru' }
  ]
}))
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

.events-section {
  overflow: hidden;
}

.events-container {
  width: 100%;
  margin: 0 auto;
}

@media (max-width: 768px) {
  .events-container {
    width: 100vw;
    margin-left: calc(-50vw + 50%);
    margin-right: calc(-50vw + 50%);
  }
  
  .events-container :deep(.carousel-container) {
    padding-left: 0;
    padding-right: 0;
  }
  
  .events-container :deep(.swiper-slide) {
    width: 85% !important;
    margin-right: 16px;
  }
  
  .events-container :deep(.swiper-slide:first-child) {
    margin-left: 16px;
  }
  
  .events-container :deep(.swiper-slide:last-child) {
    margin-right: 16px;
  }
}

@media (min-width: 769px) and (max-width: 1024px) {
  .events-container {
    width: 100vw;
    margin-left: calc(-50vw + 50%);
    margin-right: calc(-50vw + 50%);
  }
  
  .events-container :deep(.carousel-container) {
    max-width: 90%;
    margin: 0 auto;
  }
}
</style>