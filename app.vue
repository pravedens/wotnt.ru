<template>
  <div>
    <NuxtLayout name="default">
      <NuxtPage />
    </NuxtLayout>
    <noscript>
      <div>
        <img src="https://mc.yandex.ru/watch/95320948" style="position:absolute; left:-9999px;" alt="" />
      </div>
    </noscript>
    <noscript>
      <iframe 
        src="https://www.googletagmanager.com/ns.html?id=G-46QQ5SPH5V"
        height="0" 
        width="0" 
        style="display:none;visibility:hidden"
      ></iframe>
    </noscript>
    <NotificationContainer />
  </div>
</template>

<script setup>
import NotificationContainer from '~/components/NotificationContainer.vue'
import { useAuthStore } from '~/stores/auth' // Добавьте этот импорт

useHead({
  title: 'Церковь Слово Истины',
  meta: [
    { name: 'description', content: 'Проповеди и события церкви Слово Истины' },
    { property: 'og:title', content: 'Церковь Слово Истины' },
    { property: 'og:description', content: 'Проповеди и события церкви Слово Истины' },
    { property: 'og:image', content: 'https://storage.yandexcloud.net/wotgospel-media/og-images/default-og-image.png' },
    { property: 'og:type', content: 'website' },
    { property: 'vk:title', content: 'Церковь Слово Истины' },
    { property: 'vk:description', content: 'Проповеди и события церкви Слово Истины' },
    { property: 'vk:image', content: 'https://storage.yandexcloud.net/wotgospel-media/og-images/default-og-image.png' },
  ]
})

onMounted(() => {
  // Проверяем валидность токена при загрузке
  const checkAuth = async () => {
    const authStore = useAuthStore() // Получаем store внутри функции
    
    if (authStore.token) {
      try {
        await authStore.fetchUser()
      } catch {
        await authStore.logout()
      }
    }
  }
  
  checkAuth()
})
</script>