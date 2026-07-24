<template>
  <div class="min-h-screen bg-gradient-to-br from-blue-900 to-purple-900 py-12">
    <div class="container mx-auto px-4 max-w-4xl">
      <div v-if="loading" class="text-center py-12">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto"></div>
        <p class="text-white/70 mt-4">Загрузка теста...</p>
      </div>

      <template v-else-if="questions.length > 0">
        <NuxtLink :to="`/bible-school/lessons/${route.params.slug}`" class="inline-flex items-center gap-2 text-white/60 hover:text-white mb-6 transition">
          ← Назад к уроку
        </NuxtLink>

        <div class="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20">
          <h1 class="text-2xl md:text-3xl font-bold text-white mb-4">📝 Тест: {{ lessonTitle }}</h1>
          <p class="text-white/70 mb-6">Проверьте свои знания. Для прохождения необходимо набрать 70%.</p>

          <form @submit.prevent="submitTest" @keydown.enter.prevent class="space-y-8">
            <div v-for="(question, index) in questions" :key="question.id" class="bg-white/5 rounded-xl p-6 border border-white/10">
              <h3 class="text-lg font-semibold text-white mb-4">Вопрос {{ index + 1 }} ({{ question.points }} баллов)</h3>
              <div class="text-white/80 mb-4 prose" v-html="question.question"></div>

              <!-- 1. Одиночный выбор -->
              <div v-if="question.type === 'single_choice'" class="space-y-2">
                <label v-for="option in question.config.options" :key="option.id" class="flex items-center gap-3 p-3 bg-white/5 rounded-lg hover:bg-white/10 cursor-pointer">
                  <input type="radio" :name="`q${question.id}`" :value="option.text" v-model="answers[question.id]">
                  <span class="text-white/80">{{ option.text }}</span>
                </label>
              </div>

              <!-- 2. Множественный выбор -->
              <div v-else-if="question.type === 'multiple_choice'" class="space-y-2">
                <div v-for="(option, idx) in question.config.options" :key="idx" class="flex items-center gap-3 p-3 bg-white/5 rounded-lg hover:bg-white/10 cursor-pointer">
                  <input type="checkbox" :value="option.text" v-model="answers[question.id]">
                  <span class="text-white/80">{{ option.text }}</span>
                </div>
              </div>

              <!-- 3. Соответствие (matching) — левый → правый -->
              <div v-else-if="question.type === 'matching'" class="space-y-4">
                <div 
                  v-for="leftItem in question.config.left" 
                  :key="leftItem.text"
                  class="flex flex-col sm:flex-row sm:items-center gap-3 p-3 bg-white/5 rounded-lg border border-white/10"
                >
                  <div class="w-full sm:w-1/3">
                    <span class="text-white font-medium">{{ leftItem.text }}</span>
                  </div>
                  <div class="flex-1">
                    <select 
                      :value="answers[question.id]?.[leftItem.text] || ''"
                      @change="answers[question.id] = { ...answers[question.id], [leftItem.text]: $event.target.value }"
                      class="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-blue-400"
                    >
                      <option value="" class="bg-gray-800">— Выберите соответствие —</option>
                      <option 
                        v-for="rightItem in question.config.right" 
                        :key="rightItem.text"
                        :value="rightItem.text"
                        class="bg-gray-800"
                      >
                        {{ rightItem.text }}
                      </option>
                    </select>
                  </div>
                </div>
                
                <!-- Сводка выбранных соответствий -->
                <div v-if="answers[question.id] && Object.values(answers[question.id]).some(v => v)" class="mt-4 p-3 bg-blue-500/10 rounded-lg border border-blue-500/30">
                  <h4 class="text-white/60 text-sm font-semibold mb-2">📋 Вы выбрали:</h4>
                  <div class="space-y-1">
                    <div v-for="(right, left) in answers[question.id]" :key="left" v-if="right" class="text-white/80 text-sm">
                      <span class="text-blue-300">{{ left }}</span> → <span class="text-white/60">{{ right }}</span>
                    </div>
                  </div>
                </div>
              </div>

              <!-- 4. Порядок событий (Drag & Drop) -->
              <div v-else-if="question.type === 'ordering'" class="space-y-3">
                <div class="space-y-2">
                  <div 
                    v-for="(item, idx) in getOrderingItems(question.id)" 
                    :key="item.text"
                    class="flex items-center gap-3 p-3 bg-white/5 rounded-lg cursor-grab active:cursor-grabbing"
                    draggable="true"
                    @dragstart="onDragStart(question.id, idx)"
                    @dragend="onDragEnd"
                    @dragover.prevent
                    @dragenter.prevent
                    @drop="onDrop(question.id, idx)"
                    @touchstart="onTouchStart(question.id, idx, $event)"
                    @touchmove="onTouchMove"
                    @touchend="onTouchEnd"
                    :class="{ 'opacity-50': dragState.questionId === question.id && dragState.fromIndex === idx }"
                  >
                    <div class="flex items-center gap-2">
                      <span class="text-white/30 text-sm cursor-grab">⠿</span>
                      <span class="text-white/80">{{ item.text }}</span>
                      <span class="text-white/40 text-sm ml-auto">{{ idx + 1 }}</span>
                    </div>
                  </div>
                </div>
                <p class="text-white/40 text-sm mt-2">Перетащите элементы для изменения порядка</p>
              </div>

              <!-- 5. Убрать лишнее -->
              <div v-else-if="question.type === 'odd_one_out'" class="space-y-2">
                <label v-for="item in question.config.items" :key="item.text" class="flex items-center gap-3 p-3 bg-white/5 rounded-lg hover:bg-white/10 cursor-pointer">
                  <input type="radio" :name="`q${question.id}`" :value="item.text" v-model="answers[question.id]">
                  <span class="text-white/80">{{ item.text }}</span>
                </label>
              </div>

              <!-- 6. Ввод ссылки на стих -->
              <div v-else-if="question.type === 'verse_reference'">
                <input 
                  type="text" 
                  v-model="answers[question.id]" 
                  placeholder="Например: Ин. 3:16" 
                  class="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:border-blue-400 transition"
                  :class="{ 'border-red-500': verseReferenceErrors[question.id] }"
                  @input="clearVerseReferenceError(question.id)"
                >
                <p class="text-white/40 text-sm mt-2">
                  Введите ссылку на стих в формате "Книга глава:стих"
                </p>
                <p v-if="verseReferenceErrors[question.id]" class="text-red-400 text-xs mt-1">
                  {{ verseReferenceErrors[question.id] }}
                </p>
              </div>

              <!-- 7. Выбор стиха из предложенных -->
              <div v-else-if="question.type === 'select_verse'" class="space-y-2">
                <label v-for="option in question.config.options" :key="option.verse" class="flex items-start gap-3 p-3 bg-white/5 rounded-lg hover:bg-white/10 cursor-pointer">
                  <input type="radio" :name="`q${question.id}`" :value="option.verse" v-model="answers[question.id]">
                  <div>
                    <div class="text-white/80 font-medium">{{ option.verse }}</div>
                    <div class="text-white/60 text-sm" v-html="option.text"></div>
                  </div>
                </label>
              </div>

              <!-- 8. Правда/Ложь -->
              <div v-else-if="question.type === 'true_false'" class="space-y-2">
                <label class="flex items-center gap-3 p-3 bg-white/5 rounded-lg hover:bg-white/10 cursor-pointer">
                  <input type="radio" :name="`q${question.id}`" value="1" v-model="answers[question.id]">
                  <span class="text-white/80">Правда</span>
                </label>
                <label class="flex items-center gap-3 p-3 bg-white/5 rounded-lg hover:bg-white/10 cursor-pointer">
                  <input type="radio" :name="`q${question.id}`" value="0" v-model="answers[question.id]">
                  <span class="text-white/80">Ложь</span>
                </label>
              </div>

              <!-- 9. Заполнить пропуски -->
              <div v-else-if="question.type === 'fill_blank'">
                <div class="mb-4 p-4 bg-white/5 rounded-lg">
                  <p class="text-white/80 whitespace-pre-wrap leading-relaxed" v-html="getFillBlankPreview(question)"></p>
                </div>
                <div class="mt-3">
                  <label class="block text-white/80 text-sm mb-2">Вставьте пропущенное слово:</label>
                  <input 
                    type="text" 
                    v-model="answers[question.id]" 
                    class="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:border-blue-400 transition"
                    placeholder="Например: Любовь"
                  >
                </div>
              </div>

              <!-- 10. Эссе -->
              <div v-else-if="question.type === 'essay' || question.type === 'case'">
                <textarea v-model="answers[question.id]" rows="5" class="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50" placeholder="Напишите ваш ответ здесь..."></textarea>
                <p class="text-white/40 text-sm mt-2">Ответ будет проверен учителем</p>
              </div>
            </div>

            <button type="submit" :disabled="submitting" class="w-full py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition disabled:opacity-50">
              {{ submitting ? 'Отправка...' : 'Отправить ответы' }}
            </button>
          </form>
          <!-- Блок результата теста -->
