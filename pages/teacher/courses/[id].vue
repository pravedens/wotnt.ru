<template>
  <div class="min-h-screen bg-gradient-to-br from-blue-900 to-purple-900 py-12">
    <div class="container mx-auto px-4 max-w-3xl">
      <NuxtLink to="/teacher/courses" class="inline-flex items-center gap-2 text-white/60 hover:text-white mb-6">
        ← Назад к курсам
      </NuxtLink>

      <div class="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
        <h1 class="text-2xl font-bold text-white mb-6">
          {{ isEdit ? '✏️ Редактирование курса' : '📝 Создание курса' }}
        </h1>

        <form @submit.prevent="saveCourse" class="space-y-5">
          <!-- Основная информация -->
          <div>
            <label class="block text-white/80 mb-1">Название курса *</label>
            <input v-model="form.title" type="text" required class="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white">
          </div>

          <div>
            <label class="block text-white/80 mb-1">Описание</label>
            <RichEditor v-model="form.description" placeholder="Полное описание курса..." />
          </div>

          <div>
            <label class="block text-white/80 mb-1">Обложка (URL)</label>
            <input v-model="form.image_url" type="url" class="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white" placeholder="https://...">
            <div v-if="form.image_url" class="mt-2">
              <img :src="getImageUrl(form.image_url)" class="w-32 h-32 object-cover rounded-lg">
            </div>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="block text-white/80 mb-1">Порядок сортировки</label>
              <input v-model.number="form.order" type="number" class="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white">
              <p class="text-white/40 text-xs mt-1">Меньшее число = выше в списке</p>
            </div>
            <div class="flex items-center gap-3 mt-7">
              <input type="checkbox" v-model="form.is_published" id="published" class="w-4 h-4">
              <label for="published" class="text-white/80">Опубликован</label>
            </div>
          </div>

          <!-- Что вы узнаете -->
          <div>
            <h2 class="text-xl font-semibold text-white mb-4">🎯 Что вы узнаете</h2>
            <RichEditor v-model="form.what_you_will_learn" placeholder="• Понимание Библии&#10;• Духовный рост&#10;• ..." />
          </div>

          <!-- Навыки -->
          <div>
            <h2 class="text-xl font-semibold text-white mb-4">💡 Практические навыки</h2>
            <RichEditor v-model="form.skills" placeholder="• Молитва&#10;• Проповедь&#10;• ..." />
          </div>

          <!-- Статусы обучения -->
          <div>
            <h2 class="text-xl font-semibold text-white mb-4">📈 Статусы обучения</h2>
            <div class="bg-white/5 rounded-lg p-4">
              <div v-for="(status, idx) in form.statuses" :key="idx" class="grid grid-cols-3 gap-3 mb-3">
                <input v-model="status.name" type="text" placeholder="Название" class="px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white">
                <input v-model.number="status.percentage" type="number" placeholder="%" class="px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white">
                <input v-model="status.icon" type="text" placeholder="Иконка" class="px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white">
              </div>
              <button type="button" @click="addStatus" class="px-4 py-2 bg-blue-500/20 text-blue-300 rounded-lg text-sm hover:bg-blue-500/30">
                + Добавить статус
              </button>
            </div>
          </div>

          <!-- Текст сертификата -->
          <div>
            <label class="block text-white/80 mb-1">Текст на сертификате</label>
            <RichEditor v-model="form.certificate_text" placeholder="Успешно завершил(а) полный курс обучения" />
          </div>

          <!-- Стоимость -->
          <div>
            <label class="block text-white/80 mb-1">Стоимость обучения</label>
            <input v-model="form.price" type="text" class="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white" placeholder="Бесплатно">
          </div>

          <div class="flex gap-3 pt-4">
  <button 
    type="button"
    @click="saveCourse"
    :disabled="saving" 
    class="flex-1 px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
  >
    {{ saving ? 'Сохранение...' : 'Сохранить' }}
  </button>
  <NuxtLink to="/teacher/courses" class="px-6 py-2 bg-gray-500 text-white rounded-lg text-center">Отмена</NuxtLink>
</div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useAuthStore } from '~/stores/auth';
import { useImageUrl } from '~/composables/useImageUrl';
import { useNotificationStore } from '~/stores/notification';
import RichEditor from '~/components/RichEditor.vue';  // ✅ импорт редактора

definePageMeta({ middleware: 'auth' });

const route = useRoute();
const authStore = useAuthStore();
const notificationStore = useNotificationStore();
const { getImageUrl } = useImageUrl();
const { $api } = useApi();

const isEdit = computed(() => !!route.params.id && route.params.id !== 'create');
const saving = ref(false);

const defaultStatuses = [
  { name: 'Ученик', percentage: 0, icon: '📘' },
  { name: 'Служитель', percentage: 25, icon: '🙏' },
  { name: 'Лидер', percentage: 50, icon: '👑' },
  { name: 'Наставник', percentage: 75, icon: '⭐' }
];

const form = reactive({
  title: '',
  description: '',
  image_url: '',
  order: 0,
  is_published: false,
  what_you_will_learn: '',
  skills: '',
  price: 'Бесплатно',
  statuses: [...defaultStatuses],
  certificate_text: ''
});

const addStatus = () => {
  form.statuses.push({ name: '', percentage: 0, icon: '📘' });
};

const fetchCourse = async () => {
  if (!isEdit.value) return;
  try {
    const res = await $api(`/bible-school/teacher/courses/${route.params.id}`);
    const course = res.course;
    form.title = course.title || '';
    form.description = course.description || '';
    form.image_url = course.image_url || '';
    form.order = course.order || 0;
    form.is_published = course.is_published || false;
    form.what_you_will_learn = course.what_you_will_learn || '';
    form.skills = course.skills || '';
    form.price = course.price || 'Бесплатно';
    form.certificate_text = course.certificate_text || '';
    form.statuses = course.statuses?.length ? course.statuses : [...defaultStatuses];
  } catch (err) {
    console.error(err);
    notificationStore.error('Ошибка', 'Курс не найден');
    navigateTo('/teacher/courses');
  }
};

// Сохранение курса
const saveCourse = async (event) => {
  // Предотвращаем перезагрузку страницы
  if (event) event.preventDefault();
  
  console.log('saveCourse called', { isEdit: isEdit.value, form });
  
  if (!form.title.trim()) {
    notificationStore.warning('Внимание', 'Введите название курса');
    return;
  }

  saving.value = true;
  try {
    if (isEdit.value) {
      const response = await $api(`/bible-school/teacher/courses/${route.params.id}`, { 
        method: 'PUT', 
        body: form 
      });
      console.log('Update response:', response);
      notificationStore.success('Успешно', 'Курс обновлён');
    } else {
      const response = await $api('/bible-school/teacher/courses', { 
        method: 'POST', 
        body: form 
      });
      console.log('Create response:', response);
      notificationStore.success('Успешно', 'Курс создан');
    }
    // Переход после успешного сохранения
    await navigateTo('/teacher/courses');
  } catch (err) {
    console.error('Save error:', err);
    notificationStore.error('Ошибка', err.data?.message || 'Не удалось сохранить курс');
  } finally {
    saving.value = false;
  }
};

onMounted(() => {
  fetchCourse();
});
</script>