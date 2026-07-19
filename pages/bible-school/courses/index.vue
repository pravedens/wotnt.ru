<template>
  <div class="min-h-screen bg-gradient-to-br from-blue-900 to-purple-900 py-12">
    <div class="container mx-auto px-4">
      <h1 class="text-3xl md:text-4xl font-bold text-white text-center mb-4">📖 Библейская школа</h1>
      <p class="text-white/70 text-center mb-12 max-w-2xl mx-auto">Погрузитесь в изучение Слова Божьего</p>
      
      <div v-if="loading" class="text-center py-12">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto"></div>
        <p class="text-white/70 mt-4">Загрузка курсов...</p>
      </div>
      
      <div v-else-if="courses.length === 0" class="text-center py-12">
        <p class="text-white/70">Курсы пока не добавлены</p>
      </div>
      
      <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <NuxtLink 
          v-for="course in courses" 
          :key="course.id"
          :to="`/bible-school/courses/${course.slug}`"
          class="bg-white/10 backdrop-blur-lg rounded-2xl overflow-hidden border border-white/20 hover:bg-white/15 transition-all group"
        >
          <img 
            v-if="course.image_url" 
            :src="getImageUrl(course.image_url)" 
            :alt="course.title"
            class="w-full h-48 object-cover"
            loading="lazy"
          >
          <div v-else class="w-full h-48 bg-gradient-to-r from-blue-500/30 to-purple-500/30 flex items-center justify-center">
            <span class="text-white/50 text-4xl">📖</span>
          </div>
          <div class="p-6">
            <h2 class="text-xl font-bold text-white mb-2">{{ course.title }}</h2>
            <p class="text-white/60 text-sm line-clamp-2" v-html="stripTags(course.description)"></p>
            <div v-if="course.progress" class="mt-4">
              <div class="flex justify-between text-xs text-white/50 mb-1">
                <span>Прогресс</span>
                <span>{{ course.progress.percentage }}%</span>
              </div>
              <div class="w-full bg-white/20 rounded-full h-2">
                <div class="bg-blue-500 h-2 rounded-full" :style="{ width: course.progress.percentage + '%' }"></div>
              </div>
            </div>
            <button class="mt-4 text-blue-300 text-sm group-hover:text-blue-200 transition">
              Подробнее →
            </button>
          </div>
        </NuxtLink>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useAuthStore } from '~/stores/auth';
import { useImageUrl } from '~/composables/useImageUrl';

definePageMeta({ layout: 'default' });

const authStore = useAuthStore();
const { getImageUrl } = useImageUrl();
const courses = ref<any[]>([]);
const loading = ref(true);

const stripTags = (html: string | null | undefined): string => {
  if (!html) return '';
  // Удаляем HTML теги простым regex (для краткого описания этого достаточно)
  return html.replace(/<[^>]*>/g, '');
};

const fetchCourses = async () => {
  try {
    const response = await $fetch('/api/bible-school/courses', {
      headers: authStore.token ? { Authorization: `Bearer ${authStore.token}` } : {}
    });
    courses.value = response.courses || [];
  } catch (err) {
    console.error('Fetch courses error:', err);
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  fetchCourses();
});
</script>