<div v-if="testResult === 'passed'" class="bg-green-500/20 border border-green-500/50 rounded-xl p-6 text-center mt-6">
  <div class="text-4xl mb-2">🎉</div>
  <h3 class="text-2xl font-bold text-green-300 mb-2">Тест пройден!</h3>
  <p class="text-white/80 mb-4">Вы набрали {{ testScore }}%. Отличный результат!</p>
  <div class="flex flex-wrap gap-4 justify-center">
    <button 
      @click="goBackToLesson" 
      class="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
    >
      📚 Вернуться к уроку
    </button>
    <button 
      v-if="canRetry"
      @click="resetTest" 
      class="px-6 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition"
    >
      🔄 Пройти тест заново
    </button>
  </div>
</div>

<div v-else-if="testResult === 'failed'" class="bg-red-500/20 border border-red-500/50 rounded-xl p-6 text-center mt-6">
  <div class="text-4xl mb-2">😔</div>
  <h3 class="text-2xl font-bold text-red-300 mb-2">Тест не пройден</h3>
  <p class="text-white/80 mb-2">Вы набрали {{ testScore }}%. Для прохождения нужно 70%.</p>
  <p class="text-white/60 text-sm mb-4">Попытка {{ retryCount }} из {{ maxRetries }}</p>
  <div class="flex flex-wrap gap-4 justify-center">
    <button 
      v-if="canRetry"
      @click="resetTest" 
      class="px-6 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition"
    >
      🔄 Попробовать снова
    </button>
    <button 
      @click="goBackToLesson" 
      class="px-6 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition"
    >
      📚 Вернуться к уроку
    </button>
  </div>
  <p v-if="!canRetry" class="text-red-300 text-sm mt-3">
    ⚠️ Вы использовали все попытки. Обратитесь к учителю.
  </p>
