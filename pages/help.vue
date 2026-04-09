<template>
  <div class="min-h-screen bg-gradient-to-br from-blue-900 to-purple-900 py-12">
    <div class="container mx-auto px-4">
      <!-- Заголовок -->
      <h1 class="text-4xl md:text-5xl font-bold text-white text-center mb-4">
        Помощь и поддержка
      </h1>
      <p class="text-white/70 text-center text-lg mb-12 max-w-2xl mx-auto">
        Ответы на частые вопросы, контакты служителей и помощь в использовании сайта
      </p>

      <!-- Сетка разделов -->
      <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
        <!-- Карточка: Как найти проповедь -->
        <div class="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 hover:bg-white/15 transition-all">
          <div class="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center mb-4">
            <svg class="w-6 h-6 text-blue-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
          </div>
          <h3 class="text-xl font-semibold text-white mb-3">Как найти проповедь?</h3>
          <p class="text-white/70 text-sm mb-4">
            Перейдите в раздел <a href="/sermons" class="text-blue-300 hover:underline">Проповеди</a>. 
            Используйте поиск по названию, фильтры по спикерам, годам и мероприятиям. 
            Каждая проповедь доступна в аудио, видео и текстовом формате.
          </p>
        </div>

        <!-- Карточка: Вопросы о сайте -->
        <div class="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 hover:bg-white/15 transition-all">
          <div class="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center mb-4">
            <svg class="w-6 h-6 text-blue-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 class="text-xl font-semibold text-white mb-3">Частые вопросы</h3>
            <ul class="text-white/70 text-sm space-y-2">
                <li>• <strong>Как скачать проповедь?</strong><br>Доступны для скачивания аудио- и текстовый формат проповеди.</li>
                <li>• <strong>Где найти расписание служений?</strong><br>Расписание служений вы можете найти в календаре событий. Основное служение проходит по воскресеньям в 11:00.</li>
                <li>• <strong>Не работает видео или аудио — что делать?</strong><br>Пожалуйста, напишите нам через раздел «Контакты». Специалисты проверят корректность работы видео и аудио.</li>
            </ul>
          <p class="text-white/50 text-xs mt-3 italic">Ответы на эти вопросы вы можете найти на странице <a href="/contacts" class="text-blue-300 hover:underline">Контакты</a> или связавшись со служителями</p>
        </div>

        <!-- Карточка: Связаться со служителями -->
        <div class="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 hover:bg-white/15 transition-all">
          <div class="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center mb-4">
            <svg class="w-6 h-6 text-blue-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <h3 class="text-xl font-semibold text-white mb-3">Написать служителям</h3>
          <p class="text-white/70 text-sm mb-4">
            Если у вас есть духовный вопрос, нужна молитвенная поддержка или вы хотите больше узнать о церкви — напишите нам.
          </p>
          <a href="/contacts" class="inline-flex items-center text-blue-300 hover:text-blue-200 text-sm font-medium">
            Перейти в контакты
            <svg class="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
            </svg>
          </a>
        </div>

        <!-- Карточка: Расписание и события -->
        <div class="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 hover:bg-white/15 transition-all">
          <div class="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center mb-4">
            <svg class="w-6 h-6 text-blue-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <h3 class="text-xl font-semibold text-white mb-3">Расписание и события</h3>
          <p class="text-white/70 text-sm mb-2">Воскресное служение: каждое воскресенье в 11:00</p>
          <p class="text-white/70 text-sm mb-2">Молитвенная встреча: среда в 18:30</p>
          <a href="/events" class="inline-flex items-center text-blue-300 hover:text-blue-200 text-sm font-medium mt-3">
            Все события
            <svg class="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
            </svg>
          </a>
        </div>

        <!-- Карточка: Поддержка и молитва -->
        <div class="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 hover:bg-white/15 transition-all">
          <div class="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center mb-4">
            <svg class="w-6 h-6 text-blue-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          </div>
          <h3 class="text-xl font-semibold text-white mb-3">Молитвенная поддержка</h3>
          <p class="text-white/70 text-sm mb-4">
            Если вам нужна молитва, оставьте заявку — наши служители помолятся с вами и за вас.
          </p>
          <a href="/contacts" class="inline-flex items-center text-blue-300 hover:text-blue-200 text-sm font-medium">
            Оставить заявку
            <svg class="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
            </svg>
          </a>
        </div>

        <!-- Карточка: Технические вопросы -->
        <div class="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 hover:bg-white/15 transition-all">
          <div class="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center mb-4">
            <svg class="w-6 h-6 text-blue-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
          <h3 class="text-xl font-semibold text-white mb-3">Проблемы с сайтом?</h3>
          <p class="text-white/70 text-sm mb-4">
            Если видео не загружается, пропал звук или возникла другая техническая сложность — сообщите нам.
          </p>
          <a href="/contacts" class="inline-flex items-center text-blue-300 hover:text-blue-200 text-sm font-medium">
            Сообщить о проблеме
            <svg class="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
            </svg>
          </a>
        </div>
      </div>

      <!-- Блок контактов и соцсетей -->
      <div class="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20 text-center max-w-2xl mx-auto">
        <h2 class="text-2xl font-bold text-white mb-4">Не нашли ответа?</h2>
        <p class="text-white/70 mb-6">
          Свяжитесь с нами любым удобным способом — мы обязательно ответим
        </p>
        <div class="flex flex-wrap justify-center gap-4 mb-6">
          <a href="https://vk.com/truechurch" target="_blank" rel="noopener noreferrer" class="bg-white/5 hover:bg-white/10 p-3 rounded-full transition-colors">
            <svg class="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M15.07 13.79c.91-.49 1.86-1.5 2.11-2.62.08-.36-.06-.55-.3-.66-.62-.27-1.74-.65-2.22-.65-.48 0-.77.29-.89.61-.35 1.02-.85 1.83-1.41 2.4-.38.39-.69.48-.99.37-.34-.12-.54-.41-.54-1.2v-2.5c0-1.05-.27-1.44-1.13-1.62-.27-.06-.54-.09-.84-.09-.82 0-1.53.24-1.99.66-.44.4-.69.96-.69 1.4 0 .29.06.56.18.8.08.17.18.33.3.48.12.15.23.28.33.4.11.13.2.25.27.37.13.22.2.47.2.75 0 .52-.26.97-.67 1.26-.34.25-.77.39-1.26.39-.48 0-.91-.2-1.2-.56-.42-.52-.64-1.23-.64-2.06 0-1.49.56-2.99 1.58-4.01.98-.98 2.38-1.54 4.02-1.54.95 0 1.86.16 2.71.48.7.26 1.33.65 1.85 1.12.52.47.92 1.04 1.19 1.68.24.57.36 1.18.36 1.8v2.41c0 .23.06.4.18.51.12.11.28.14.44.08.26-.09.7-.45 1.23-1.12.53-.67.93-1.51 1.17-2.45.09-.35.02-.55-.2-.71-.54-.4-1.32-.97-1.32-.97s-.02-.01-.03-.02c-.34-.26-.48-.68-.37-1.08.08-.3.3-.55.58-.7.27-.15.59-.2.9-.14.48.09.95.34 1.34.69.58.52.96 1.14 1.14 1.87.18.73.12 1.5-.18 2.23-.3.73-.79 1.41-1.42 1.98-.37.33-.78.61-1.22.84-.18.09-.27.24-.24.44.02.19.14.33.31.39.31.11.74.26 1.1.39.35.13.72.28 1.05.46.34.18.63.42.87.7.24.28.43.61.55.98.07.22.1.45.1.68 0 .54-.18 1.02-.49 1.41-.31.39-.73.69-1.22.88-.49.19-1.04.29-1.62.29-1.42 0-2.65-.51-3.57-1.32-.24-.21-.45-.45-.63-.71-.1-.14-.18-.29-.24-.44-.06-.15-.09-.31-.09-.48 0-.25.06-.5.16-.72.08-.18.19-.35.32-.5.13-.15.28-.28.44-.38.16-.1.34-.17.52-.2.1-.02.2-.02.3-.01.1.01.2.04.29.09.08.05.15.11.21.19.05.08.09.17.1.26.01.09.01.19-.02.28-.05.18-.13.34-.24.47-.11.13-.25.24-.4.31-.06.03-.11.05-.16.07-.05.02-.09.03-.12.04-.05.02-.09.03-.12.04h-.01c-.03.01-.05.02-.06.02-.06.02-.1.04-.12.05-.04.02-.07.03-.08.03z" />
            </svg>
          </a>
        </div>
        <div class="text-white/70 text-sm space-y-1">
          <p>✉️ <a href="mailto:admin@gospelnt.ru" class="hover:text-white">admin@gospelnt.ru</a></p>
          <p>📞 <a href="tel:+7(3435)XXXXXX" class="hover:text-white">+7 (3435) XX-XX-XX</a></p>
          <p>📍 Нижний Тагил, ул. Чехова, 10</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
// Страница помощи
</script>

<style scoped>
/* Дополнительные стили при необходимости */
</style>