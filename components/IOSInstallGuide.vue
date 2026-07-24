<template>
  <!-- Баннер показывается только если флаг showBanner === true -->
  <div v-if="showBanner" class="fixed bottom-0 left-0 right-0 z-50 p-4 transform transition-transform duration-300" :class="isVisible ? 'translate-y-0' : 'translate-y-full'">
    <div class="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl shadow-2xl border border-white/20 p-5 max-w-sm mx-auto">
      
      <!-- Кнопка закрыть (крестик) -->
      <button @click="dismissBanner" class="absolute right-3 top-3 text-white/50 hover:text-white">
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
      </button>

      <div class="text-center">
        <!-- Иконка приложения -->
        <div class="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl mx-auto flex items-center justify-center shadow-lg mb-3">
           <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"></path></svg>
        </div>
        
        <h3 class="text-white font-bold text-lg mb-1">Установить приложение</h3>
        <p class="text-white/60 text-sm mb-4">Откройте меню <span class="inline-flex items-center justify-center w-7 h-7 bg-white/10 rounded-lg">Share</span> и нажмите <span class="font-semibold text-white">«На экран «Домой»</span></p>
        
        <!-- Визуальная подсказка (схема из двух шагов) -->
        <div class="flex items-center justify-around bg-white/5 rounded-xl p-3 mb-4">
          <div class="text-center">
            <div class="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-1">
              <svg class="w-5 h-5 text-white/80" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"></path></svg>
            </div>
            <span class="text-white/80 text-xs">Кнопка «Поделиться»</span>
          </div>
          <svg class="w-5 h-5 text-white/40" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 5l7 7-7 7M5 5l7 7-7 7"></path></svg>
          <div class="text-center">
            <div class="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-1">
              <svg class="w-5 h-5 text-white/80" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12h2m12 0h2M5 5l2 2m10 0l2-2M5 19l2-2m10 0l2 2m-7-8a1 1 0 10-2 0 1 1 0 002 0zM9 12h6"></path></svg>
            </div>
            <span class="text-white/80 text-xs">«На экран «Домой»</span>
          </div>
        </div>
        
        <!-- Кнопка "Понятно" -->
        <button @click="dismissBanner" class="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition">Хорошо, спасибо</button>
        <p class="text-white/30 text-[10px] mt-2">*Инструкция покажется только один раз</p>
      </div>
    </div>
  </div>
</template>

<script setup>
const showBanner = ref(false);
const isVisible = ref(false);

// Функция для закрытия баннера (с сохранением в localStorage)
const dismissBanner = () => {
  isVisible.value = false;
  // Сохраняем метку времени, чтобы не показывать следующие 30 дней
  localStorage.setItem('pwa_ios_installed', Date.now().toString());
  setTimeout(() => {
    showBanner.value = false;
  }, 300);
};

// Логика определения: iOS + Safari + не установлено + прошло >30 дней
const checkAndShowBanner = () => {
  if (import.meta.client) {
    // 1. Проверка: это iOS или iPadOS?
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) ||
                  (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
    
    // 2. Проверка: установлено ли уже как приложение?
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches ||
                         ('standalone' in navigator && navigator.standalone === true);
    
    // 3. Проверка: не закрывали ли мы его недавно (за последние 30 дней)
    const lastDismiss = localStorage.getItem('pwa_ios_installed');
    const shouldShow = !lastDismiss || (Date.now() - Number(lastDismiss)) > 30 * 24 * 60 * 60 * 1000;

    if (isIOS && !isStandalone && shouldShow) {
      // Показываем баннер с небольшой задержкой, чтобы не бросаться в глаза сразу
      setTimeout(() => {
        showBanner.value = true;
        setTimeout(() => { isVisible.value = true; }, 50);
      }, 1500);
    }
  }
};

// Запускаем проверку при монтировании компонента
onMounted(() => {
  checkAndShowBanner();
});
</script>