</div>
        </div>
      </template>

      <div v-else class="text-center py-12">
        <p class="text-white/70">Вопросы для теста пока не добавлены</p>
        <NuxtLink :to="`/bible-school/lessons/${route.params.slug}`" class="text-blue-300 hover:text-blue-200 mt-4 inline-block">
          Вернуться к уроку
        </NuxtLink>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useAuthStore } from '~/stores/auth';
import { useApi } from '~/composables/useApi';  // ✅ ДОБАВЛЕН ИМПОРТ

definePageMeta({
  middleware: 'auth'
});

const route = useRoute();
const authStore = useAuthStore();
const { $api } = useApi();  // ✅ ДОБАВЛЕНО

const questions = ref([]);
const lessonTitle = ref('');
const loading = ref(true);
const submitting = ref(false);
const answers = ref({});
const verseReferenceErrors = ref({});
const testResult = ref(null); // null, 'passed', 'failed'
const retryCount = ref(0);
const maxRetries = 3; // Максимальное количество попыток
const testScore = ref(0);

// ========== DRAG & DROP для ordering ==========
const dragState = ref({
  questionId: null,
  fromIndex: null,
  toIndex: null,
});

const orderingItems = ref({});

const getOrderingItems = (questionId) => {
  if (!orderingItems.value[questionId]) {
    const question = questions.value.find(q => q.id === questionId);
    if (question && question.config.items) {
      orderingItems.value[questionId] = [...question.config.items];
      answers.value[questionId] = orderingItems.value[questionId].map(item => item.text);
    }
  }
  return orderingItems.value[questionId] || [];
};

const onDragStart = (questionId, index) => {
  dragState.value.questionId = questionId;
  dragState.value.fromIndex = index;
};

const onDragEnd = () => {
  dragState.value.questionId = null;
  dragState.value.fromIndex = null;
  dragState.value.toIndex = null;
};

const onDrop = (questionId, toIndex) => {
  const fromIndex = dragState.value.fromIndex;
  if (fromIndex === null || fromIndex === toIndex) return;
  
  const items = [...orderingItems.value[questionId]];
  const [movedItem] = items.splice(fromIndex, 1);
  items.splice(toIndex, 0, movedItem);
  
  orderingItems.value[questionId] = items;
  answers.value[questionId] = items.map(item => item.text);
};

