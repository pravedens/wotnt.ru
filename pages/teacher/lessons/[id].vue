<template>
  <div class="min-h-screen bg-gradient-to-br from-blue-900 to-purple-900 py-12">
    <div class="container mx-auto px-4 max-w-3xl">
      <NuxtLink to="/teacher/lessons" class="inline-flex items-center gap-2 text-white/60 hover:text-white mb-6">
        ← Назад к урокам
      </NuxtLink>

      <div class="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
        <h1 class="text-2xl font-bold text-white mb-6">
          {{ isEdit ? '✏️ Редактирование урока' : '📝 Создание урока' }}
        </h1>

        <form @submit.prevent="saveLesson" class="space-y-5">
          <div>
            <label class="block text-white/80 mb-1">Курс *</label>
            <select v-model="form.course_id" required class="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white">
              <option value="">Выберите курс</option>
              <option v-for="c in courses" :key="c.id" :value="c.id">{{ c.title }}</option>
            </select>
          </div>

          <div>
            <label class="block text-white/80 mb-1">Тема</label>
            <select v-model="form.theme_id" class="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white">
              <option :value="null">— Без темы —</option>
              <option v-for="t in themes" :key="t.id" :value="t.id">{{ t.title }}</option>
            </select>
          </div>

          <div>
            <label class="block text-white/80 mb-1">Название урока *</label>
            <input v-model="form.title" type="text" required class="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white">
          </div>

          <div>
            <label class="block text-white/80 mb-1">Порядок</label>
            <input v-model.number="form.order" type="number" class="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white">
          </div>

          <div class="flex items-center gap-3">
            <input type="checkbox" v-model="form.is_published" id="published" class="w-4 h-4">
            <label for="published" class="text-white/80">Опубликован</label>
          </div>

          <div class="flex gap-3 pt-4">
            <button type="submit" :disabled="saving" class="flex-1 px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600">
              {{ saving ? 'Сохранение...' : 'Сохранить' }}
            </button>
            <NuxtLink to="/teacher/lessons" class="px-6 py-2 bg-gray-500 text-white rounded-lg">Отмена</NuxtLink>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useNotificationStore } from '~/stores/notification';

definePageMeta({ middleware: 'auth' });

const route = useRoute();
const { $api } = useApi();
const notificationStore = useNotificationStore();

const isEdit = computed(() => !!route.params.id && route.params.id !== 'create');
const saving = ref(false);
const courses = ref([]);
const themes = ref([]);

const form = reactive({
  course_id: '',
  theme_id: null,
  title: '',
  order: 0,
  is_published: false
});

const fetchCourses = async () => {
  try {
    const res = await $api('/bible-school/courses');
    courses.value = res.courses || [];
  } catch (err) {
    console.error(err);
  }
};

const fetchThemes = async () => {
  try {
    const res = await $api('/bible-school/themes');
    themes.value = res.themes || [];
  } catch (err) {
    console.error(err);
  }
};

const fetchLesson = async () => {
  if (!isEdit.value) return;
  try {
    const res = await $api(`/bible-school/teacher/lessons/${route.params.id}`);
    const lesson = res.lesson;
    form.course_id = lesson.course_id || '';
    form.theme_id = lesson.theme_id || null;
    form.title = lesson.title || '';
    form.order = lesson.order || 0;
    form.is_published = lesson.is_published || false;
  } catch (err) {
    console.error(err);
    notificationStore.error('Ошибка', 'Урок не найден');
    navigateTo('/teacher/lessons');
  }
};

const saveLesson = async (e) => {
  e?.preventDefault();
  if (!form.course_id || !form.title.trim()) {
    notificationStore.warning('Внимание', 'Заполните обязательные поля');
    return;
  }
  saving.value = true;
  try {
    if (isEdit.value) {
      await $api(`/bible-school/teacher/lessons/${route.params.id}`, { method: 'PUT', body: form });
      notificationStore.success('Успешно', 'Урок обновлён');
    } else {
      await $api('/bible-school/teacher/lessons', { method: 'POST', body: form });
      notificationStore.success('Успешно', 'Урок создан');
    }
    navigateTo('/teacher/lessons');
  } catch (err) {
    console.error(err);
    notificationStore.error('Ошибка', 'Не удалось сохранить урок');
  } finally {
    saving.value = false;
  }
};

onMounted(async () => {
  await fetchCourses();
  await fetchThemes();
  await fetchLesson();
});
</script>