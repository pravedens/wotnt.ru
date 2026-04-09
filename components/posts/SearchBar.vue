<template>
  <div class="relative">
    <input
      v-model="searchQuery"
      type="text"
      :placeholder="placeholder"
      class="w-full px-4 py-3 pl-12 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:border-blue-400 transition"
      @keyup.enter="handleSearch"
    />
    
    <!-- Иконка поиска -->
    <svg 
      class="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/50"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
    </svg>
    
    <!-- Индикатор минимальной длины -->
    <div 
      v-if="searchQuery && searchQuery.length < minChars"
      class="absolute right-4 top-1/2 transform -translate-y-1/2 text-yellow-400/70 text-sm"
    >
      еще {{ minChars - searchQuery.length }}
    </div>
    
    <!-- Кнопка очистки -->
    <button
      v-if="searchQuery && searchQuery.length >= minChars"
      @click="clearSearch"
      class="absolute right-4 top-1/2 transform -translate-y-1/2 text-white/50 hover:text-white transition"
    >
      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
      </svg>
    </button>
  </div>
  
  <!-- Подсказка -->
  <div v-if="searchQuery && searchQuery.length < minChars" class="text-white/40 text-xs mt-1 text-right">
    введите не менее {{ minChars }} символов для поиска
  </div>
</template>

<script setup>
const props = defineProps({
  modelValue: {
    type: String,
    default: ''
  },
  minChars: {
    type: Number,
    default: 3
  },
  placeholder: {
    type: String,
    default: 'Поиск по проповедям...'
  }
})

const emit = defineEmits(['update:modelValue', 'search'])

const searchQuery = ref(props.modelValue)

let searchTimeout = null

watch(searchQuery, (newValue) => {
  emit('update:modelValue', newValue)
  
  clearTimeout(searchTimeout)
  
  if (newValue.length >= props.minChars) {
    searchTimeout = setTimeout(() => {
      // При поиске сбрасываем страницу на первую
      emit('search', newValue, true)
    }, 500)
  } else if (newValue.length === 0) {
    searchTimeout = setTimeout(() => {
      // При очистке сбрасываем поиск и страницу
      emit('search', '', true)
    }, 500)
  }
})

watch(() => props.modelValue, (newValue) => {
  searchQuery.value = newValue
})

const handleSearch = () => {
  clearTimeout(searchTimeout)
  if (searchQuery.value.length >= props.minChars || searchQuery.value.length === 0) {
    emit('search', searchQuery.value, true)
  }
}

const clearSearch = () => {
  searchQuery.value = ''
  emit('update:modelValue', '')
  emit('search', '', true)
}
</script>