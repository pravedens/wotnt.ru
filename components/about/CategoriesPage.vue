<template>
  <div class="min-h-screen bg-gradient-to-br from-blue-900 to-purple-900 py-12">
    <div class="container mx-auto px-4">
      <!-- Хлебные крошки -->
      <AboutBreadcrumbs />
      
      <h1 class="text-4xl md:text-5xl font-bold text-white text-center mb-8">
        О нас
      </h1>
      
      <!-- Состояние загрузки категорий -->
      <div v-if="loadingDenominations" class="text-center py-12">
        <div class="inline-block animate-spin rounded-full h-8 w-8 border-4 border-white border-t-transparent"></div>
        <p class="text-white/80 mt-4">Загрузка категорий...</p>
      </div>
      
      <!-- Ошибка -->
      <div v-else-if="error" class="bg-red-500/20 border border-red-500/50 rounded-2xl p-8 text-center max-w-2xl mx-auto">
        <p class="text-red-200 text-lg mb-4">{{ error }}</p>
        <button 
          @click="loadDenominations"
          class="px-6 py-2 bg-red-500/30 text-red-200 rounded-lg hover:bg-red-500/40 transition"
        >
          Попробовать снова
        </button>
      </div>
      
      <!-- Контент -->
      <div v-else class="max-w-4xl mx-auto">
        <!-- Кнопки категорий -->
        <div v-if="denominations.length > 0" class="flex flex-wrap justify-center gap-3 mb-12">
          <button
            v-for="denom in denominations"
            :key="denom.id"
            @click="selectDenomination(denom)"
            class="px-6 py-3 rounded-full font-medium transition-all duration-300 transform hover:scale-105"
            :class="[
              selectedDenominationId === denom.id
                ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg shadow-blue-500/30 scale-105'
                : 'bg-white/10 text-white/70 hover:bg-white/20 hover:text-white'
            ]"
          >
            {{ denom.title }}
            <span class="ml-2 text-xs bg-white/20 px-2 py-0.5 rounded-full">
              {{ denom.about_count || 0 }}
            </span>
          </button>
        </div>
        
        <!-- Сообщение если нет категорий -->
        <div v-else-if="!loadingDenominations" class="text-center py-8 bg-white/10 rounded-2xl">
          <p class="text-white/60">Нет доступных категорий</p>
        </div>
        
        <!-- Загрузка статей категории -->
        <div v-if="loadingAbouts" class="text-center py-12">
          <div class="inline-block animate-spin rounded-full h-8 w-8 border-4 border-white border-t-transparent"></div>
          <p class="text-white/80 mt-4">Загрузка статей...</p>
        </div>
        
        <!-- Контент с анимацией перехода -->
        <Transition
          :name="transitionName"
          mode="out-in"
        >
          <div
            v-if="selectedDenomination && !loadingAbouts && categoryAbouts.length > 0"
            :key="selectedDenomination.id"
            class="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20"
          >
            <!-- Заголовок категории -->
            <h2 class="text-3xl font-bold text-white mb-6 text-center border-b border-white/10 pb-4">
              {{ selectedDenomination.title }}
            </h2>
            
            <!-- Сетка статей категории -->
            <div class="space-y-6">
              <div
                v-for="about in categoryAbouts"
                :key="about.id"
                class="group cursor-pointer"
                @click="goToAbout(about)"
              >
                <div class="border border-white/10 rounded-xl p-6 hover:bg-white/5 transition-all duration-300">
                  <h3 class="text-xl font-semibold text-white mb-3 group-hover:text-blue-300 transition">
                    {{ about.title }}
                  </h3>
                  
                  <!-- Изображение если есть -->
                  <div v-if="about.thumbnail" class="mb-4">
                    <img 
                      :src="getImageUrl(about.thumbnail)"
                      :alt="about.title"
                      class="w-full h-48 object-cover rounded-lg"
                      @error="handleImageError"
                      loading="lazy"
                    >
                  </div>
                  
                  <!-- Описание -->
                  <p class="text-white/70 leading-relaxed mb-4">
                    {{ about.description }}
                  </p>
                  
                  <!-- Дата и ссылка -->
                  <div class="flex items-center justify-between mt-4 pt-4 border-t border-white/10">
                    <span class="text-white/40 text-sm">
                      {{ formatDate(about.created_at || about.updated_at) }}
                    </span>
                    
                    <span class="text-blue-400 group-hover:text-blue-300 transition flex items-center gap-1">
                      Читать далее
                      <svg class="w-4 h-4 group-hover:translate-x-1 transition" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                      </svg>
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <!-- Нет статей в категории -->
          <div
            v-else-if="selectedDenomination && !loadingAbouts && categoryAbouts.length === 0"
            :key="selectedDenomination.id"
            class="bg-white/10 backdrop-blur-lg rounded-2xl p-12 border border-white/20 text-center"
          >
            <p class="text-white/60 text-lg mb-4">В этой категории пока нет статей</p>
            <button
              @click="clearSelection"
              class="px-6 py-2 bg-blue-500/20 text-blue-200 rounded-lg hover:bg-blue-500/30 transition"
            >
              Выбрать другую категорию
            </button>
          </div>
          
          <!-- Заглушка если ничего не выбрано -->
          <div
            v-else-if="!selectedDenomination && !loadingAbouts"
            key="placeholder"
            class="bg-white/10 backdrop-blur-lg rounded-2xl p-12 border border-white/20 text-center"
          >
            <p class="text-white/60 text-lg">
              Выберите категорию, чтобы увидеть статьи
            </p>
          </div>
        </Transition>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useAbout } from '~/composables/useAbout'
