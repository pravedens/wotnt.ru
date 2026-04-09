<template>
  <div v-if="lastPage > 1" class="flex justify-center items-center gap-2 mt-8">
    <!-- Кнопка "Первая" -->
    <button
      @click="$emit('page-change', 1)"
      :disabled="currentPage === 1"
      class="px-3 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20 transition disabled:opacity-50 disabled:cursor-not-allowed"
    >
      ⟪
    </button>
    
    <!-- Кнопка "Предыдущая" -->
    <button
      @click="$emit('page-change', currentPage - 1)"
      :disabled="currentPage === 1"
      class="px-3 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20 transition disabled:opacity-50 disabled:cursor-not-allowed"
    >
      ←
    </button>
    
    <!-- Номера страниц -->
    <div class="flex gap-1">
      <template v-for="page in displayedPages" :key="page">
        <button
          v-if="page !== '...'"
          @click="$emit('page-change', page)"
          class="w-10 h-10 rounded-lg transition"
          :class="page === currentPage 
            ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white font-bold' 
            : 'bg-white/10 text-white hover:bg-white/20'"
        >
          {{ page }}
        </button>
        <span v-else class="w-10 h-10 flex items-center justify-center text-white/60">...</span>
      </template>
    </div>
    
    <!-- Кнопка "Следующая" -->
    <button
      @click="$emit('page-change', currentPage + 1)"
      :disabled="currentPage === lastPage"
      class="px-3 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20 transition disabled:opacity-50 disabled:cursor-not-allowed"
    >
      →
    </button>
    
    <!-- Кнопка "Последняя" -->
    <button
      @click="$emit('page-change', lastPage)"
      :disabled="currentPage === lastPage"
      class="px-3 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20 transition disabled:opacity-50 disabled:cursor-not-allowed"
    >
      ⟫
    </button>
  </div>
</template>

<script setup>
const props = defineProps({
  currentPage: {
    type: Number,
    required: true
  },
  lastPage: {
    type: Number,
    required: true
  },
  total: {
    type: Number,
    default: 0
  },
  perPage: {
    type: Number,
    default: 8
  }
})

defineEmits(['page-change'])

// Вычисляем отображаемые номера страниц
const displayedPages = computed(() => {
  const delta = 0 // Сколько страниц показывать слева и справа от текущей
  const range = []
  const rangeWithDots = []
  let l

  for (let i = 1; i <= props.lastPage; i++) {
    if (i === 1 || i === props.lastPage || (i >= props.currentPage - delta && i <= props.currentPage + delta)) {
      range.push(i)
    }
  }

  range.forEach((i) => {
    if (l) {
      if (i - l === 2) {
        rangeWithDots.push(l + 1)
      } else if (i - l !== 1) {
        rangeWithDots.push('...')
      }
    }
    rangeWithDots.push(i)
    l = i
  })

  return rangeWithDots
})
</script>