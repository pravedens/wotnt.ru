// plugins/pwa.client.ts
export default defineNuxtPlugin(() => {
  if (import.meta.client && 'serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/sw.js')
        .then(registration => {
          // ✅ Проверяем обновления каждые 60 минут
          setInterval(() => {
            registration.update();
            //console.log('🔄 Checking for SW updates');
          }, 60 * 60 * 1000);
        })
        .catch(error => {
          console.error('❌ Service Worker registration failed:', error);
        });
    });
  }
});