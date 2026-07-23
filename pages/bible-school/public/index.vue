<template>
  <div class="min-h-screen bg-gradient-to-br from-blue-900 to-purple-900 py-12">
    <div class="container mx-auto px-4 max-w-6xl">
      <h1 class="text-4xl font-bold text-white text-center mb-4">📖 Библейская школа</h1>
      <p class="text-white/70 text-center mb-12">Погрузитесь в изучение Слова Божьего</p>
      
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div 
          v-for="course in courses" 
          :key="course.id"
          class="bg-white/10 backdrop-blur-lg rounded-2xl overflow-hidden border border-white/20 hover:bg-white/15 transition"
        >
          <img 
            v-if="course.image_url" 
            :src="getImageUrl(course.image_url)" 
            :alt="course.title"
            class="w-full h-48 object-cover"
          >
          <div class="p-6">
            <h2 class="text-xl font-bold text-white mb-2">{{ course.title }}</h2>
            <p class="text-white/60 text-sm mb-4" v-html="stripTags(course.description)"></p>
            <button 
              @click="openCoursePreview(course)"
              class="w-full px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
            >
              Подробнее
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useImageUrl } from '~/composables/useImageUrl';
import { useApi } from '~/composables/useApi';  // ✅ ДОБАВЛЕН ИМПОРТ

const { getImageUrl } = useImageUrl();
const { $api } = useApi();  // ✅ ДОБАВЛЕНО

const courses = ref([]);

const fetchCourses = async () => {
  try {
    // ✅ Используем $api вместо $fetch
    const response = await $api('/bible-school/courses');
    courses.value = response.courses || [];
  } catch (err) {
    console.error('Fetch courses error:', err);
    courses.value = [];
  }
};

const openCoursePreview = (course) => {
  navigateTo(`/bible-school/courses/${course.slug}/preview`);
};

onMounted(fetchCourses);
</script>