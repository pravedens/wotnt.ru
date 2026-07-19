<template>
  <div class="min-h-screen bg-gradient-to-br from-blue-900 to-purple-900 py-12">
    <div class="container mx-auto px-4 max-w-3xl">
      <div class="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
        <h1 class="text-2xl font-bold text-white mb-6">
          {{ isEdit ? '✏️ Редактирование вопроса' : '📝 Создание вопроса' }}
        </h1>

        <form @submit.prevent="saveQuestion" class="space-y-5">
          <!-- Основные поля -->
          <div>
            <label class="block text-white/80 mb-1">Урок *</label>
            <select v-model="form.lesson_id" @change="onLessonChange" required class="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white">
              <option class="bg-gray-800 text-white" value="">Выберите урок</option>
              <option class="bg-gray-800 text-white" v-for="l in lessons" :key="l.id" :value="l.id">{{ l.title }} ({{ l.course?.title }})</option>
            </select>
          </div>

          <div>
            <label class="block text-white/80 mb-1">Тема</label>
            <select v-model="form.theme_id" class="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white">
              <option :value="null" class="bg-gray-800 text-white">— Без темы —</option>
              <option v-for="t in filteredThemes" :key="t.id" :value="t.id" class="bg-gray-800 text-white">
                {{ t.title }}
              </option>
            </select>
          </div>

          <div>
            <label class="block text-white/80 mb-1">Тип вопроса *</label>
            <select v-model="form.type" @change="onTypeChange" required class="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white">
              <option class="bg-gray-800 text-white" value="single_choice">Одиночный выбор</option>
              <option class="bg-gray-800 text-white" value="multiple_choice">Множественный выбор</option>
              <option class="bg-gray-800 text-white" value="true_false">Правда/Ложь</option>
              <option class="bg-gray-800 text-white" value="fill_blank">Заполнить пропуски</option>
              <option class="bg-gray-800 text-white" value="matching">Соответствие</option>
              <option class="bg-gray-800 text-white" value="ordering">Порядок</option>
              <option class="bg-gray-800 text-white" value="odd_one_out">Убрать лишнее</option>
              <option class="bg-gray-800 text-white" value="verse_reference">Ссылка на стих</option>
              <option class="bg-gray-800 text-white" value="select_verse">Выбор стиха</option>
            </select>
          </div>

          <div>
            <label class="block text-white/80 mb-1">Текст вопроса *</label>
            <textarea v-model="form.question" rows="4" class="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white"></textarea>
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-white/80 mb-1">Баллы</label>
              <input v-model.number="form.points" type="number" class="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white">
            </div>
            <div>
              <label class="block text-white/80 mb-1">Порядок</label>
              <input v-model.number="form.order" type="number" class="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white">
            </div>
          </div>

          <!-- ========== ДИНАМИЧЕСКИЕ ПОЛЯ ========== -->

          <!-- 1. Одиночный выбор -->
          <div v-if="form.type === 'single_choice'" class="border-t border-white/20 pt-4">
            <h3 class="text-white font-semibold mb-3">Варианты ответов</h3>
            <div v-for="(opt, idx) in form.config.options" :key="idx" class="flex gap-2 mb-2">
              <input v-model="opt.text" type="text" class="flex-1 px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white" placeholder="Текст варианта">
              <input type="radio" :name="'correct'" :checked="form.config.correct === opt.text" @change="form.config.correct = opt.text" class="w-5 h-5">
              <button type="button" @click="removeOption(idx)" class="px-3 py-2 bg-red-500/20 text-red-300 rounded-lg">✕</button>
            </div>
            <button type="button" @click="addOption" class="px-4 py-2 bg-blue-500/20 text-blue-300 rounded-lg text-sm">+ Добавить вариант</button>
          </div>

          <!-- 2. Множественный выбор -->
          <div v-if="form.type === 'multiple_choice'" class="border-t border-white/20 pt-4">
            <h3 class="text-white font-semibold mb-3">Варианты ответов</h3>
            <div v-for="(opt, idx) in form.config.options" :key="idx" class="flex gap-2 mb-2">
              <input v-model="opt.text" type="text" class="flex-1 px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white" placeholder="Текст варианта">
              <input type="checkbox" v-model="opt.is_correct" class="w-5 h-5">
              <button type="button" @click="removeOption(idx)" class="px-3 py-2 bg-red-500/20 text-red-300 rounded-lg">✕</button>
            </div>
            <button type="button" @click="addOption" class="px-4 py-2 bg-blue-500/20 text-blue-300 rounded-lg text-sm">+ Добавить вариант</button>
          </div>

          <!-- 3. Правда/Ложь -->
          <div v-if="form.type === 'true_false'" class="border-t border-white/20 pt-4">
            <h3 class="text-white font-semibold mb-3">Правильный ответ</h3>
            <select v-model="form.config.correct" class="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white">
              <option value="1">Правда</option>
              <option value="0">Ложь</option>
            </select>
            <div class="mt-3">
              <label class="block text-white/80 mb-1">Пояснение</label>
              <textarea v-model="form.config.explanation" rows="2" class="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white"></textarea>
            </div>
          </div>

          <!-- 4. Заполнить пропуски -->
          <div v-if="form.type === 'fill_blank'" class="border-t border-white/20 pt-4">
            <div>
              <label class="block text-white/80 mb-1">Текст с пропусками (используйте _____)</label>
              <textarea v-model="form.config.text" rows="4" class="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white"></textarea>
            </div>
            <div class="mt-3">
              <label class="block text-white/80 mb-1">Правильные ответы</label>
              <div v-for="(ans, idx) in form.config.answers" :key="idx" class="flex gap-2 mb-2">
                <input v-model="ans.answer" type="text" class="flex-1 px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white" placeholder="Вариант ответа">
                <button type="button" @click="removeAnswer(idx)" class="px-3 py-2 bg-red-500/20 text-red-300 rounded-lg">✕</button>
              </div>
              <button type="button" @click="addAnswer" class="px-4 py-2 bg-blue-500/20 text-blue-300 rounded-lg text-sm">+ Добавить вариант ответа</button>
            </div>
          </div>

          <!-- 5. Ссылка на стих -->
          <div v-if="form.type === 'verse_reference'" class="border-t border-white/20 pt-4">
            <div class="grid grid-cols-3 gap-3">
              <div>
                <label class="block text-white/80 mb-1">Книга</label>
                <input v-model="form.config.expected_book" type="text" class="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white">
              </div>
              <div>
                <label class="block text-white/80 mb-1">Глава</label>
                <input v-model.number="form.config.expected_chapter" type="number" class="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white">
              </div>
              <div>
                <label class="block text-white/80 mb-1">Стих</label>
                <input v-model.number="form.config.expected_verse" type="number" class="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white">
              </div>
            </div>
          </div>

          <!-- 6. Соответствие (matching) -->
          <div v-if="form.type === 'matching'" class="border-t border-white/20 pt-4">
            <h3 class="text-white font-semibold mb-3">Левый столбец</h3>
            <div v-for="(item, idx) in form.config.left" :key="idx" class="flex gap-2 mb-2">
              <input v-model="item.text" type="text" class="flex-1 px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white">
              <button type="button" @click="removeLeftItem(idx)" class="px-3 py-2 bg-red-500/20 text-red-300 rounded-lg">✕</button>
            </div>
            <button type="button" @click="addLeftItem" class="px-4 py-2 bg-blue-500/20 text-blue-300 rounded-lg text-sm mb-3">+ Добавить</button>

            <h3 class="text-white font-semibold mb-3">Правый столбец</h3>
            <div v-for="(item, idx) in form.config.right" :key="idx" class="flex gap-2 mb-2">
              <input v-model="item.text" type="text" class="flex-1 px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white">
              <button type="button" @click="removeRightItem(idx)" class="px-3 py-2 bg-red-500/20 text-red-300 rounded-lg">✕</button>
            </div>
            <button type="button" @click="addRightItem" class="px-4 py-2 bg-blue-500/20 text-blue-300 rounded-lg text-sm">+ Добавить</button>

            <h3 class="text-white font-semibold mb-3 mt-3">Соответствия</h3>
            <div v-for="(match, idx) in form.config.matches" :key="idx" class="grid grid-cols-2 gap-2 mb-2">
              <select v-model="match.left" class="px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white">
                <option value="">Выберите</option>
                <option v-for="l in form.config.left" :key="l.text" :value="l.text">{{ l.text }}</option>
              </select>
              <select v-model="match.right" class="px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white">
                <option value="">Выберите</option>
                <option v-for="r in form.config.right" :key="r.text" :value="r.text">{{ r.text }}</option>
              </select>
              <button type="button" @click="removeMatch(idx)" class="px-3 py-2 bg-red-500/20 text-red-300 rounded-lg">✕</button>
            </div>
            <button type="button" @click="addMatch" class="px-4 py-2 bg-blue-500/20 text-blue-300 rounded-lg text-sm">+ Добавить</button>
          </div>

          <!-- 7. Порядок -->
          <div v-if="form.type === 'ordering'" class="border-t border-white/20 pt-4">
            <h3 class="text-white font-semibold mb-3">Элементы для сортировки</h3>
            <div v-for="(item, idx) in form.config.items" :key="idx" class="grid grid-cols-2 gap-2 mb-2">
              <input v-model="item.text" type="text" class="px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white">
              <input v-model.number="item.correct_order" type="number" class="px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white" placeholder="Порядок">
              <button type="button" @click="removeOrderingItem(idx)" class="px-3 py-2 bg-red-500/20 text-red-300 rounded-lg">✕</button>
            </div>
            <button type="button" @click="addOrderingItem" class="px-4 py-2 bg-blue-500/20 text-blue-300 rounded-lg text-sm">+ Добавить</button>
          </div>

          <!-- 8. Убрать лишнее -->
          <div v-if="form.type === 'odd_one_out'" class="border-t border-white/20 pt-4">
            <h3 class="text-white font-semibold mb-3">Элементы</h3>
            <div v-for="(item, idx) in form.config.items" :key="idx" class="flex gap-2 mb-2">
              <input v-model="item.text" type="text" class="flex-1 px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white">
              <button type="button" @click="removeOddItem(idx)" class="px-3 py-2 bg-red-500/20 text-red-300 rounded-lg">✕</button>
            </div>
            <button type="button" @click="addOddItem" class="px-4 py-2 bg-blue-500/20 text-blue-300 rounded-lg text-sm mb-3">+ Добавить</button>

            <div>
              <label class="block text-white/80 mb-1">Лишний элемент</label>
              <select v-model="form.config.correct_odd" class="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white">
                <option value="">Выберите</option>
                <option v-for="item in form.config.items" :key="item.text" :value="item.text">{{ item.text }}</option>
              </select>
            </div>
            <div class="mt-3">
              <label class="block text-white/80 mb-1">Пояснение</label>
              <textarea v-model="form.config.explanation" rows="2" class="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white"></textarea>
            </div>
          </div>

          <!-- 9. Выбор стиха -->
          <div v-if="form.type === 'select_verse'" class="border-t border-white/20 pt-4">
            <h3 class="text-white font-semibold mb-3">Предложенные стихи</h3>
            <div v-for="(opt, idx) in form.config.options" :key="idx" class="space-y-2 mb-3 p-3 bg-white/5 rounded-lg">
              <input v-model="opt.verse" type="text" class="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white" placeholder="Ссылка">
              <textarea v-model="opt.text" rows="2" class="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white" placeholder="Текст"></textarea>
              <button type="button" @click="removeSelectVerseOption(idx)" class="px-3 py-1 bg-red-500/20 text-red-300 rounded-lg text-sm">Удалить</button>
            </div>
            <button type="button" @click="addSelectVerseOption" class="px-4 py-2 bg-blue-500/20 text-blue-300 rounded-lg text-sm">+ Добавить стих</button>

            <div class="mt-3">
              <label class="block text-white/80 mb-1">Правильный стих</label>
              <select v-model="form.config.correct" class="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white">
                <option value="">Выберите</option>
                <option v-for="opt in form.config.options" :key="opt.verse" :value="opt.verse">{{ opt.verse }}</option>
              </select>
            </div>
          </div>

          <div class="flex gap-3 pt-4">
            <button type="submit" :disabled="saving" class="flex-1 px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600">
              {{ saving ? 'Сохранение...' : 'Сохранить' }}
            </button>
            <NuxtLink to="/teacher/questions" class="px-6 py-2 bg-gray-500 text-white rounded-lg">Отмена</NuxtLink>
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
const lessons = ref([]);
const themes = ref([]);

