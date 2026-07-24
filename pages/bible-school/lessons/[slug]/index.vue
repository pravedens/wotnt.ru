<template>
  <div class="min-h-screen bg-gradient-to-br from-blue-900 to-purple-900 py-12">
    <div class="container mx-auto px-4 max-w-4xl">
      <div v-if="loading" class="text-center py-12">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto"></div>
        <p class="text-white/70 mt-4">Загрузка урока...</p>
      </div>
      
      <template v-else-if="lesson">
        <NuxtLink :to="`/bible-school/courses/${courseSlug}`" class="inline-flex items-center gap-2 text-white/60 hover:text-white mb-6 transition">
          ← Назад к курсу
        </NuxtLink>
        
        <div class="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20 mb-6">
          <div class="flex items-center gap-2 text-white/50 text-sm mb-4">
            <span>Урок {{ currentLessonOrder }}</span>
            <span>•</span>
            <span>{{ getCurrentStepName() }}</span>
          </div>
          <h1 class="text-2xl md:text-3xl font-bold text-white mb-6">{{ lesson.title }}</h1>
        </div>
        
        <!-- Все блоки урока отображаются всегда, но заблокированы до нужного шага -->
        <div class="space-y-6">
          <!-- Блок 1: Призыв -->
<div class="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
    <div class="flex justify-between items-center mb-3">
        <h2 class="text-xl font-bold text-white">📢 1. Призыв</h2>
        <span v-if="stepCompleted.call" class="text-green-400 text-sm">✓ Пройдено</span>
    </div>
    <div class="text-white/80 prose" v-html="lesson.call_question"></div>
    
    <!-- ✅ ДОБАВИТЬ ОТВЕТ -->
    <div v-if="lesson.call_answer" class="mt-4 p-4 bg-blue-500/10 rounded-lg border border-blue-500/30">
        <p class="text-blue-300 text-sm font-semibold mb-2">📖 Библейский ответ:</p>
        <div class="text-white/80 prose" v-html="lesson.call_answer"></div>
    </div>
    
    <div v-if="!stepCompleted.call && currentStep === 'call'" class="mt-6 flex justify-end">
        <button 
            @click="completeStep('call')"
            :disabled="saving"
            class="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition disabled:opacity-50"
        >
            {{ saving ? 'Сохранение...' : 'Продолжить →' }}
        </button>
    </div>
</div>
          
          <!-- Блок 2: Писание -->
<div class="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
    <div class="flex justify-between items-center mb-3">
        <h2 class="text-xl font-bold text-white">📖 2. Писание</h2>
        <span v-if="stepCompleted.scripture" class="text-green-400 text-sm">✓ Пройдено</span>
    </div>
    
    <div v-if="lesson.scripture_verses" class="space-y-4">
        <div 
            v-for="(verse, index) in formatScriptureVerses(lesson.scripture_verses)" 
            :key="index"
            class="p-4 bg-blue-500/10 rounded-lg border border-blue-500/30"
        >
            <p v-if="verse.reference" class="text-blue-300 text-sm font-semibold mb-2">
                📖 {{ verse.reference }}
            </p>
            <div class="text-white/80 prose italic" v-html="verse.text"></div>
        </div>
    </div>
    <div v-else class="text-white/50 text-center py-4">
        Стихи для этого урока пока не добавлены
    </div>
    
    <div v-if="!stepCompleted.scripture && currentStep === 'scripture'" class="mt-6 flex justify-end">
        <button 
            @click="completeStep('scripture')"
            :disabled="saving"
            class="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition disabled:opacity-50"
        >
            {{ saving ? 'Сохранение...' : 'Продолжить →' }}
        </button>
    </div>
</div>
          
          <!-- Блок 3: Основной контент -->
          <div class="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
            <div class="flex justify-between items-center mb-3">
              <h2 class="text-xl font-bold text-white">📚 3. Основной контент</h2>
              <span v-if="stepCompleted.content" class="text-green-400 text-sm">✓ Пройдено</span>
            </div>
            <div class="text-white/80 prose max-w-none" v-html="lesson.content"></div>
            <div v-if="!stepCompleted.content && currentStep === 'content'" class="mt-6 flex justify-end">
              <button 
                @click="completeStep('content')"
                :disabled="saving"
                class="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition disabled:opacity-50"
              >
                {{ saving ? 'Сохранение...' : 'Продолжить →' }}
              </button>
            </div>
          </div>
          
         <!-- Блок 4: Видео-лекции -->