// ========== TOUCH для Drag & Drop на мобильных ==========
let touchState = {
  questionId: null,
  fromIndex: null,
  touchStartY: 0,
  isDragging: false,
};

const onTouchStart = (questionId, index, event) => {
  touchState.questionId = questionId;
  touchState.fromIndex = index;
  touchState.touchStartY = event.touches[0].clientY;
  touchState.isDragging = false;
};

const onTouchMove = (event) => {
  if (touchState.fromIndex === null) return;
  const touchY = event.touches[0].clientY;
  const deltaY = touchY - touchState.touchStartY;
  
  // Активируем перетаскивание при смещении > 10px
  if (Math.abs(deltaY) > 10) {
    touchState.isDragging = true;
    // Предотвращаем прокрутку страницы во время перетаскивания
    event.preventDefault();
  }
  
  // Определяем элемент, над которым находимся
  const elements = document.querySelectorAll('.ordering-item');
  let targetIndex = null;
  let minDistance = Infinity;
  
  elements.forEach((el, idx) => {
    const rect = el.getBoundingClientRect();
    const centerY = rect.top + rect.height / 2;
    const distance = Math.abs(touchY - centerY);
    if (distance < minDistance) {
      minDistance = distance;
      targetIndex = idx;
    }
  });
  
  if (targetIndex !== null && targetIndex !== touchState.fromIndex) {
    dragState.value.toIndex = targetIndex;
  }
};

const onTouchEnd = () => {
  if (touchState.isDragging && touchState.fromIndex !== null && dragState.value.toIndex !== null) {
    const questionId = touchState.questionId;
    const fromIndex = touchState.fromIndex;
    const toIndex = dragState.value.toIndex;
    
    if (fromIndex !== toIndex) {
      const items = [...orderingItems.value[questionId]];
      const [movedItem] = items.splice(fromIndex, 1);
      items.splice(toIndex, 0, movedItem);
      orderingItems.value[questionId] = items;
      answers.value[questionId] = items.map(item => item.text);
    }
  }
  
  touchState = {
    questionId: null,
    fromIndex: null,
    touchStartY: 0,
    isDragging: false,
  };
  dragState.value.questionId = null;
  dragState.value.fromIndex = null;
  dragState.value.toIndex = null;
};

// ========== Валидация ссылки на стих ==========
const validateVerseReferenceFormat = (value) => {
  if (!value || value.trim() === '') return false;
  const trimmed = value.trim();
  const pattern = /^[а-яА-Яa-zA-ZёЁ0-9\s\.]+\s*\d+:\d+$/u;
  return pattern.test(trimmed);
};

const clearVerseReferenceError = (questionId) => {
  if (verseReferenceErrors.value[questionId]) {
    delete verseReferenceErrors.value[questionId];
  }
};

// Fill blank: предпросмотр
const getFillBlankPreview = (question) => {
  const text = question.config?.text || '';
  return text.replace(/_{3,}/g, '<span class="bg-yellow-500/40 text-yellow-100 px-2 py-0.5 rounded inline-block mx-1 font-mono">______</span>');
};

// Загрузка теста
const fetchTest = async () => {
  try {
    // ✅ Используем $api вместо $fetch
    const response = await $api(`/bible-school/lessons/${route.params.slug}/test`);
    questions.value = response.questions || [];
    lessonTitle.value = response.lesson_title || '';
    
    answers.value = {};
    orderingItems.value = {};
    verseReferenceErrors.value = {};
    
    questions.value.forEach(q => {
      if (q.type === 'multiple_choice') {
        answers.value[q.id] = [];
      } else if (q.type === 'matching') {
        const matches = {};
        if (q.config?.left) {
          q.config.left.forEach(leftItem => {
            matches[leftItem.text] = '';
          });
        }
        answers.value[q.id] = matches;
      } else if (q.type === 'ordering') {
        const items = q.config.items || [];
        orderingItems.value[q.id] = [...items];
        answers.value[q.id] = items.map(item => item.text);
      } else {
        answers.value[q.id] = '';
      }
    });
  } catch (err) {
    console.error('Fetch test error:', err);
  } finally {
    loading.value = false;
  }
};

