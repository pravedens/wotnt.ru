<template>
  <div class="bg-white/10 backdrop-blur-lg rounded-2xl overflow-hidden border border-white/20 hover:bg-white/15 transition-all group h-full flex flex-col">
    <div class="p-6 flex flex-col h-full">
      <!-- Аватар -->
      <div class="flex justify-center mb-4">
        <Avatar :src="minister.avatar_url" :name="fullName" size="xl" rounded="lg" :border="true" />
      </div>

      <!-- Имя -->
      <h3 class="text-xl font-bold text-white text-center mb-1">{{ fullName }}</h3>
      
      <!-- Роль -->
      <p class="text-purple-300 text-center text-sm mb-4">
        {{ minister.roles?.includes('pastor') ? 'Пастор' : 'Служитель' }}
      </p>

      <!-- Телефон (только для авторизованных) -->
      <div v-if="isAuthenticated && minister.phone" class="mb-2 text-sm">
        <p class="text-white/60 flex items-center gap-2 justify-center">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/>
          </svg>
          {{ minister.phone }}
        </p>
      </div>

      <!-- Город и церковь -->
      <div class="space-y-1 mb-4 text-sm">
        <p v-if="minister.city" class="text-white/60 flex items-center gap-2 justify-center">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
          </svg>
          {{ minister.city }}
        </p>
        <p v-if="minister.church_name" class="text-white/60 flex items-center gap-2 justify-center">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/>
          </svg>
          {{ minister.church_name }}
        </p>
      </div>

      <!-- Категории -->
      <div v-if="minister.minister_categories?.length" class="flex flex-wrap gap-1 justify-center mb-4">
        <span v-for="cat in minister.minister_categories" :key="cat.id" class="text-xs px-2 py-0.5 rounded-full" :style="{ backgroundColor: cat.color ? `${cat.color}30` : 'rgba(255,255,255,0.1)', color: cat.color || '#fff' }">
          {{ cat.icon }} {{ cat.name }}
        </span>
      </div>

      <!-- Соцсети -->
      <div class="flex flex-wrap gap-2 justify-center mt-auto mb-3">
        <a 
          v-if="getSocialLink('max')"
          :href="getSocialLink('max')"
          target="_blank"
          rel="noopener noreferrer"
          class="text-white/60 hover:text-white transition p-2 rounded-full bg-white/5 hover:bg-white/10"
          title="Max"
        >
          <IconMax :size="30" />
        </a>
        
        <a 
          v-if="getSocialLink('vk')"
          :href="getSocialLink('vk')"
          target="_blank"
          rel="noopener noreferrer"
          class="text-white/60 hover:text-white transition p-2 rounded-full bg-white/5 hover:bg-white/10"
          title="ВКонтакте"
        >
          <IconVk :size="30" />
        </a>
        
        <a 
          v-if="getSocialLink('ok')"
          :href="getSocialLink('ok')"
          target="_blank"
          rel="noopener noreferrer"
          class="text-white/60 hover:text-white transition p-2 rounded-full bg-white/5 hover:bg-white/10"
          title="Одноклассники"
        >
          <IconOk :size="30" />
        </a>
        
        <a 
          v-for="link in otherSocialLinks" 
          :key="link.id"
          :href="link.url"
          target="_blank"
          rel="noopener noreferrer"
          class="text-white/60 hover:text-white transition p-2 rounded-full bg-white/5 hover:bg-white/10 text-xl"
          :title="getPlatformName(link.platform)"
        >
          {{ getPlatformIcon(link.platform) }}
        </a>
      </div>

      <!-- Кнопка "Написать" — прижата к низу -->
      <div class="mt-auto pt-4 border-t border-white/10">
        <button 
          @click="openMessageModal"
          class="w-full py-2 bg-blue-500/20 text-blue-300 rounded-lg hover:bg-blue-500/30 transition flex items-center justify-center gap-2"
        >
          ✉️ Написать
        </button>
      </div>
    </div>
  </div>
  
  <!-- Модальное окно -->
  <WriteMinisterModal 
    :visible="modalVisible" 
    :minister="minister"
    @close="modalVisible = false"
    @sent="modalVisible = false"
  />
</template>

<script setup lang="ts">
import Avatar from '~/components/auth/Avatar.vue'
import IconMax from '~/components/icons/IconMax.vue'
import IconVk from '~/components/icons/IconVk.vue'
import IconOk from '~/components/icons/IconOk.vue'
import WriteMinisterModal from './WriteMinisterModal.vue'
import { useAuthStore } from '~/stores/auth'

const props = defineProps({
  minister: { type: Object, required: true }
})

const authStore = useAuthStore()
const modalVisible = ref(false)

const isAuthenticated = computed(() => authStore.isAuthenticated)

const fullName = computed(() => {
  const parts = []
  if (props.minister.last_name) parts.push(props.minister.last_name)
  if (props.minister.name) parts.push(props.minister.name)
  if (props.minister.middle_name) parts.push(props.minister.middle_name)
  return parts.length ? parts.join(' ') : 'Служитель'
})

const getSocialLink = (platform: string) => {
  return props.minister.social_links?.find(link => link.platform === platform)?.url
}

const otherSocialLinks = computed(() => {
  return props.minister.social_links?.filter(link => 
    !['max', 'vk', 'ok'].includes(link.platform)
  ) || []
})

const getPlatformName = (platform: string) => {
  const names: Record<string, string> = {
    telegram: 'Telegram',
    whatsapp: 'WhatsApp',
    youtube: 'YouTube',
    website: 'Сайт'
  }
  return names[platform] || platform
}

const getPlatformIcon = (platform: string) => {
  const icons: Record<string, string> = {
    telegram: '📱',
    whatsapp: '💬',
    youtube: '📺',
    website: '🌐'
  }
  return icons[platform] || '🔗'
}

const openMessageModal = () => {
  modalVisible.value = true
}
</script>