<div class="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
    <div class="flex justify-between items-center mb-3">
        <h2 class="text-xl font-bold text-white">🎬 4. Видео-лекции</h2>
        <span v-if="stepCompleted.video" class="text-green-400 text-sm">✓ Пройдено</span>
    </div>
    
    <div v-if="lesson.videos && lesson.videos.length > 0" class="space-y-4">
        <div v-for="(video, vIndex) in lesson.videos" :key="video.id" class="border border-white/20 rounded-lg p-4">
            <h3 v-if="video.title" class="text-white font-semibold mb-2">{{ video.title }}</h3>
            <div class="aspect-video rounded-lg overflow-hidden">
                <iframe 
                    :src="video.embed_url"
                    class="w-full h-full"
                    frameborder="0"
                    allowfullscreen
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                ></iframe>
            </div>
        </div>
    </div>
    <div v-else class="text-white/50 text-center py-8 bg-white/5 rounded-lg">
        Видео для этого урока пока не добавлены
    </div>
    
    <div v-if="!stepCompleted.video && currentStep === 'video'" class="mt-6 flex justify-end">
        <button 
            @click="completeStep('video')"
            :disabled="saving"
            class="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition disabled:opacity-50"
        >
            {{ saving ? 'Сохранение...' : 'Я посмотрел все видео →' }}
        </button>
    </div>
</div>
          
          <!-- Блок 5: Практика -->
          <div class="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
            <div class="flex justify-between items-center mb-3">
              <h2 class="text-xl font-bold text-white">✏️ 5. Практическое задание</h2>
              <span v-if="stepCompleted.practice" class="text-green-400 text-sm">✓ Пройдено</span>
            </div>
            <div class="text-white/80 prose" v-html="lesson.practice_task"></div>
            <div v-if="!stepCompleted.practice && currentStep === 'practice'" class="mt-6 flex justify-end">
              <button 
                @click="completeStep('practice')"
                :disabled="saving"
                class="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition disabled:opacity-50"
              >
                {{ saving ? 'Сохранение...' : 'Выполнил →' }}
              </button>
            </div>
          </div>
          
          <div v-if="stepCompleted.practice" class="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 mt-6">
            <button 
    @click="downloadLesson"
    :disabled="downloading"
    class="block w-full text-center px-6 py-3 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition font-semibold"
>
    {{ downloading ? 'Загрузка...' : '📥 Скачать урок (PDF)' }}
</button>
            <p class="text-white/50 text-center text-sm mt-2">
                Материал урока в формате PDF (без видео)
            </p>
        </div>
          
          <!-- Блок 6: Тест -->
          <div class="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
            <div class="flex justify-between items-center mb-3">
              <h2 class="text-xl font-bold text-white">📝 6. Тест</h2>
              <span v-if="stepCompleted.test" class="text-green-400 text-sm">✓ Пройдено</span>
            </div>
            <p class="text-white/70 mb-4">Проверьте свои знания по теме урока</p>
            <div v-if="!stepCompleted.test && currentStep === 'test'" class="mt-6 flex justify-end">
              <button 
                @click="goToTest"
                class="px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition"
              >
                Пройти тест →
              </button>
            </div>
          </div>
          
         <!-- Блок 7: Эссе -->