const defaultConfig = {
  single_choice: { options: [{ text: '' }], correct: '', randomize: true },
  multiple_choice: { options: [{ text: '', is_correct: false }], randomize: true },
  true_false: { statement: '', correct: '1', explanation: '' },
  fill_blank: { text: '', answers: [{ answer: '' }], case_sensitive: false },
  verse_reference: { expected_book: '', expected_chapter: null, expected_verse: null, accept_alternative_notations: true },
  matching: { left: [{ text: '' }], right: [{ text: '' }], matches: [] },
  ordering: { items: [{ text: '', correct_order: 0 }] },
  odd_one_out: { items: [{ text: '' }], correct_odd: '', explanation: '' },
  select_verse: { options: [{ verse: '', text: '' }], correct: '' }
};

const form = reactive({
  lesson_id: '',
  theme_id: null,
  type: 'single_choice',
  question: '',
  points: 1,
  order: 0,
  config: { ...defaultConfig.single_choice }
});

const filteredThemes = computed(() => {
  if (!form.lesson_id) return themes.value;
  const selectedLesson = lessons.value.find(l => l.id === form.lesson_id);
  if (!selectedLesson) return themes.value;
  return themes.value.filter(t => t.course_id === selectedLesson.course_id);
});

// Сброс темы при смене урока
const onLessonChange = () => {
  form.theme_id = null;
};

