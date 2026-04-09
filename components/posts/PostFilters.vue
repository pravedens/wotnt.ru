<template>
  <div class="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 mb-8">
    <h3 class="text-lg font-semibold text-white mb-4">Фильтры</h3>
    
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
      <!-- Категории (Спикеры) -->
      <div>
        <label class="block text-white/80 mb-2">
          Спикер
          <span v-if="!hasAvailableCategories" class="text-red-300 text-xs ml-2">(нет доступных)</span>
        </label>
        <select 
          v-model="selectedCategory"
          @change="updateFilter('category_id', selectedCategory)"
          class="w-full px-4 py-2 bg-white/20 border border-white/30 rounded-lg text-white focus:outline-none focus:border-blue-400 transition disabled:opacity-50"
          :disabled="!hasAvailableCategories"
        >
          <option :value="null" class="bg-gray-800 text-white">Все спикеры</option>
          <option 
            v-for="category in availableCategories" 
            :key="category.id" 
            :value="category.id"
            class="bg-gray-800 text-white"
          >
            {{ category.title }} ({{ category.posts_count || 0 }})
          </option>
        </select>
        <p v-if="!hasAvailableCategories && selectedCategory" class="text-red-300 text-xs mt-1">
          Нет спикеров для выбранных фильтров
        </p>
      </div>
      
      <!-- Группы (Год) -->
      <div>
        <label class="block text-white/80 mb-2">
          Год
          <span v-if="!hasAvailableGroups" class="text-red-300 text-xs ml-2">(нет доступных)</span>
        </label>
        <select 
          v-model="selectedGroup"
          @change="updateFilter('group_id', selectedGroup)"
          class="w-full px-4 py-2 bg-white/20 border border-white/30 rounded-lg text-white focus:outline-none focus:border-blue-400 transition disabled:opacity-50"
          :disabled="!hasAvailableGroups"
        >
          <option :value="null" class="bg-gray-800 text-white">Все года</option>
          <option 
            v-for="group in availableGroups" 
            :key="group.id" 
            :value="group.id"
            class="bg-gray-800 text-white"
          >
            {{ group.title }} ({{ group.posts_count || 0 }})
          </option>
        </select>
        <p v-if="!hasAvailableGroups && selectedGroup" class="text-red-300 text-xs mt-1">
          Нет годов для выбранных фильтров
        </p>
      </div>
      
      <!-- Конференции (Мероприятия) -->
      <div>
        <label class="block text-white/80 mb-2">
          Мероприятие
          <span v-if="!hasAvailableConferences" class="text-red-300 text-xs ml-2">(нет доступных)</span>
        </label>
        <select 
          v-model="selectedConference"
          @change="updateFilter('conference_id', selectedConference)"
          class="w-full px-4 py-2 bg-white/20 border border-white/30 rounded-lg text-white focus:outline-none focus:border-blue-400 transition disabled:opacity-50"
          :disabled="!hasAvailableConferences"
        >
          <option :value="null" class="bg-gray-800 text-white">Все мероприятия</option>
          <option 
            v-for="conference in availableConferences" 
            :key="conference.id" 
            :value="conference.id"
            class="bg-gray-800 text-white"
          >
            {{ conference.title }} ({{ conference.posts_count || 0 }})
          </option>
        </select>
        <p v-if="!hasAvailableConferences && selectedConference" class="text-red-300 text-xs mt-1">
          Нет мероприятий для выбранных фильтров
        </p>
      </div>
    </div>
    
    <!-- Информация о количестве постов -->
    <div class="mt-4 text-white/60 text-sm">
      Найдено проповедей: {{ totalPosts || 0 }}
    </div>
    
    <!-- Кнопка сброса -->
    <div class="mt-4 flex justify-end">
      <button 
        @click="resetAll"
        class="px-4 py-2 bg-white/20 text-white rounded-lg hover:bg-white/30 transition border border-white/30"
        :disabled="!hasActiveFilters"
      >
        Сбросить все фильтры
      </button>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  categories: {
    type: Array,
    default: () => []
  },
  groups: {
    type: Array,
    default: () => []
  },
  conferences: {
    type: Array,
    default: () => []
  },
  modelValue: {
    type: Object,
    default: () => ({
      category_id: null,
      group_id: null,
      conference_id: null
    })
  },
  totalPosts: {
    type: Number,
    default: 0
  }
})