<div class="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
  <div class="flex justify-between items-center mb-3">
    <h2 class="text-xl font-bold text-white">✍️ 7. Эссе</h2>
    <span v-if="stepCompleted.essay" class="text-green-400 text-sm">✓ Пройдено</span>
    <span v-else-if="essayStatus === 'pending'" class="text-yellow-400 text-sm">⏳ На проверке</span>
    <span v-else-if="essayStatus === 'approved'" class="text-green-400 text-sm">✓ Одобрено</span>
    <span v-else-if="essayStatus === 'rejected'" class="text-red-400 text-sm">✗ Отклонено</span>
  </div>
  
  <p class="text-white/70 mb-4">Напишите размышление по теме урока. Эссе проверит учитель.</p>
  
  <!-- Поле для ввода эссе -->
  <div v-if="stepCompleted.test && !stepCompleted.essay && essayStatus !== 'pending'">
    <textarea 
      v-model="essayContent"
      rows="8"
      class="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:border-blue-400 resize-y"
      style="word-wrap: break-word; word-break: break-word; white-space: pre-wrap; overflow-wrap: break-word;"
      placeholder="Напишите ваше эссе здесь... (минимум 100 символов)"
    ></textarea>
    
    <!-- Выбор учителя -->
    <div class="mt-4">
      <label class="block text-white/80 text-sm mb-2">👨‍🏫 Отправить учителю:</label>
      <select 
        v-model="selectedTeacherId"
        class="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-blue-400"
      >
        <option value="" class="bg-gray-800">— Выберите учителя —</option>
        <option 
          v-for="teacher in teachersList" 
          :key="teacher.id" 
          :value="teacher.id"
          class="bg-gray-800"
        >
          {{ teacher.full_name }}
        </option>
      </select>
    </div>
    
    <div class="flex justify-end mt-4">
      <button 
        @click="submitEssay"
        :disabled="submittingEssay || essayContent.length < 100 || !selectedTeacherId"
        class="px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition disabled:opacity-50"
      >
        {{ submittingEssay ? 'Отправка...' : 'Отправить эссе' }}
      </button>
    </div>
  </div>
  
  <!-- Отображение уже отправленного эссе -->
  <div v-else-if="essayContent && essayStatus !== 'pending'" class="bg-white/5 rounded-lg p-4">
    <div class="text-white/80 whitespace-pre-wrap break-words">{{ essayContent }}</div>
    <div class="mt-2 text-white/40 text-sm">
      Отправлено учителю: {{ essayTeacherName || '—' }}
    </div>
    <div v-if="essayFeedback" class="mt-3 p-3 bg-blue-500/10 rounded-lg border border-blue-500/30">
      <p class="text-blue-300 text-sm font-semibold mb-1">📝 Отзыв учителя:</p>
      <p class="text-white/70 text-sm break-words">{{ essayFeedback }}</p>
      <p v-if="essayScore" class="text-white/50 text-xs mt-1">Оценка: {{ essayScore }}/100</p>
    </div>
  </div>
  
  <!-- Статус ожидания проверки -->
  <div v-else-if="essayStatus === 'pending'" class="text-center py-6">
    <div class="animate-spin rounded-full h-8 w-8 border-2 border-yellow-500 border-t-transparent mx-auto mb-2"></div>
    <p class="text-yellow-400">Эссе отправлено на проверку учителю {{ essayTeacherName }}</p>
    <p class="text-white/50 text-sm mt-1">Ожидайте обратную связь</p>
  </div>
  
  <!-- Если тест ещё не пройден -->
  <div v-else-if="!stepCompleted.test" class="text-center py-6 text-white/50">
    🔒 Эссе откроется после успешной сдачи теста
  </div>
</div>

<!-- Блок навигации после завершения урока -->
<div v-if="stepCompleted.test && stepCompleted.essay" class="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 mt-6">
  <div class="flex flex-col sm:flex-row gap-4 justify-center">
    <NuxtLink 
    :to="`/bible-school/courses/${courseSlug}#lessons-list`"
    class="px-6 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition text-center"
>
    📚 К списку уроков
</NuxtLink>
    <NuxtLink 
      v-if="nextLessonSlug"
      :to="`/bible-school/lessons/${nextLessonSlug}`"
      class="px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition text-center"
    >
      ➡️ Следующий урок
    </NuxtLink>
    <div v-else class="px-6 py-3 bg-blue-500 text-white rounded-lg text-center">
      🎉 Курс завершён!
    </div>
  </div>
