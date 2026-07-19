<template>
  <div class="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 mb-8">
    <h3 class="text-xl font-bold text-white mb-4">🔗 Социальные сети</h3>
    <p class="text-white/60 text-sm mb-6">
      Укажите ссылки на ваши профили. Они будут отображаться в публичной карточке служителя.
    </p>

    <div v-if="loading" class="text-center py-8">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto"></div>
      <p class="text-white/60 mt-2">Загрузка...</p>
    </div>

    <div v-else>
      <!-- Фиксированные соцсети -->
      <div class="space-y-4 mb-8">
        <h4 class="text-white font-semibold border-b border-white/20 pb-2">Основные соцсети</h4>

        <div class="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
          <div class="w-32 flex items-center gap-2">
            <span class="text-xl">⭐</span>
            <span class="text-white font-medium">Max:</span>
          </div>
          <input v-model="fixedLinks.max" type="url" placeholder="https://max.me/username" class="flex-1 w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-blue-400 transition" />
        </div>

        <div class="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
          <div class="w-32 flex items-center gap-2">
            <span class="text-xl">📘</span>
            <span class="text-white font-medium">ВК:</span>
          </div>
          <input v-model="fixedLinks.vk" type="url" placeholder="https://vk.com/username" class="flex-1 w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-blue-400 transition" />
        </div>

        <div class="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
          <div class="w-32 flex items-center gap-2">
            <span class="text-xl">🎵</span>
            <span class="text-white font-medium">ОК:</span>
          </div>
          <input v-model="fixedLinks.ok" type="url" placeholder="https://ok.ru/profile/..." class="flex-1 w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-blue-400 transition" />
        </div>
      </div>

      <!-- Дополнительные соцсети -->
      <div class="mb-8">
        <h4 class="text-white font-semibold border-b border-white/20 pb-2 mb-4">➕ Дополнительные соцсети</h4>

        <div v-if="customLinks.length === 0" class="text-center text-white/40 py-4">
          Нет дополнительных соцсетей. Нажмите «Добавить», чтобы указать ссылку.
        </div>

        <div v-for="(link, index) in customLinks" :key="index" class="flex flex-col sm:flex-row gap-3 mb-3 items-start sm:items-center">
          <input v-model="link.platform" type="text" placeholder="Название" class="sm:w-40 w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-blue-400 transition" />
          <input v-model="link.url" type="url" placeholder="https://..." class="flex-1 w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-blue-400 transition" />
          <button @click="removeCustomLink(index)" class="px-4 py-2 bg-red-500/20 text-red-300 rounded-lg hover:bg-red-500/30 transition whitespace-nowrap">🗑️ Удалить</button>
        </div>

        <button @click="addCustomLink" class="mt-3 px-4 py-2 bg-blue-500/20 text-blue-300 rounded-lg hover:bg-blue-500/30 transition text-sm flex items-center gap-2">
          <span>+</span> Добавить соцсеть
        </button>
      </div>

      <div class="flex justify-end pt-4 border-t border-white/20">
        <button @click="saveAllLinks" :disabled="saving" class="px-8 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition disabled:opacity-50 flex items-center gap-2">
          <span v-if="saving" class="animate-spin">⏳</span>
          <span>{{ saving ? 'Сохранение...' : '💾 Сохранить все соцсети' }}</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useMinister } from '~/composables/useMinister'
import { useNotificationStore } from '~/stores/notification'

const { getSocialLinks, updateSocialLinks } = useMinister()
const notificationStore = useNotificationStore()

const fixedLinks = ref({ max: '', vk: '', ok: '' })
const customLinks = ref<{ platform: string; url: string }[]>([])
const saving = ref(false)
const loading = ref(true)

const loadLinks = async () => {
  loading.value = true
  try {
    const links = await getSocialLinks()
    fixedLinks.value = {
      max: links.find((l: any) => l.platform === 'max')?.url || '',
      vk: links.find((l: any) => l.platform === 'vk')?.url || '',
      ok: links.find((l: any) => l.platform === 'ok')?.url || '',
    }
    customLinks.value = links.filter((l: any) => !['max', 'vk', 'ok'].includes(l.platform))
  } finally {
    loading.value = false
  }
}

const addCustomLink = () => customLinks.value.push({ platform: '', url: '' })
const removeCustomLink = (index: number) => customLinks.value.splice(index, 1)

const saveAllLinks = async () => {
  saving.value = true
  const allLinks = []
  if (fixedLinks.value.max?.trim()) allLinks.push({ platform: 'max', url: fixedLinks.value.max.trim(), sort_order: 0 })
  if (fixedLinks.value.vk?.trim()) allLinks.push({ platform: 'vk', url: fixedLinks.value.vk.trim(), sort_order: 1 })
  if (fixedLinks.value.ok?.trim()) allLinks.push({ platform: 'ok', url: fixedLinks.value.ok.trim(), sort_order: 2 })
  customLinks.value.forEach((link, index) => {
    if (link.platform?.trim() && link.url?.trim()) {
      allLinks.push({ platform: link.platform.trim().toLowerCase().replace(/\s/g, '_'), url: link.url.trim(), sort_order: 3 + index })
    }
  })
  try {
    await updateSocialLinks(allLinks)
    notificationStore.success('Успешно', 'Социальные сети сохранены')
  } catch (error: any) {
    notificationStore.error('Ошибка', error?.data?.message || 'Не удалось сохранить')
  } finally {
    saving.value = false
  }
}

onMounted(() => loadLinks())
</script>