<template>
  <div class="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 mb-8">
    <h3 class="text-xl font-bold text-white mb-4">🏷️ Категории служения</h3>
    
    <!-- ⚠️ Предупреждение если не выбрано ни одной категории -->
    <div v-if="!loading && selectedCategoryIds.length === 0" class="mb-4 p-3 bg-yellow-500/20 border border-yellow-500/50 rounded-lg">
      <p class="text-yellow-200 text-sm flex items-center gap-2">
        <span>⚠️</span>
        <span>Вы не выбрали ни одной категории. Ваша карточка <strong>не будет отображаться</strong> на публичной странице служителей, пока вы не выберете хотя бы одну категорию.</span>
      </p>
    </div>
    
    <!-- ✅ Успех если выбраны категории -->
    <div v-if="!loading && selectedCategoryIds.length > 0" class="mb-4 p-3 bg-green-500/20 border border-green-500/50 rounded-lg">
      <p class="text-green-200 text-sm flex items-center gap-2">
        <span>✅</span>
        <span>Вы выбрали {{ selectedCategoryIds.length }} {{ getCategoryWord(selectedCategoryIds.length) }}. Ваша карточка отображается на публичной странице.</span>
      </p>
    </div>
    
    <p class="text-white/60 text-sm mb-4">
      Выберите категории, к которым вы относитесь (можно выбрать несколько)
    </p>

    <div v-if="loading" class="text-center py-8">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto"></div>
      <p class="text-white/60 mt-2">Загрузка...</p>
    </div>

    <div v-else class="flex flex-wrap gap-3">
      <button
        v-for="category in allCategories"
        :key="category.id"
        @click="toggleCategory(category.id)"
        class="px-4 py-2 rounded-full transition-all flex items-center gap-2"
        :class="isSelected(category.id) ? 'bg-blue-500 text-white shadow-lg' : 'bg-white/10 text-white/70 hover:bg-white/20'"
      >
        <span>{{ category.icon }}</span>
        <span>{{ category.name }}</span>
      </button>
    </div>

    <div class="flex justify-end mt-6">
      <button 
        @click="saveCategories" 
        :disabled="saving" 
        class="px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition disabled:opacity-50"
      >
        {{ saving ? 'Сохранение...' : 'Сохранить категории' }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useAuthStore } from '~/stores/auth'
import { useMinister } from '~/composables/useMinister'
import { useNotificationStore } from '~/stores/notification'

const authStore = useAuthStore()
const { getAllCategories, getMyCategories, updateMyCategories } = useMinister()
const notificationStore = useNotificationStore()

const allCategories = ref<any[]>([])
const selectedCategoryIds = ref<number[]>([])
const loading = ref(true)
const saving = ref(false)

// Склонение слова "категория"
const getCategoryWord = (count: number): string => {
  if (count % 10 === 1 && count % 100 !== 11) return 'категорию'
  if ([2, 3, 4].includes(count % 10) && ![12, 13, 14].includes(count % 100)) return 'категории'
  return 'категорий'
}

const loadData = async () => {
  // ✅ Проверка авторизации
  if (!authStore.isAuthenticated) {
    console.log('MinisterCategoriesManager: user not authenticated, skipping')
    loading.value = false
    return
  }
  
  loading.value = true
  try {
    const [categories, myData] = await Promise.all([getAllCategories(), getMyCategories()])
    allCategories.value = categories
    selectedCategoryIds.value = myData.selected_categories || []
  } catch (error) {
    console.error('Failed to load categories:', error)
  } finally {
    loading.value = false
  }
}

const isSelected = (id: number) => selectedCategoryIds.value.includes(id)

const toggleCategory = (id: number) => {
  if (isSelected(id)) {
    selectedCategoryIds.value = selectedCategoryIds.value.filter(i => i !== id)
  } else {
    selectedCategoryIds.value.push(id)
  }
}

const saveCategories = async () => {
  // ✅ Проверка авторизации
  if (!authStore.isAuthenticated) {
    notificationStore.error('Ошибка', 'Необходимо авторизоваться')
    return
  }
  
  saving.value = true
  try {
    await updateMyCategories(selectedCategoryIds.value)
    
    // Показываем разное сообщение в зависимости от выбора
    if (selectedCategoryIds.value.length === 0) {
      notificationStore.warning('Внимание', 'Вы не выбрали ни одной категории. Ваша карточка скрыта с публичной страницы.')
    } else {
      notificationStore.success('Успешно', `Выбрано ${selectedCategoryIds.value.length} ${getCategoryWord(selectedCategoryIds.value.length)}. Карточка будет отображаться.`)
    }
  } catch {
    notificationStore.error('Ошибка', 'Не удалось сохранить категории')
  } finally {
    saving.value = false
  }
}

onMounted(() => loadData())
</script>