import { useImageUrl } from '~/composables/useImageUrl'
import AboutBreadcrumbs from '~/components/about/Breadcrumbs.vue'
import type { Denomination, About } from '~/types/about'

const router = useRouter()
const route = useRoute()
const { getImageUrl } = useImageUrl()

const {
  denominations,
  abouts,
  loading,
  error,
  loadDenominations,
  loadAboutsByDenomination
} = useAbout()

// Разделяем состояния загрузки
const loadingDenominations = ref(false)
const loadingAbouts = ref(false)
const selectedDenomination = ref<Denomination | null>(null)
const selectedDenominationId = computed(() => selectedDenomination.value?.id)
const categoryAbouts = ref<About[]>([])
const transitionName = ref('fade-scale')

// Загрузка категорий при монтировании
onMounted(async () => {
  loadingDenominations.value = true
  await loadDenominations()
  loadingDenominations.value = false
  
  // Если есть query параметр category, выбираем его
  if (route.query.category) {
    const denom = denominations.value.find(d => d.slug === route.query.category)
    if (denom) {
      await selectDenomination(denom)
    }
  }
})

// Выбор категории
const selectDenomination = async (denom: Denomination) => {
  if (selectedDenomination.value?.id === denom.id) return
  
  // Определяем направление анимации
  const oldIndex = selectedDenomination.value 
    ? denominations.value.findIndex(d => d.id === selectedDenomination.value?.id)
    : -1
  const newIndex = denominations.value.findIndex(d => d.id === denom.id)
  
  transitionName.value = newIndex > oldIndex ? 'slide-left' : 'slide-right'
  
  // Загружаем статьи категории
  loadingAbouts.value = true
  selectedDenomination.value = denom
  
  try {
    // Загружаем статьи для выбранной категории
    const response = await loadAboutsByDenomination(denom.slug)
    
    // Проверяем структуру ответа
    if (response && Array.isArray(response)) {
      categoryAbouts.value = response
    } else if (response && response.abouts) {
      // Если API возвращает { denomination: {...}, abouts: [...] }
      categoryAbouts.value = response.abouts
    } else {
      categoryAbouts.value = []
    }
    
    // Обновляем URL
    router.push({ query: { category: denom.slug } })
    
    console.log('📚 Загруженные статьи:', categoryAbouts.value)
  } catch (err) {
    console.error('Error loading category articles:', err)
    categoryAbouts.value = []
  } finally {
    loadingAbouts.value = false
  }
}

// Сброс выбора
const clearSelection = () => {
  selectedDenomination.value = null
  categoryAbouts.value = []
  router.push({ query: {} })
}

// Переход к статье
const goToAbout = (about: About) => {
  router.push(`/about/${about.slug}`)
}

// Форматирование даты
const formatDate = (dateStr: string | null) => {
  if (!dateStr) return 'Дата неизвестна'
  const date = new Date(dateStr)
  return date.toLocaleDateString('ru-RU', { 
    day: 'numeric', 
    month: 'long', 
    year: 'numeric' 
  })
}

// Обработчик ошибки изображения
const handleImageError = (e: Event) => {
  const img = e.target as HTMLImageElement
  img.style.display = 'none'
}
</script>

<style scoped>
/* Базовые анимации */
.fade-scale-enter-active,
.fade-scale-leave-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.fade-scale-enter-from {
  opacity: 0;
  transform: scale(0.95);
}

.fade-scale-leave-to {
  opacity: 0;
  transform: scale(0.95);
}

/* Анимация слайда влево */
.slide-left-enter-active,
.slide-left-leave-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.slide-left-enter-from {
  opacity: 0;
  transform: translateX(50px);
}

.slide-left-leave-to {
  opacity: 0;
  transform: translateX(-50px);
}

/* Анимация слайда вправо */
.slide-right-enter-active,
.slide-right-leave-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.slide-right-enter-from {
  opacity: 0;
  transform: translateX(-50px);
}

.slide-right-leave-to {
  opacity: 0;
  transform: translateX(50px);
}

/* Адаптивность */
@media (max-width: 640px) {
  .container {
    padding-left: 1rem;
    padding-right: 1rem;
  }
  
  h1 {
    font-size: 2.5rem;
  }
  
  .flex-wrap {
    gap: 0.5rem;
  }
  
  button {
    padding: 0.5rem 1rem;
    font-size: 0.9rem;
  }
}
</style>