</div>
          
          <!-- Прогресс-бар -->
          <div class="bg-white/10 backdrop-blur-lg rounded-2xl p-4 border border-white/20">
            <div class="flex justify-between text-sm text-white/60 mb-2">
              <span>Прогресс урока</span>
              <span>{{ stepProgress }}%</span>
            </div>
            <div class="w-full bg-white/20 rounded-full h-2">
              <div class="bg-blue-500 h-2 rounded-full transition-all" :style="{ width: stepProgress + '%' }"></div>
            </div>
            <div class="flex flex-wrap justify-between mt-2 text-xs text-white/40 gap-2">
              <span :class="{ 'text-green-400': stepCompleted.call }">{{ stepCompleted.call ? '✓' : '1' }}. Призыв</span>
              <span :class="{ 'text-green-400': stepCompleted.scripture }">{{ stepCompleted.scripture ? '✓' : '2' }}. Писание</span>
              <span :class="{ 'text-green-400': stepCompleted.content }">{{ stepCompleted.content ? '✓' : '3' }}. Контент</span>
              <span :class="{ 'text-green-400': stepCompleted.video }">{{ stepCompleted.video ? '✓' : '4' }}. Видео</span>
              <span :class="{ 'text-green-400': stepCompleted.practice }">{{ stepCompleted.practice ? '✓' : '5' }}. Практика</span>
              <span :class="{ 'text-green-400': stepCompleted.test }">{{ stepCompleted.test ? '✓' : '6' }}. Тест</span>
              <span :class="{ 'text-green-400': stepCompleted.essay }">{{ stepCompleted.essay ? '✓' : '7' }}. Эссе</span>
            </div>
          </div>
        </div>
      </template>
      
      <div v-else class="text-center py-12">
        <p class="text-white/70">Урок не найден</p>
        <NuxtLink to="/bible-school/courses" class="text-blue-300 hover:text-blue-200 mt-4 inline-block">
          Вернуться к курсам
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

const lesson = ref(null);
const progress = ref(null);
const courseSlug = ref('');
const loading = ref(true);
const saving = ref(false);
const essayContent = ref('');
const essayStatus = ref('');
const essayFeedback = ref('');
const essayScore = ref(null);
const submittingEssay = ref(false);
const downloading = ref(false);
const teachersList = ref([]);
const selectedTeacherId = ref('');
const essayTeacherName = ref('');

// Текущий шаг
const currentStep = ref('call');
const stepCompleted = ref({
  call: false,
  scripture: false,
  content: false,
  video: false,
  practice: false,
  test: false,
  essay: false 
});

// Порядок шагов
const steps = ['call', 'scripture', 'content', 'video', 'practice', 'test', 'essay'];

// Процент прогресса
const stepProgress = computed(() => {
  const completedCount = Object.values(stepCompleted.value).filter(v => v === true).length;
  return Math.round((completedCount / steps.length) * 100);
});

const currentLessonOrder = computed(() => {
  return lesson.value?.order || 0;
});

const getCurrentStepName = () => {
  const names = {
    call: 'Призыв',
    scripture: 'Писание',
    content: 'Основной контент',
    video: 'Видео-лекция',
    practice: 'Практическое задание',
    test: 'Тест'
  };
  return names[currentStep.value] || '';
};

const fetchLesson = async () => {
  try {
    // ✅ Используем $api вместо $fetch
    const response = await $api(`/bible-school/lessons/${route.params.slug}`);
    lesson.value = response.lesson;
    await loadEssay();
    progress.value = response.progress;
    courseSlug.value = lesson.value?.course_slug || '';
    
    await fetchNextLesson();
    
    // ✅ Восстанавливаем позицию скролла
    if (import.meta.client) {
      const savedPosition = sessionStorage.getItem('lessonScrollPosition');
      if (savedPosition) {
        setTimeout(() => {
          window.scrollTo({
            top: parseInt(savedPosition, 10),
            behavior: 'auto'
          });
          sessionStorage.removeItem('lessonScrollPosition');
        }, 300);
      }
    }
    
    // Восстанавливаем прогресс из сохранённого статуса
    const savedStatus = progress.value?.status;
    if (savedStatus) {
      switch(savedStatus) {
        case 'call_completed':
          stepCompleted.value.call = true;
          currentStep.value = 'scripture';
          break;
        case 'scripture_completed':
          stepCompleted.value.call = true;
          stepCompleted.value.scripture = true;
          currentStep.value = 'content';
          break;
        case 'video_watched':
          stepCompleted.value.call = true;
          stepCompleted.value.scripture = true;
          stepCompleted.value.content = true;
          stepCompleted.value.video = true;
          currentStep.value = 'practice';
          break;
        case 'practice_completed':
          stepCompleted.value.call = true;
          stepCompleted.value.scripture = true;
          stepCompleted.value.content = true;
          stepCompleted.value.video = true;
          stepCompleted.value.practice = true;
          currentStep.value = 'test';
          break;
        case 'test_passed':
        case 'completed':
          stepCompleted.value.call = true;
          stepCompleted.value.scripture = true;
          stepCompleted.value.content = true;
          stepCompleted.value.video = true;
          stepCompleted.value.practice = true;
          stepCompleted.value.test = true;
          currentStep.value = 'test';
          break;
        default:
          currentStep.value = 'call';
      }
    }
  } catch (err) {
    console.error('Fetch lesson error:', err);
    lesson.value = null;
  } finally {
    loading.value = false;
  }
};

