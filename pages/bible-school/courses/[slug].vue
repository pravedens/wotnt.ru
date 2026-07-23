<template>
  <div class="min-h-screen bg-gradient-to-br from-blue-900 to-purple-900 py-12">
    <div class="container mx-auto px-4 max-w-4xl">
      <div v-if="loading" class="text-center py-12">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto"></div>
        <p class="text-white/70 mt-4">Загрузка курса...</p>
      </div>
      
      <template v-else-if="course">
        <NuxtLink to="/bible-school/courses" class="inline-flex items-center gap-2 text-white/60 hover:text-white mb-6 transition">
          ← Назад к курсам
        </NuxtLink>
        
        <!-- Изображение курса -->
        <div v-if="getImageUrl(course.image_url)" class="rounded-2xl overflow-hidden mb-8 h-64">
          <img 
            :src="getImageUrl(course.image_url)" 
            :alt="course.title"
            class="w-full h-full object-cover"
          >
        </div>
        
        <div class="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20 mb-8">
          <h1 class="text-3xl font-bold text-white mb-4">{{ course.title }}</h1>
          <p class="text-white/70" v-html="course.description"></p>
          <div v-if="course.progress" class="mt-6">
            <div class="flex justify-between text-sm text-white/50 mb-2">
              <span>Ваш прогресс</span>
              <span>{{ course.progress.completed }}/{{ course.progress.total }} уроков ({{ course.progress.percentage }}%)</span>
            </div>
            <div class="w-full bg-white/20 rounded-full h-3">
              <div class="bg-blue-500 h-3 rounded-full" :style="{ width: course.progress.percentage + '%' }"></div>
            </div>
          </div>
        </div>
        
        <div class="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20">
          <h2 class="text-2xl font-bold text-white mb-6">📚 Темы и уроки курса</h2>
          
          <!-- Темы с аккордеоном -->
          <div class="space-y-4">
            <div v-for="theme in filteredThemes" :key="theme.id" class="bg-white/5 rounded-xl border border-white/10">
              <!-- Заголовок темы (кликабельный) -->
              <button 
                @click="toggleTheme(theme.id)"
                class="w-full flex justify-between items-center p-5 text-left hover:bg-white/10 transition rounded-xl"
              >
                <div>
                  <h3 class="text-xl font-semibold text-blue-300">{{ theme.title }}</h3>
                  <p v-if="theme.description" class="text-white/60 text-sm mt-1">{{ theme.description }}</p>
                  <p class="text-white/40 text-xs mt-2">{{ theme.lessons.length }} уроков</p>
                </div>
                <div class="text-white/60">
                  <svg v-if="expandedThemes.includes(theme.id)" class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 15l7-7 7 7" />
                  </svg>
                  <svg v-else class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </button>
              
              <!-- Список уроков темы (показывается, если тема раскрыта) -->
              <div v-if="expandedThemes.includes(theme.id)" class="border-t border-white/10 p-4 space-y-3">
                <div 
                  v-for="lesson in theme.lessons" 
                  :key="lesson.id"
                  class="bg-white/5 rounded-xl p-4 hover:bg-white/10 transition"
                >
                  <div class="flex flex-wrap justify-between items-start gap-3">
                    <div class="flex-1">
                      <div class="flex items-center gap-3 mb-2 flex-wrap">
                        <span class="text-white/40 text-sm">Урок {{ lesson.order }}</span>
                        <span 
                          v-if="lesson.is_locked" 
                          class="text-xs px-2 py-1 rounded-full bg-gray-500/30 text-gray-300"
                        >
                          🔒 Заблокирован
                        </span>
                        <span 
                          v-else-if="lesson.status === 'completed'" 
                          class="text-xs px-2 py-1 rounded-full bg-green-500/30 text-green-300"
                        >
                          ✓ Пройден
                        </span>
                        <span 
                          v-else-if="lesson.status === 'test_passed'" 
                          class="text-xs px-2 py-1 rounded-full bg-blue-500/30 text-blue-300"
                        >
                          ⏳ Тест сдан
                        </span>
                        <span 
                          v-else-if="lesson.status !== 'not_started'" 
                          class="text-xs px-2 py-1 rounded-full bg-yellow-500/30 text-yellow-300"
                        >
                          🔄 В процессе
                        </span>
                      </div>
                      <h3 class="text-xl font-semibold text-white">{{ lesson.title }}</h3>
                      <p v-if="lesson.call_question" class="text-white/50 text-sm mt-1 line-clamp-2">{{ lesson.call_question }}</p>
                    </div>
                    <NuxtLink 
                      :to="lesson.is_locked ? '#' : `/bible-school/lessons/${lesson.slug}`"
                      :class="[
                        'px-5 py-2 rounded-lg transition text-sm font-medium whitespace-nowrap',
                        lesson.is_locked 
                          ? 'bg-gray-500/30 text-gray-400 cursor-not-allowed' 
                          : 'bg-blue-500 text-white hover:bg-blue-600'
                      ]"
                      @click.prevent="lesson.is_locked ? null : null"
                    >
                      {{ lesson.status === 'completed' ? 'Повторить' : (lesson.status === 'test_passed' ? 'Продолжить' : 'Начать урок') }}
                    </NuxtLink>
                  </div>
                </div>
                <p v-if="theme.lessons.length === 0" class="text-white/50 text-center py-4">
                  Уроки в этой теме пока не добавлены
                </p>
              </div>
            </div>
          </div>
          
          <div v-if="filteredThemes.length === 0" class="text-center py-8 text-white/50">
            Темы и уроки пока не добавлены
          </div>
        </div>
      </template>
      
      <div v-else class="text-center py-12">
        <p class="text-white/70">Курс не найден</p>
        <NuxtLink to="/bible-school/courses" class="text-blue-300 hover:text-blue-200 mt-4 inline-block">
          Вернуться к списку курсов
        </NuxtLink>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useAuthStore } from '~/stores/auth';
import { useImageUrl } from '~/composables/useImageUrl';
import { useApi } from '~/composables/useApi';  // ✅ ДОБАВЛЕН ИМПОРТ

const route = useRoute();
const authStore = useAuthStore();
const { getImageUrl } = useImageUrl();
const { $api } = useApi();  // ✅ ДОБАВЛЕНО

const course = ref(null);
const loading = ref(true);
const expandedThemes = ref([]);

// ✅ Фильтруем только те темы, в которых есть уроки
const filteredThemes = computed(() => {
  if (!course.value?.themes) return [];
  return course.value.themes.filter(theme => theme.lessons && theme.lessons.length > 0);
});

// Функция для раскрытия/скрытия темы
const toggleTheme = (themeId) => {
  if (expandedThemes.value.includes(themeId)) {
    expandedThemes.value = expandedThemes.value.filter(id => id !== themeId);
  } else {
    expandedThemes.value.push(themeId);
  }
};

// Автоматически раскрыть первую тему, если есть (только один раз)
const expandFirstTheme = () => {
  if (filteredThemes.value.length > 0 && expandedThemes.value.length === 0) {
    expandedThemes.value = [filteredThemes.value[0].id];
  }
};

const fetchCourse = async () => {
  try {
    // ✅ Используем $api вместо $fetch
    const response = await $api(`/bible-school/courses/${route.params.slug}`);
    course.value = response.course || null;
    expandFirstTheme();
  } catch (err) {
    console.error('Fetch course error:', err);
    course.value = null;
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  fetchCourse();
});
</script>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  line-clamp: 2;
  overflow: hidden;
}
</style>