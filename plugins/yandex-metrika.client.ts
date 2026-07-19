// plugins/yandex-metrika.client.ts
export default defineNuxtPlugin({
  name: 'yandex-metrika',
  enforce: 'post',
  
  setup() {
    if (process.client) {
      // Откладываем загрузку на 3 секунды после загрузки страницы
      if (document.readyState === 'complete') {
        setTimeout(loadMetrika, 3000);
      } else {
        window.addEventListener('load', () => {
          setTimeout(loadMetrika, 3000);
        });
      }
    }
  }
})

function loadMetrika() {
  const script = document.createElement('script');
  script.src = 'https://mc.yandex.ru/metrika/tag.js';
  script.async = true;
  script.defer = true;
  script.onload = () => {
    if (window.ym) {
      window.ym(95320948, 'init', {
        clickmap: true,
        referrer: document.referrer,
        url: location.href,
        accurateTrackBounce: true,
        trackLinks: true,
        webvisor: false // отключаем для ускорения
      });
    }
  };
  document.head.appendChild(script);
}