const emit = defineEmits(['update:modelValue', 'filter-change'])

// Локальные модели для select
const selectedCategory = ref(props.modelValue.category_id)
const selectedGroup = ref(props.modelValue.group_id)
const selectedConference = ref(props.modelValue.conference_id)

// Доступные опции для каждого фильтра
const availableCategories = ref([])
const availableGroups = ref([])
const availableConferences = ref([])

// Вычисляемые свойства для проверки наличия опций
const hasAvailableCategories = computed(() => availableCategories.value.length > 0)
const hasAvailableGroups = computed(() => availableGroups.value.length > 0)
const hasAvailableConferences = computed(() => availableConferences.value.length > 0)

// Проверка, есть ли активные фильтры
const hasActiveFilters = computed(() => {
  return selectedCategory.value || selectedGroup.value || selectedConference.value
})

// Загрузка доступных опций для всех фильтров
const loadAvailableOptions = async () => {
  const params = new URLSearchParams()
  
  // Добавляем все выбранные фильтры, кроме текущего
  if (selectedCategory.value) {
    params.append('category_id', selectedCategory.value)
  }
  if (selectedGroup.value) {
    params.append('group_id', selectedGroup.value)
  }
  if (selectedConference.value) {
    params.append('conference_id', selectedConference.value)
  }

  try {
    // Загружаем доступные категории с учетом фильтров
    const categoriesRes = await $fetch(`/api/filtered-categories?${params.toString()}`)
    availableCategories.value = categoriesRes || []
    
    // Загружаем доступные группы с учетом фильтров
    const groupsRes = await $fetch(`/api/filtered-groups?${params.toString()}`)
    availableGroups.value = groupsRes || []
    
    // Загружаем доступные конференции с учетом фильтров
    const confsRes = await $fetch(`/api/filtered-conferences?${params.toString()}`)
    availableConferences.value = confsRes || []
    
  } catch (err) {
    console.error('Error loading available options:', err)
  }
}

// Обновление фильтра
const updateFilter = async (key, value) => {
  // Обновляем локальное значение
  if (key === 'category_id') selectedCategory.value = value
  if (key === 'group_id') selectedGroup.value = value
  if (key === 'conference_id') selectedConference.value = value
  
  // Загружаем доступные опции
  await loadAvailableOptions()
  
  // Проверяем, есть ли выбранные значения в доступных опциях
  if (selectedGroup.value && !availableGroups.value.some(g => g.id === selectedGroup.value)) {
    selectedGroup.value = null
    emit('filter-change', 'group_id', null)
  }
  if (selectedConference.value && !availableConferences.value.some(c => c.id === selectedConference.value)) {
    selectedConference.value = null
    emit('filter-change', 'conference_id', null)
  }
  
  // Отправляем событие изменения
  emit('filter-change', key, value)
}

// Сброс всех фильтров
const resetAll = async () => {
  selectedCategory.value = null
  selectedGroup.value = null
  selectedConference.value = null
  
  await loadAvailableOptions()
  emit('filter-change', 'reset', null)
}

// Инициализация
onMounted(async () => {
  await loadAvailableOptions()
})

// Следим за изменениями props
watch(() => props.modelValue, async (newVal) => {
  selectedCategory.value = newVal.category_id
  selectedGroup.value = newVal.group_id
  selectedConference.value = newVal.conference_id
  await loadAvailableOptions()
}, { deep: true })
</script>