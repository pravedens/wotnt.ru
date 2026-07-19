<template>
  <footer class="bg-gradient-to-r from-blue-900 to-purple-900 text-white border-t border-white/10">
    <div class="container mx-auto px-4 py-12">
      <!-- Три колонки -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
        
        <!-- Левая колонка: Логотип и информация об организации -->
        <div class="space-y-4 text-center md:text-left">
          <div class="flex items-center gap-3 justify-center md:justify-start">
            <!-- Логотип -->
            <div class="w-12 h-12 bg-gradient-to-br from-blue-400 to-purple-400 rounded-lg flex items-center justify-center overflow-hidden">
                <img src="/icons/logo.png" alt="Слово Истины" class="w-8 h-8 object-contain">
            </div>
            <div>
              <h3 class="text-xl font-bold">Слово Истины</h3>
              <p class="text-white/60 text-sm">Церковь ХВЕ</p>
            </div>
          </div>
          
          <div class="space-y-2 text-white/80 text-sm">
            
            <div class="mt-4 space-y-1">
              <p class="flex items-start gap-2 justify-center md:justify-start">
                <svg class="w-4 h-4 mt-1 flex-shrink-0 text-blue-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span>Юридический адрес: г. Нижний Тагил, ул. Чехова, 10</span>
              </p>
              <p class="flex items-start gap-2 justify-center md:justify-start">
                <svg class="w-4 h-4 mt-1 flex-shrink-0 text-blue-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <span>ОГРН: 1096600001794</span>
              </p>
              <p class="flex items-start gap-2 justify-center md:justify-start">
                <svg class="w-4 h-4 mt-1 flex-shrink-0 text-blue-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <span>ИНН: 6623060094</span>
              </p>
            </div>
          </div>
        </div>
        
        <!-- Средняя колонка: Ссылки на разделы -->
        <div class="text-center md:text-left">
          <h3 class="text-lg font-semibold text-white mb-4 pb-2 border-b border-white/20 inline-block">Разделы</h3>
          <ul class="space-y-2">
            <li>
              <NuxtLink to="/" class="text-white/70 hover:text-white transition flex items-center gap-2 justify-center md:justify-start group">
                <span class="w-1 h-1 bg-blue-400 rounded-full group-hover:w-2 transition-all"></span>
                Главная
              </NuxtLink>
            </li>
            <li>
              <NuxtLink to="/events" class="text-white/70 hover:text-white transition flex items-center gap-2 justify-center md:justify-start group">
                <span class="w-1 h-1 bg-blue-400 rounded-full group-hover:w-2 transition-all"></span>
                События
              </NuxtLink>
            </li>
            <li>
              <NuxtLink to="/sermons" class="text-white/70 hover:text-white transition flex items-center gap-2 justify-center md:justify-start group">
                <span class="w-1 h-1 bg-blue-400 rounded-full group-hover:w-2 transition-all"></span>
                Проповеди
              </NuxtLink>
            </li>
            <li>
              <NuxtLink to="/about" class="text-white/70 hover:text-white transition flex items-center gap-2 justify-center md:justify-start group">
                <span class="w-1 h-1 bg-blue-400 rounded-full group-hover:w-2 transition-all"></span>
                О церкви
              </NuxtLink>
            </li>
            <li>
              <NuxtLink to="/contacts" class="text-white/70 hover:text-white transition flex items-center gap-2 justify-center md:justify-start group">
                <span class="w-1 h-1 bg-blue-400 rounded-full group-hover:w-2 transition-all"></span>
                Контакты
              </NuxtLink>
            </li>
            <li>
              <NuxtLink to="/ministers" class="text-white/70 hover:text-white transition flex items-center gap-2 justify-center md:justify-start group">
                <span class="w-1 h-1 bg-blue-400 rounded-full group-hover:w-2 transition-all"></span>
                Служители
              </NuxtLink>
            </li>
            <li>
              <NuxtLink to="/bible-school" class="text-white/70 hover:text-white transition flex items-center gap-2 justify-center md:justify-start group">
                <span class="w-1 h-1 bg-blue-400 rounded-full group-hover:w-2 transition-all"></span>
                Ученичество
              </NuxtLink>
            </li>
          </ul>
        </div>
        
        <!-- Правая колонка: Полезные ссылки -->
        <div class="text-center md:text-left">
          <h3 class="text-lg font-semibold text-white mb-4 pb-2 border-b border-white/20 inline-block">Полезное</h3>
          <ul class="space-y-2">
            <li>
              <NuxtLink to="/privacy" class="text-white/70 hover:text-white transition flex items-center gap-2 justify-center md:justify-start group">
                <span class="w-1 h-1 bg-purple-400 rounded-full group-hover:w-2 transition-all"></span>
                Политика конфиденциальности
              </NuxtLink>
            </li>
            <li>
              <NuxtLink to="/terms" class="text-white/70 hover:text-white transition flex items-center gap-2 justify-center md:justify-start group">
                <span class="w-1 h-1 bg-purple-400 rounded-full group-hover:w-2 transition-all"></span>
                Пользовательское соглашение
              </NuxtLink>
            </li>
            <li>
              <a href="https://storage.yandexcloud.net/wotgospel-media/og-images/Dogovor_oferty.JPG" target="_blank" rel="noopener noreferrer" class="text-white/70 hover:text-white transition flex items-center gap-2 justify-center md:justify-start group">
                <span class="w-1 h-1 bg-purple-400 rounded-full group-hover:w-2 transition-all"></span>
                Публичная оферта
              </a>
            </li>
            <li>
              <a href="#" class="text-white/70 hover:text-white transition flex items-center gap-2 justify-center md:justify-start group">
                <span class="w-1 h-1 bg-purple-400 rounded-full group-hover:w-2 transition-all"></span>
                Пожертвования
              </a>
            </li>
            <li>
              <NuxtLink to="/help" class="text-white/70 hover:text-white transition flex items-center gap-2 justify-center md:justify-start group">
                <span class="w-1 h-1 bg-purple-400 rounded-full group-hover:w-2 transition-all"></span>
                Помощь
              </NuxtLink>
            </li>
            <li>
              <NuxtLink to="/dashboard" class="text-white/70 hover:text-white transition flex items-center gap-2 justify-center md:justify-start group">
                <span class="w-1 h-1 bg-purple-400 rounded-full group-hover:w-2 transition-all"></span>
                Личный кабинет
              </NuxtLink>
            </li>
          </ul>
        </div>
      </div>
      
      <!-- НИЖНЯЯ ЧАСТЬ - ПОЛНОСТЬЮ ПО ЦЕНТРУ -->
      <div class="pt-6 border-t border-white/10 text-center">
        <!-- Первая строка - копирайт -->
        <div class="text-white/60 text-sm mb-2">
          © {{ currentYear }} Местная религиозная организация Церковь Христиан Веры Евангельской (пятидесятников) "СЛОВО ИСТИНЫ" г.Нижнего Тагила.
        </div>
        <!-- Вторая строка - Все права защищены -->
        <div class="text-white/40 text-xs">
          Все права защищены
        </div>
      </div>
    </div>
  </footer>
</template>

<script setup>
const currentYear = new Date().getFullYear()
</script>