// Форматирование стихов: парсинг из текста в массив объектов
const formatScriptureVerses = (versesText) => {
    if (!versesText) return [];
    
    // Разделяем по двойному переносу строки
    const blocks = versesText.split(/\n\n+/);
    const result = [];
    
    for (const block of blocks) {
        if (!block.trim()) continue;
        
        // Ищем строку, которая может быть ссылкой
        const lines = block.trim().split('\n');
        const firstLine = lines[0];
        
        // Проверяем, похожа ли первая строка на ссылку (содержит цифры и двоеточие)
        const isReference = /[\d]+:[\d]+/.test(firstLine);
        
        if (isReference && lines.length > 1) {
            result.push({
                reference: firstLine.trim(),
                text: lines.slice(1).join('<br>').trim()
            });
        } else {
            // Если нет явной ссылки, показываем весь блок как текст
            result.push({
                reference: null,
                text: block.trim().replace(/\n/g, '<br>')
            });
        }
    }
    
    return result;
};

// ✅ Функция скролла к текущему шагу
const scrollToCurrentStep = () => {
  const stepNames = {
    call: 'Призыв',
    scripture: 'Писание',
    content: 'Основной контент',
    video: 'Видео-лекции',
    practice: 'Практическое задание',
    test: 'Тест',
    essay: 'Эссе'
  };
  
  const targetText = stepNames[currentStep.value];
  if (!targetText) return;
  
  const blocks = document.querySelectorAll('.bg-white/10.backdrop-blur-lg.rounded-2xl.p-6.border.border-white/20');
  
  for (const block of blocks) {
    const h2 = block.querySelector('h2.text-xl.font-bold.text-white');
    if (h2 && h2.textContent?.includes(targetText)) {
      block.scrollIntoView({ behavior: 'smooth', block: 'center' });
      break;
    }
  }
};

const completeStep = async (stepName) => {
  if (saving.value) return;
  saving.value = true;
  
  let apiEndpoint = '';
  switch(stepName) {
    case 'call':
      apiEndpoint = `/bible-school/lessons/${route.params.slug}/call`;
      break;
    case 'scripture':
      apiEndpoint = `/bible-school/lessons/${route.params.slug}/scripture`;
      break;
    case 'content':
      stepCompleted.value.content = true;
      const contentIndex = steps.indexOf('content');
      if (contentIndex + 1 < steps.length) {
        currentStep.value = steps[contentIndex + 1];
      }
      saving.value = false;
      // ✅ Скролл только для content
      setTimeout(() => scrollToCurrentStep(100), 200);
      return;
    case 'video':
      apiEndpoint = `/bible-school/lessons/${route.params.slug}/video-watch`;
      break;
    case 'practice':
      apiEndpoint = `/bible-school/lessons/${route.params.slug}/practice`;
      break;
    case 'test':
      // ✅ Для теста — просто переходим, НЕ скроллим
      saving.value = false;
      goToTest();
      return;
    default:
      saving.value = false;
      return;
  }
  
  if (!apiEndpoint) {
    saving.value = false;
    return;
  }
  
  try {
    // ✅ Используем $api вместо $fetch
    await $api(apiEndpoint, {
      method: 'POST'
    });
    
    stepCompleted.value[stepName] = true;
    
    const currentStepIndex = steps.indexOf(stepName);
    if (currentStepIndex + 1 < steps.length) {
      currentStep.value = steps[currentStepIndex + 1];
    }
    
    // ✅ Скролл только НЕ для теста (он уже обработан выше)
    if (stepName !== 'test') {
      setTimeout(() => scrollToCurrentStep(100), 400);
    }
    
  } catch (err) {
    console.error('Error saving progress:', err);
    alert('Ошибка при сохранении прогресса');
  } finally {
    saving.value = false;
  }
};

