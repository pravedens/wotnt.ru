<template>
  <div class="min-h-screen bg-gradient-to-br from-blue-900 to-purple-900 py-12">
    <div class="container mx-auto px-4 max-w-6xl">
        
        <!-- Хлебные крошки -->
      <div class="flex items-center gap-2 text-white/60 text-sm mb-6">
        <NuxtLink to="/dashboard" class="hover:text-white transition">Главная</NuxtLink>
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
        </svg>
        <NuxtLink to="/dashboard?tab=teacher" class="hover:text-white transition">Панель учителя</NuxtLink>
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
        </svg>
        <span class="text-white">Управление курсами</span>
      </div>
      
      <div class="flex justify-between items-center mb-6">
        <h1 class="text-3xl font-bold text-white">📚 Управление курсами</h1>
        <NuxtLink to="/teacher/courses/create" class="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600">
          ➕ Создать курс
        </NuxtLink>
      </div>

      <div v-if="loading" class="text-center py-12">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto"></div>
      </div>

      <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div v-for="course in courses" :key="course.id" class="bg-white/10 backdrop-blur-lg rounded-2xl overflow-hidden border border-white/20">
          <img v-if="course.image_url" :src="getImageUrl(course.image_url)" class="w-full h-40 object-cover">
          <div class="p-4">
            <h3 class="text-xl font-bold text-white">{{ course.title }}</h3>
            <p class="text-white/60 text-sm line-clamp-2 mt-1">{{ stripTags(course.description) }}</p>
            <div class="flex items-center gap-2 mt-2">
              <span class="text-xs px-2 py-1 rounded-full" :class="course.is_published ? 'bg-green-500/30 text-green-300' : 'bg-gray-500/30 text-gray-300'">
                {{ course.is_published ? 'Опубликован' : 'Черновик' }}
              </span>
              <span class="text-xs text-white/40">{{ course.lessons_count || 0 }} уроков</span>
            </div>
            <div class="flex gap-2 mt-4">
              <NuxtLink :to="`/teacher/courses/${course.id}`" class="flex-1 px-3 py-1 bg-blue-500 text-white rounded-lg text-center">
                ✏️ Редактировать
              </NuxtLink>
              <button @click="deleteCourse(course.id)" class="px-3 py-1 bg-red-500 text-white rounded-lg">
                🗑️
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useAuthStore } from '~/stores/auth';
import { useImageUrl } from '~/composables/useImageUrl';

definePageMeta({ middleware: 'auth' });

const authStore = useAuthStore();
const { getImageUrl } = useImageUrl();
const { $api } = useApi();

const courses = ref([]);
const loading = ref(true);

const stripTags = (html) => html?.replace(/<[^>]*>/g, '') || '';

const fetchCourses = async () => {
  try {
    const res = await $api('/bible-school/teacher/courses');
    courses.value = res.courses || [];
  } catch (err) {
    console.error('Fetch courses error:', err);
  } finally {
    loading.value = false;
  }
};

const deleteCourse = async (id) => {
  if (!confirm('Удалить курс? Все уроки и темы будут удалены.')) return;
  try {
    await $api(`/bible-school/teacher/courses/${id}`, { method: 'DELETE' });
    await fetchCourses();
  } catch (err) {
    alert('Ошибка при удалении');
  }
};

onMounted(fetchCourses);
</script>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>