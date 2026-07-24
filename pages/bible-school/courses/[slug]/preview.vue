<template>
  <div class="min-h-screen bg-gradient-to-br from-blue-900 to-purple-900 py-12">
    <div class="container mx-auto px-4 max-w-4xl">
      <!-- Изображение курса -->
      <img 
        v-if="course?.image_url" 
        :src="getImageUrl(course.image_url) ?? undefined" 
        class="w-full h-64 object-cover rounded-2xl mb-8"
        :alt="course.title"
        loading="lazy"
      >
      <div v-else class="w-full h-64 bg-gradient-to-r from-blue-500/30 to-purple-500/30 rounded-2xl mb-8 flex items-center justify-center">
        <span class="text-white/50 text-6xl">📚</span>
      </div>
      
      <h1 class="text-3xl font-bold text-white mb-4">{{ course?.title || 'Курс не найден' }}</h1>
      <div class="text-white/80 mb-8" v-html="course?.description || ''"></div>
      
      <!-- Уроки курса -->
      <h2 class="text-2xl font-bold text-white mb-4">📚 Уроки курса</h2>
      <div class="space-y-2 mb-8">
        <div v-if="course?.lessons && course.lessons.length > 0">
          <div v-for="lesson in course.lessons" :key="lesson.id" class="bg-white/5 rounded-lg p-4">
            <h3 class="text-white font-semibold">{{ lesson.order }}. {{ lesson.title }}</h3>
          </div>
        </div>
        <div v-else class="text-white/60 py-4">Уроки пока не добавлены</div>
      </div>
      
      <!-- Преподаватели -->
      <h2 class="text-2xl font-bold text-white mb-4">👨‍🏫 Преподаватели</h2>
      <div v-if="teachers && teachers.length > 0" class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        <TeacherCard v-for="teacher in teachers" :key="teacher.id" :teacher="teacher" />
      </div>
      <div v-else class="text-white/60 mb-8">Преподаватели не назначены</div>
      
      <!-- Регистрация -->
      <div class="bg-white/10 rounded-2xl p-6 text-center">
        <p class="text-white/80 mb-4">Стоимость обучения: <span class="text-2xl font-bold text-white">Бесплатно</span></p>
        <NuxtLink to="/auth/register" class="inline-block px-8 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition text-lg">
          📝 Хочу учиться
        </NuxtLink>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRoute } from 'vue-router';
import { useImageUrl } from '~/composables/useImageUrl';
import { useApi } from '~/composables/useApi';
import TeacherCard from '~/components/TeacherCard.vue';
import type { BibleCourse, Teacher, ApiResponse } from '~/types/bible-school';

const route = useRoute();
const { getImageUrl } = useImageUrl();
const { $api } = useApi();

const course = ref<BibleCourse | null>(null);
const teachers = ref<Teacher[]>([]);
const loading = ref(true);
const error = ref<string | null>(null);

const slug = computed(() => route.params.slug as string);

const fetchCourse = async () => {
  loading.value = true;
  error.value = null;
  
  try {
    const response = await $api<ApiResponse<BibleCourse>>(`/bible-school/courses/${slug.value}`);
    
    if (response.data) {
      course.value = response.data;
      teachers.value = response.data.teachers || [];
    } else {
      error.value = 'Курс не найден';
    }
  } catch (err: any) {
    console.error('Fetch course error:', err);
    error.value = err.message || 'Ошибка загрузки курса';
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  fetchCourse();
});
</script>

<style scoped>
/* Стили при необходимости */
</style>