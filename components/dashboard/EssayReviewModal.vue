<template>
  <div class="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4" @click.self="$emit('close')">
    <div class="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto border border-white/20">
      <div class="flex justify-between items-center p-4 border-b border-white/20">
        <h3 class="text-xl font-bold text-white">📝 Проверка эссе</h3>
        <button @click="$emit('close')" class="text-white/60 hover:text-white text-2xl">&times;</button>
      </div>
      
      <div class="p-6 space-y-6">
        <div class="bg-white/5 rounded-lg p-4">
          <p class="text-white/60 text-sm mb-1">Ученик</p>
          <p class="text-white font-semibold">{{ essay.user?.full_name || essay.user?.name || '—' }}</p>
        </div>
        
        <div class="bg-white/5 rounded-lg p-4">
          <p class="text-white/60 text-sm mb-1">Урок</p>
          <p class="text-white font-semibold">{{ essay.lesson?.title || '—' }}</p>
        </div>
        
        <div class="bg-white/5 rounded-lg p-4">
          <p class="text-white/60 text-sm mb-1">Текст эссе</p>
          <div class="text-white/80 whitespace-pre-wrap break-words max-h-64 overflow-y-auto p-2 bg-white/5 rounded">
            {{ essay.content }}
          </div>
        </div>
        
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label class="block text-white/80 text-sm mb-2">Оценка (0-100)</label>
            <input v-model.number="score" type="number" min="0" max="100" class="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white">
          </div>
          <div>
            <label class="block text-white/80 text-sm mb-2">Статус</label>
            <select v-model="status" class="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white">
              <option value="approved">✅ Одобрено</option>
              <option value="rejected">❌ Отклонено</option>
            </select>
          </div>
        </div>
        
        <div>
          <label class="block text-white/80 text-sm mb-2">Отзыв учителя</label>
          <textarea 
            v-model="feedback" 
            rows="4" 
            class="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white resize-y"
            style="word-wrap: break-word; word-break: break-word; white-space: pre-wrap; overflow-wrap: break-word;"
            placeholder="Напишите комментарий для ученика..."
          ></textarea>
        </div>
        
        <div class="flex gap-3 pt-4">
          <button @click="submitReview" :disabled="submitting" class="flex-1 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition disabled:opacity-50">
            {{ submitting ? 'Сохранение...' : 'Сохранить проверку' }}
          </button>
          <button @click="$emit('close')" class="px-6 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition">Отмена</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useAuthStore } from '~/stores/auth';
import { useNotificationStore } from '~/stores/notification';
import { useApi } from '~/composables/useApi';

const props = defineProps({
  essay: { type: Object, required: true }
});

const emit = defineEmits(['close', 'reviewed']);

const authStore = useAuthStore();
const notificationStore = useNotificationStore();
const { $api } = useApi();

const score = ref(props.essay.score || 0);
const status = ref(props.essay.status || 'approved');
const feedback = ref(props.essay.teacher_feedback || '');
const submitting = ref(false);

const submitReview = async () => {
  if (!authStore.isAuthenticated) {
    notificationStore.error('Ошибка', 'Необходимо авторизоваться');
    return;
  }
  
  submitting.value = true;
  try {
    await $api(`/bible-school/essays/${props.essay.id}/review`, {
      method: 'POST',
      body: { status: status.value, score: score.value, feedback: feedback.value }
    });
    notificationStore.success('Эссе проверено', 'Оценка отправлена ученику');
    emit('reviewed');
    emit('close');
  } catch (err) {
    console.error('Submit review error:', err);
    notificationStore.error('Ошибка', err?.data?.message || 'Не удалось сохранить проверку');
  } finally {
    submitting.value = false;
  }
};
</script>

<style scoped>
.break-words {
  word-wrap: break-word;
  word-break: break-word;
  white-space: pre-wrap;
  overflow-wrap: break-word;
}
</style>