// Отправка теста
const submitTest = async () => {
  submitting.value = true;
  verseReferenceErrors.value = {};
  
  const payload = { answers: [] };
  
  for (const [questionId, value] of Object.entries(answers.value)) {
    const question = questions.value.find(q => q.id === parseInt(questionId));
    if (!question) continue;
    
    let answerValue = value;
    
    // Валидация для verse_reference
    if (question.type === 'verse_reference') {
      const verseValue = typeof value === 'string' ? value : '';
      
      if (!verseValue || verseValue.trim() === '') {
        verseReferenceErrors.value[question.id] = 'Пожалуйста, введите ссылку на стих';
        continue;
      }
      
      if (!validateVerseReferenceFormat(verseValue)) {
        verseReferenceErrors.value[question.id] = 'Неверный формат. Используйте "Книга глава:стих" (например: Ин. 3:16)';
        continue;
      }
      
      answerValue = verseValue.trim();
    }
    
    // Matching: собираем соответствия (левый → правый)
    if (question.type === 'matching' && typeof value === 'object') {
      const filteredMatches = {};
      for (const [left, right] of Object.entries(value)) {
        if (right && right.trim() !== '') {
          filteredMatches[left.trim()] = right;
        }
      }
      answerValue = filteredMatches;
    }
    
    // Ordering: массив строк с trim
    if (question.type === 'ordering' && Array.isArray(value)) {
      answerValue = value.map(item => item.trim());
    }
    
    // Проверка на пустые ответы
    if (question.type !== 'verse_reference') {
      if (answerValue === '' || (Array.isArray(answerValue) && answerValue.length === 0) || (typeof answerValue === 'object' && Object.keys(answerValue).length === 0)) {
        alert(`Пожалуйста, ответьте на вопрос ${question.id}`);
        submitting.value = false;
        return;
      }
    }
    
    payload.answers.push({
      question_id: parseInt(questionId),
      value: answerValue
    });
  }
  
  if (Object.keys(verseReferenceErrors.value).length > 0) {
    submitting.value = false;
    alert('Пожалуйста, исправьте ошибки в формате ссылок на стихи');
    return;
  }
  
  try {
    // ✅ Используем $api вместо $fetch
    const response = await $api(`/bible-school/lessons/${route.params.slug}/test`, {
      method: 'POST',
      body: payload
    });
    
    testScore.value = response.percentage || 0;
    retryCount.value += 1;
    
    if (response.has_pending_essays) {
    alert('Тест сохранён! Ожидайте проверки эссе от учителя.');
    // ✅ Сохраняем позицию перед переходом
    if (import.meta.client) {
      sessionStorage.setItem('lessonScrollPosition', window.scrollY.toString());
    }
    await navigateTo(`/bible-school/lessons/${route.params.slug}`);
  } else if (response.is_passed) {
    alert(`Поздравляем! Вы прошли тест! Набрано ${response.percentage}%`);
    // ✅ Сохраняем позицию перед переходом
    if (import.meta.client) {
      sessionStorage.setItem('lessonScrollPosition', window.scrollY.toString());
    }
    await navigateTo(`/bible-school/lessons/${route.params.slug}`);
  } else {
    alert(`Тест не пройден. Набрано ${response.percentage}%. Нужно 70%.`);
    // ❌ Не переходим, остаёмся на странице теста
  }
  } catch (err) {
    console.error('Submit test error:', err);
    alert('Ошибка при отправке теста: ' + (err.data?.message || err.message));
  } finally {
    submitting.value = false;
  }
};

const goBackToLesson = () => {
  if (import.meta.client) {
    sessionStorage.setItem('lessonScrollPosition', window.scrollY.toString());
  }
  navigateTo(`/bible-school/lessons/${route.params.slug}`);
};

const resetTest = () => {
  // Сбрасываем ответы
  answers.value = {};
  orderingItems.value = {};
  testResult.value = null;
  
  // Перезагружаем тест
  fetchTest();
};

const canRetry = computed(() => {
  return retryCount.value < maxRetries;
});

onMounted(() => {
  fetchTest();
});
</script>

<style scoped>
.ordering-item {
  transition: transform 0.1s ease;
  user-select: none;
  -webkit-user-select: none;
  -webkit-touch-callout: none;
}

.ordering-item:active {
  cursor: grabbing !important;
}

@media (max-width: 640px) {
  .ordering-item {
    padding: 12px 16px;
    font-size: 14px;
  }
}
</style>