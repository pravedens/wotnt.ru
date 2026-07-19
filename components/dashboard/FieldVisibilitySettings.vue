<template>
  <div class="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 mb-8">
    <h3 class="text-xl font-bold text-white mb-4">👁️ Настройки видимости карточки</h3>
    <p class="text-white/60 text-sm mb-4">
      Отметьте, какие данные будут видны в вашей публичной карточке служителя
    </p>

    <!-- ⚠️ Блокировка, если нет категорий -->
    <div v-if="!hasCategories && !loading" class="mb-4 p-3 bg-yellow-500/20 border border-yellow-500/50 rounded-lg">
      <p class="text-yellow-200 text-sm flex items-center gap-2">
        <span>⚠️</span>
        <span>Настройки видимости будут применяться только после того, как вы выберете хотя бы одну <strong>категорию служения</strong>. <NuxtLink to="/dashboard" class="text-yellow-300 underline">Перейти к категориям</NuxtLink></span>
      </p>
    </div>

    <div v-if="loading" class="text-center py-8">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto"></div>
      <p class="text-white/60 mt-2">Загрузка...</p>
    </div>

    <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
      <label 
        v-for="(visible, field) in visibilities" 
        :key="field" 
        class="flex items-center gap-3 p-3 rounded-lg transition"
        :class="hasCategories ? 'bg-white/5 cursor-pointer hover:bg-white/10' : 'bg-white/5 opacity-50 cursor-not-allowed'"
      >
        <input 
          type="checkbox" 
          v-model="visibilities[field]" 
          :disabled="!hasCategories"
          class="w-4 h-4 rounded border-white/20 text-blue-500 focus:ring-blue-500 disabled:opacity-50"
        />
        <span class="text-white">{{ fieldLabels[field] || field }}</span>
      </label>
    </div>

    <div class="flex justify-between items-center mt-6">
      <button 
        v-if="hasCategories"
        @click="resetToDefault"
        class="px-4 py-2 bg-yellow-500/20 text-yellow-300 rounded-lg hover:bg-yellow-500/30 transition"
      >
        🔄 Сбросить к стандартным
      </button>
      <div></div>
      <button 
        @click="saveVisibilities" 
        :disabled="saving || !hasCategories"
        class="px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition disabled:opacity-50"
      >
        {{ saving ? 'Сохранение...' : 'Сохранить настройки' }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useMinister } from '~/composables/useMinister'
import { useNotificationStore } from '~/stores/notification'

const { getFieldVisibilities, updateFieldVisibilities, getMyCategories } = useMinister()
const notificationStore = useNotificationStore()

const visibilities = ref<Record<string, boolean>>({})
const loading = ref(true)
const saving = ref(false)
const hasCategories = ref(false)

const fieldLabels: Record<string, string> = {
  name: 'Имя', last_name: 'Фамилия', middle_name: 'Отчество', phone: 'Телефон',
  city: 'Город', church_name: 'Церковь', about: 'О себе', birth_date: 'Дата рождения',
  email: 'Email', avatar: 'Аватар',
}

// Значения по умолчанию
const defaultVisibilities = {
  name: true,
  last_name: false,
  middle_name: false,
  phone: false,
  city: true,
  church_name: true,
  about: true,
  birth_date: false,
  email: false,
  avatar: true,
}

const checkHasCategories = async () => {
  try {
    const myData = await getMyCategories()
    hasCategories.value = (myData.selected_categories || []).length > 0
  } catch (error) {
    console.error('Failed to check categories:', error)
    hasCategories.value = false
  }
}

const loadVisibilities = async () => {
  loading.value = true
  try {
    await checkHasCategories()
    const data = await getFieldVisibilities()
    visibilities.value = data
  } catch {
    visibilities.value = { ...defaultVisibilities }
  } finally {
    loading.value = false
  }
}

const resetToDefault = async () => {
  if (confirm('Сбросить все настройки видимости к стандартным?')) {
    visibilities.value = { ...defaultVisibilities }
    await saveVisibilities()
    notificationStore.info('Сброшено', 'Настройки видимости сброшены к стандартным')
  }
}

const saveVisibilities = async () => {
  if (!hasCategories.value) {
    notificationStore.warning('Внимание', 'Сначала выберите категории служения')
    return
  }
  
  saving.value = true
  try {
    await updateFieldVisibilities(visibilities.value)
    notificationStore.success('Успешно', 'Настройки видимости обновлены')
  } catch {
    notificationStore.error('Ошибка', 'Не удалось сохранить настройки')
  } finally {
    saving.value = false
  }
}

onMounted(() => loadVisibilities())
</script>