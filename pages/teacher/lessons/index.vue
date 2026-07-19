<template>
  <div class="min-h-screen bg-gradient-to-br from-blue-900 to-purple-900 py-12">
    <div class="container mx-auto px-4 max-w-6xl">
      <!-- Хлебные крошки -->
      <div class="flex items-center gap-2 text-white/60 text-sm mb-6">
        <NuxtLink to="/dashboard" class="hover:text-white transition">Главная</NuxtLink>
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
        </svg>
        <NuxtLink to="/teacher/courses" class="hover:text-white transition">Панель учителя</NuxtLink>
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
        </svg>
        <span class="text-white">Управление уроками</span>
      </div>

      <div class="flex justify-between items-center mb-6">
        <h1 class="text-3xl font-bold text-white">📖 Управление уроками</h1>
        <NuxtLink to="/teacher/lessons/create" class="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600">
          ➕ Создать урок
        </NuxtLink>
      </div>

      <div v-if="loading" class="text-center py-12">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto"></div>
      </div>

      <div v-else class="overflow-x-auto">
        <table class="w-full text-white">
          <thead class="bg-white/20">
            <tr>
              <th class="p-3 text-left">Курс</th>
              <th class="p-3 text-left">Тема</th>
              <th class="p-3 text-left">Название</th>
              <th class="p-3 text-left">Порядок</th>
              <th class="p-3 text-left">Статус</th>
              <th class="p-3 text-left">Действия</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="l in lessons" :key="l.id" class="border-t border-white/10">
              <td class="p-3">{{ l.course?.title }}</td>
              <td class="p-3">{{ l.theme?.title || '—' }}</td>
              <td class="p-3">{{ l.title }}</td>
              <td class="p-3">{{ l.order }}</td>
              <td class="p-3">
                <span :class="l.is_published ? 'text-green-300' : 'text-gray-400'">
                  {{ l.is_published ? 'Опубликован' : 'Черновик' }}
                </span>
              </td>
              <td class="p-3 flex gap-2">
                <NuxtLink :to="`/teacher/lessons/${l.id}`" class="px-3 py-1 bg-blue-500 rounded-lg hover:bg-blue-600">✏️</NuxtLink>
                <button @click="deleteLesson(l.id)" class="px-3 py-1 bg-red-500 rounded-lg hover:bg-red-600">🗑️</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useNotificationStore } from '~/stores/notification';

definePageMeta({ middleware: 'auth' });

const { $api } = useApi();
const notificationStore = useNotificationStore();

const lessons = ref([]);
const loading = ref(true);

const fetchLessons = async () => {
  try {
    const res = await $api('/bible-school/teacher/lessons');
    lessons.value = res.lessons || [];
  } catch (err) {
    console.error('Fetch lessons error:', err);
    notificationStore.error('Ошибка', 'Не удалось загрузить уроки');
  } finally {
    loading.value = false;
  }
};

const deleteLesson = async (id) => {
  if (!confirm('Удалить урок?')) return;
  try {
    await $api(`/bible-school/teacher/lessons/${id}`, { method: 'DELETE' });
    notificationStore.success('Удалено', 'Урок удалён');
    await fetchLessons();
  } catch (err) {
    console.error('Delete error:', err);
    notificationStore.error('Ошибка', 'Не удалось удалить урок');
  }
};

onMounted(() => {
  fetchLessons();
});
</script>