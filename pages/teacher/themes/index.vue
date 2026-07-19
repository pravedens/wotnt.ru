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
        <span class="text-white">Темы курсов</span>
      </div>

      <div class="flex justify-between items-center mb-6">
        <h1 class="text-3xl font-bold text-white">📂 Темы курсов</h1>
        <NuxtLink to="/teacher/themes/create" class="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600">
          ➕ Создать тему
        </NuxtLink>
      </div>

      <div v-if="loading" class="text-center py-12">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto"></div>
      </div>

      <div v-else class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div v-for="theme in themes" :key="theme.id" class="bg-white/10 rounded-xl p-4 border border-white/20">
          <h3 class="text-white font-bold text-lg">{{ theme.title }}</h3>
          <p class="text-white/60 text-sm">{{ theme.course?.title }}</p>
          <div class="flex gap-2 mt-3">
            <NuxtLink :to="`/teacher/themes/${theme.id}`" class="px-3 py-1 bg-blue-500 rounded-lg text-sm hover:bg-blue-600">✏️</NuxtLink>
            <button @click="deleteTheme(theme.id)" class="px-3 py-1 bg-red-500 rounded-lg text-sm hover:bg-red-600">🗑️</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useNotificationStore } from '~/stores/notification';

definePageMeta({ middleware: 'auth' });

const { $api } = useApi();
const notificationStore = useNotificationStore();

const themes = ref([]);
const loading = ref(true);

const fetchThemes = async () => {
  try {
    const res = await $api('/bible-school/teacher/themes');
    themes.value = res.themes || [];
  } catch (err) {
    console.error('Fetch themes error:', err);
    notificationStore.error('Ошибка', 'Не удалось загрузить темы');
  } finally {
    loading.value = false;
  }
};

const deleteTheme = async (id) => {
  if (!confirm('Удалить тему? Все уроки в теме потеряют связь.')) return;
  try {
    await $api(`/bible-school/teacher/themes/${id}`, { method: 'DELETE' });
    notificationStore.success('Удалено', 'Тема удалена');
    await fetchThemes();
  } catch (err) {
    console.error('Delete error:', err);
    notificationStore.error('Ошибка', 'Не удалось удалить тему');
  }
};

onMounted(() => {
  fetchThemes();
});
</script>