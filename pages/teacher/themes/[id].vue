<template>
  <div class="min-h-screen bg-gradient-to-br from-blue-900 to-purple-900 py-12">
    <div class="container mx-auto px-4 max-w-3xl">
      <div class="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
        <h1 class="text-2xl font-bold text-white mb-6">{{ isEdit ? '✏️ Редактирование темы' : '📝 Создание темы' }}</h1>

        <form @submit.prevent="saveTheme" class="space-y-5">
          <div>
            <label class="block text-white/80 mb-1">Курс *</label>
            <select v-model="form.course_id" required class="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white">
              <option value="">Выберите курс</option>
              <option v-for="c in courses" :key="c.id" :value="c.id">{{ c.title }}</option>
            </select>
          </div>

          <div>
            <label class="block text-white/80 mb-1">Название темы *</label>
            <input v-model="form.title" type="text" required class="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white">
          </div>

          <div>
            <label class="block text-white/80 mb-1">Описание</label>
            <textarea v-model="form.description" rows="3" class="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white"></textarea>
          </div>

          <div>
            <label class="block text-white/80 mb-1">Преподаватель</label>
            <select v-model="form.teacher_id" class="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white">
              <option :value="null">— Не выбрано —</option>
              <option v-for="t in teachers" :key="t.id" :value="t.id">{{ t.full_name }}</option>
            </select>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="block text-white/80 mb-1">Порядок</label>
              <input v-model.number="form.order" type="number" class="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white">
            </div>
            <div class="flex items-center gap-3 mt-7">
              <input type="checkbox" v-model="form.is_published" id="published" class="w-4 h-4">
              <label for="published" class="text-white/80">Опубликована</label>
            </div>
          </div>

          <div class="flex gap-3 pt-4">
            <button type="submit" :disabled="saving" class="flex-1 px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600">
              {{ saving ? 'Сохранение...' : 'Сохранить' }}
            </button>
            <NuxtLink to="/teacher/themes" class="px-6 py-2 bg-gray-500 text-white rounded-lg">Отмена</NuxtLink>
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
const teachers = ref([]);

const form = reactive({
  course_id: '',
  title: '',
  description: '',
  teacher_id: null,
  order: 0,
  is_published: false
});

const fetchCourses = async () => {
  const res = await $api('/bible-school/courses');
  courses.value = res.courses || [];
};

const fetchTeachers = async () => {
  const res = await $api('/bible-school/teachers');
  teachers.value = res.teachers || [];
};

const fetchTheme = async () => {
  if (!isEdit.value) return;
  try {
    const res = await $api(`/bible-school/teacher/themes/${route.params.id}`);
    const theme = res.theme;
    form.course_id = theme.course_id || '';
    form.title = theme.title || '';
    form.description = theme.description || '';
    form.teacher_id = theme.teacher_id || null;
    form.order = theme.order || 0;
    form.is_published = theme.is_published || false;
  } catch (err) {
    notificationStore.error('Ошибка', 'Тема не найдена');
    navigateTo('/teacher/themes');
  }
};

const saveTheme = async (e) => {
  e?.preventDefault();
  if (!form.course_id || !form.title.trim()) {
    notificationStore.warning('Внимание', 'Заполните обязательные поля');
    return;
  }
  saving.value = true;
  try {
    if (isEdit.value) {
      await $api(`/bible-school/teacher/themes/${route.params.id}`, { method: 'PUT', body: form });
      notificationStore.success('Успешно', 'Тема обновлена');
    } else {
      await $api('/bible-school/teacher/themes', { method: 'POST', body: form });
      notificationStore.success('Успешно', 'Тема создана');
    }
    navigateTo('/teacher/themes');
  } catch (err) {
    notificationStore.error('Ошибка', 'Не удалось сохранить тему');
  } finally {
    saving.value = false;
  }
};

onMounted(async () => {
  await fetchCourses();
  await fetchTeachers();
  await fetchTheme();
});
</script>