// Сброс конфига при смене типа вопроса
const onTypeChange = () => {
  if (defaultConfig[form.type]) {
    form.config = JSON.parse(JSON.stringify(defaultConfig[form.type]));
  } else {
    form.config = {};
  }
};

// Методы для dynamic fields
const addOption = () => {
  if (form.type === 'multiple_choice') {
    form.config.options.push({ text: '', is_correct: false });
  } else {
    form.config.options.push({ text: '' });
  }
};
const removeOption = (idx) => form.config.options.splice(idx, 1);
const addAnswer = () => form.config.answers.push({ answer: '' });
const removeAnswer = (idx) => form.config.answers.splice(idx, 1);
const addLeftItem = () => form.config.left.push({ text: '' });
const removeLeftItem = (idx) => form.config.left.splice(idx, 1);
const addRightItem = () => form.config.right.push({ text: '' });
const removeRightItem = (idx) => form.config.right.splice(idx, 1);
const addMatch = () => form.config.matches.push({ left: '', right: '' });
const removeMatch = (idx) => form.config.matches.splice(idx, 1);
const addOrderingItem = () => form.config.items.push({ text: '', correct_order: form.config.items.length + 1 });
const removeOrderingItem = (idx) => form.config.items.splice(idx, 1);
const addOddItem = () => form.config.items.push({ text: '' });
const removeOddItem = (idx) => form.config.items.splice(idx, 1);
const addSelectVerseOption = () => form.config.options.push({ verse: '', text: '' });
const removeSelectVerseOption = (idx) => form.config.options.splice(idx, 1);

