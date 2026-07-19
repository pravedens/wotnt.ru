<template>
  <div class="min-h-screen bg-gradient-to-br from-blue-900 to-purple-900 py-12">
    <div class="container mx-auto px-4 max-w-6xl">
      <div class="flex justify-between items-center mb-6">
        <h1 class="text-3xl font-bold text-white">📝 Вопросы тестов</h1>
        <NuxtLink to="/teacher/questions/create" class="px-4 py-2 bg-green-500 text-white rounded-lg">➕ Создать вопрос</NuxtLink>
      </div>
      <div v-if="loading" class="text-center py-12"><div class="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto"></div></div>
      <div v-else class="overflow-x-auto">
        <table class="w-full text-white">
          <thead class="bg-white/20"><tr><th class="p-3">Урок</th><th class="p-3">Тип</th><th class="p-3">Вопрос</th><th class="p-3">Баллы</th><th class="p-3"></th></tr></thead>
          <tbody>
            <tr v-for="q in questions" :key="q.id" class="border-t border-white/10">
              <td class="p-3">{{ q.lesson?.title }}</td>
              <td class="p-3">{{ getQuestionTypeLabel(q.type) }}</td>
              <td class="p-3" v-html="q.question"></td>
              <td class="p-3">{{ q.points }}</td>
              <td class="p-3 flex gap-2"><NuxtLink :to="`/teacher/questions/${q.id}`" class="px-3 py-1 bg-blue-500 rounded-lg">✏️</NuxtLink><button @click="deleteQuestion(q.id)" class="px-3 py-1 bg-red-500 rounded-lg">🗑️</button></td>
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

const questions = ref([]);
const loading = ref(true);

const getQuestionTypeLabel = (type) => {
  const types = {
    single_choice: 'Одиночный выбор',
    multiple_choice: 'Множественный выбор',
    essay: 'Эссе',
    case: 'Кейс',
    true_false: 'Правда/Ложь',
    fill_blank: 'Заполнить пропуски',
    matching: 'Соответствие',
    ordering: 'Порядок',
    odd_one_out: 'Убрать лишнее',
    verse_reference: 'Ссылка на стих',
    select_verse: 'Выбор стиха'
  };
  return types[type] || type;
};

const fetchQuestions = async () => {
  try {
    const res = await $api('/bible-school/teacher/questions');
    questions.value = res.questions || [];
  } catch (err) {
    notificationStore.error('Ошибка', 'Не удалось загрузить вопросы');
  } finally {
    loading.value = false;
  }
};

const deleteQuestion = async (id) => {
  if (!confirm('Удалить вопрос?')) return;
  try {
    await $api(`/bible-school/teacher/questions/${id}`, { method: 'DELETE' });
    notificationStore.success('Удалено', 'Вопрос удалён');
    await fetchQuestions();
  } catch (err) {
    notificationStore.error('Ошибка', 'Не удалось удалить вопрос');
  }
};

onMounted(fetchQuestions);
</script>