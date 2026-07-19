<template>
  <div class="min-h-screen bg-gradient-to-br from-blue-900 to-purple-900 py-12">
    <div class="container mx-auto px-4 max-w-4xl">
      <NuxtLink to="/dashboard?tab=teacher" class="inline-flex items-center gap-2 text-white/60 hover:text-white mb-6 transition">
        ← Назад к панели учителя
      </NuxtLink>

      <div v-if="loading" class="text-center py-12">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto"></div>
        <p class="text-white/70 mt-4">Загрузка...</p>
      </div>

      <div v-else-if="essay" class="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20">
        <h1 class="text-2xl font-bold text-white mb-6">📝 Проверка эссе</h1>

        <!-- Информация об ученике -->
        <div class="bg-white/5 rounded-lg p-4 mb-6">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p class="text-white/60 text-sm">Ученик</p>
              <p class="text-white font-semibold">
                {{ getUserFullName(essay.user) }}
              </p>
            </div>
            <div>
              <p class="text-white/60 text-sm">Урок</p>
              <p class="text-white font-semibold">{{ essay.lesson?.title }}</p>
            </div>
          </div>
        </div>

        <!-- Текст эссе -->
        <div class="bg-white/5 rounded-lg p-4 mb-6">
          <p class="text-white/60 text-sm mb-2">Текст эссе</p>
          <div class="text-white/80 whitespace-pre-wrap">{{ essay.content }}</div>
        </div>

        <!-- Форма проверки -->
        <div class="space-y-4">
          <div>
            <label class="block text-white/80 text-sm mb-2">Оценка (0-100)</label>
            <input 
              v-model.number="form.score" 
              type="number" 
              min="0" 
              max="100"
              class="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-blue-400"
            >
          </div>

          <div>
            <label class="block text-white/80 text-sm mb-2">Статус</label>
            <select v-model="form.status" class="bg-gray-800 text-white w-full px-4 py-2 rounded-lg border border-white/20">
  <option value="approved" class="bg-gray-800 text-white">✅ Одобрено</option>
  <option value="rejected" class="bg-gray-800 text-white">❌ Отклонено</option>
</select>
          </div>

          <div>
            <label class="block text-white/80 text-sm mb-2">Отзыв учителя</label>
            <textarea 
              v-model="form.feedback" 
              rows="4"
              class="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-blue-400"
              placeholder="Напишите комментарий для ученика..."
            ></textarea>
          </div>

          <div class="flex gap-4 pt-4">
            <button 
              @click="submitReview"
              :disabled="submitting"
              class="flex-1 px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition disabled:opacity-50"
            >
              {{ submitting ? 'Сохранение...' : 'Сохранить проверку' }}
            </button>
            <button 
              @click="$router.back()"
              class="px-6 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition"
            >
              Отмена
            </button>
          </div>
        </div>
      </div>

      <div v-else class="text-center py-12">
        <p class="text-white/70">Эссе не найдено</p>
        <NuxtLink to="/dashboard?tab=teacher" class="text-blue-300 hover:text-blue-200 mt-4 inline-block">
          Вернуться к панели учителя
        </NuxtLink>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useAuthStore } from '~/stores/auth';
import { useTeacherPanel } from '~/composables/useTeacherPanel';

const route = useRoute();
const authStore = useAuthStore();
const { getEssay, reviewEssay } = useTeacherPanel();

const essay = ref(null);
const loading = ref(true);
const submitting = ref(false);

const form = ref({
  score: 0,
  status: 'approved',
  feedback: ''
});

// Функция для формирования ФИО
const getUserFullName = (user) => {
  if (!user) return '—';
  const parts = [];
  if (user.last_name) parts.push(user.last_name);
  if (user.name) parts.push(user.name);
  if (user.middle_name) parts.push(user.middle_name);
  return parts.length > 0 ? parts.join(' ') : user.email || 'Пользователь';
};

const fetchEssay = async () => {
  try {
    const response = await getEssay(route.params.id);
    console.log('Essay response:', response);
    essay.value = response.essay;
    if (essay.value) {
      form.value.score = essay.value.score || 0;
      form.value.status = essay.value.status || 'approved';
      form.value.feedback = essay.value.teacher_feedback || '';
    }
  } catch (err) {
    console.error('Fetch essay error:', err);
  } finally {
    loading.value = false;
  }
};

const submitReview = async () => {
  submitting.value = true;
  try {
    await reviewEssay(route.params.id, {
      score: form.value.score,
      status: form.value.status,
      feedback: form.value.feedback
    });
    
    alert('Эссе проверено и сохранено');
    navigateTo('/dashboard?tab=teacher');
  } catch (err) {
    console.error('Submit review error:', err);
    alert('Ошибка при сохранении проверки');
  } finally {
    submitting.value = false;
  }
};

onMounted(() => {
  fetchEssay();
});
</script>