const fetchLessons = async () => {
  try {
    const res = await $api('/bible-school/teacher/lessons');
    lessons.value = res.lessons || [];
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

const fetchQuestion = async () => {
  if (!isEdit.value) return;
  try {
    const res = await $api(`/bible-school/teacher/questions/${route.params.id}`);
    const q = res.question;
    form.lesson_id = q.lesson_id;
    form.type = q.type;
    form.question = q.question;
    form.points = q.points;
    form.order = q.order;
    form.theme_id = q.theme_id || null;
    if (q.config) {
      form.config = typeof q.config === 'string' ? JSON.parse(q.config) : q.config;
    }
  } catch (err) {
    notificationStore.error('Ошибка', 'Вопрос не найден');
    navigateTo('/teacher/questions');
  }
};

const saveQuestion = async (e) => {
  e?.preventDefault();
  if (!form.lesson_id || !form.question.trim()) {
    notificationStore.warning('Внимание', 'Заполните обязательные поля');
    return;
  }
  saving.value = true;
  try {
    const payload = {
      lesson_id: form.lesson_id,
      theme_id: form.theme_id,
      type: form.type,
      question: form.question,
      points: form.points,
      order: form.order,
      config: form.config
    };
    if (isEdit.value) {
      await $api(`/bible-school/teacher/questions/${route.params.id}`, { method: 'PUT', body: payload });
      notificationStore.success('Успешно', 'Вопрос обновлён');
    } else {
      await $api('/bible-school/teacher/questions', { method: 'POST', body: payload });
      notificationStore.success('Успешно', 'Вопрос создан');
    }
    navigateTo('/teacher/questions');
  } catch (err) {
    console.error(err);
    notificationStore.error('Ошибка', 'Не удалось сохранить вопрос');
  } finally {
    saving.value = false;
  }
};

onMounted(async () => {
  await fetchLessons();
  await fetchThemes();
  await fetchQuestion();
});
</script>