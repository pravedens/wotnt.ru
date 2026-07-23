// plugins/yandex-metrika.client.ts
export default defineNuxtPlugin({
  name: 'yandex-metrika',
  enforce: 'post',
  
  setup() {
    if (import.meta.client) {
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
  if (document.querySelector('script[src*="mc.yandex.ru/metrika/tag.js"]')) {
    return
  }

  const script = document.createElement('script');
  script.src = 'https://mc.yandex.ru/metrika/tag.js';
  script.async = true;
  script.defer = true;
  
  script.onload = () => {
    // ✅ Самый простой способ: приведение к any
    const ym = window.ym as any;
    if (ym) {
      ym(95320948, 'init', {
        clickmap: true,
        referrer: document.referrer,
        url: location.href,
        accurateTrackBounce: true,
        trackLinks: true,
        webvisor: false
      });
    }
  };
  
  document.head.appendChild(script);
}