const goToTest = () => {
// ✅ Сохраняем позицию перед переходом
  if (import.meta.client) {
    sessionStorage.setItem('lessonScrollPosition', window.scrollY.toString());
  }
  navigateTo(`/bible-school/lessons/${lesson.value.slug}/test`);
};

const downloadLesson = async () => {
    downloading.value = true;
    try {
        // ✅ Используем $api вместо $fetch
        const response = await $api(`/bible-school/lessons/${lesson.value.slug}/download`, {
            responseType: 'blob'
        });
        
        // Создаём ссылку для скачивания
        const url = window.URL.createObjectURL(response);
        const a = document.createElement('a');
        a.href = url;
        a.download = `lesson-${lesson.value.slug}.pdf`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        a.remove();
    } catch (err) {
        console.error('Download error:', err);
        alert('Ошибка при скачивании урока');
    } finally {
        downloading.value = false;
    }
};

// Загрузка списка учителей
const loadTeachers = async () => {
    try {
        // ✅ Используем $api вместо $fetch
        const response = await $api('/bible-school/teachers');
        teachersList.value = response.teachers || [];
    } catch (err) {
        console.error('Load teachers error:', err);
    }
};

// Загрузка существующего эссе
const loadEssay = async () => {
    try {
        // ✅ Используем $api вместо $fetch
        const response = await $api(`/bible-school/my/essays`);
        const existing = response.essays?.find(e => e.lesson_id === lesson.value?.id);
        if (existing) {
            essayContent.value = existing.content;
            essayStatus.value = existing.status;
            essayFeedback.value = existing.teacher_feedback;
            essayScore.value = existing.score;
            
            // ✅ ИСПРАВЛЕНО: получаем имя учителя из объекта teacher
            if (existing.teacher) {
                const teacher = existing.teacher;
                essayTeacherName.value = [teacher.last_name, teacher.name, teacher.middle_name].filter(Boolean).join(' ') || teacher.name;
            } else if (existing.teacher_id) {
                essayTeacherName.value = `Учитель #${existing.teacher_id}`;
            }
            
            if (existing.status === 'approved') {
                stepCompleted.value.essay = true;
            }
        }
    } catch (err) {
        console.error('Load essay error:', err);
    }
};

// Отправка эссе
const submitEssay = async () => {
    if (essayContent.value.length < 100) {
        alert('Эссе должно содержать минимум 100 символов');
        return;
    }
    
    if (!selectedTeacherId.value) {
        alert('Выберите учителя');
        return;
    }
    
    submittingEssay.value = true;
    try {
        // ✅ Используем $api вместо $fetch
        const response = await $api(`/bible-school/essay-store`, {
            method: 'POST',
            body: { 
                lesson_slug: lesson.value.slug,
                content: essayContent.value,
                teacher_id: selectedTeacherId.value
            }
        });
        
        if (response.success) {
            essayStatus.value = 'pending';
            essayTeacherName.value = teachersList.value.find(t => t.id === selectedTeacherId.value)?.full_name;
            alert('Эссе отправлено на проверку');
            await loadEssay();
        } else {
            alert(response.message || 'Ошибка при отправке эссе');
        }
    } catch (err) {
        console.error('Submit essay error:', err);
        alert('Ошибка при отправке эссе: ' + (err.data?.message || err.message));
    } finally {
        submittingEssay.value = false;
    }
};

// Получение следующего урока
const nextLessonSlug = ref(null)

const fetchNextLesson = async () => {
  if (!lesson.value) return
  
  try {
    // ✅ Используем $api вместо $fetch
    const response = await $api(`/bible-school/lessons/${lesson.value.slug}/next`)
    nextLessonSlug.value = response.next_lesson?.slug || null
  } catch (err) {
    console.error('Fetch next lesson error:', err)
    nextLessonSlug.value = null
  }
}

onMounted(async () => {
    await fetchLesson();
    await loadTeachers();  
});
</script>

<style scoped>
textarea {
  word-wrap: break-word;
  word-break: break-word;
  white-space: pre-wrap;
  overflow-wrap: break-word;
  max-width: 100%;
  box-sizing: border-box;
}

.break-words {
  word-wrap: break-word;
  word-break: break-word;
  white-space: pre-wrap;
  overflow-wrap: break-word;
}
</style>