<template>
  <div class="min-h-screen bg-gradient-to-br from-blue-900 to-purple-900 py-12">
    <div class="container mx-auto px-4 max-w-6xl">
      <!-- Шапка -->
      <div class="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 mb-6">
        <div class="flex flex-wrap justify-between items-center gap-4">
          <div>
            <h1 class="text-2xl font-bold text-white">{{ party.name }}</h1>
            <p class="text-white/60">{{ party.course_title }}</p>
          </div>
          <div class="flex gap-3">
            <button 
              v-if="party.is_leader"
              @click="openVideoCall"
              class="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition flex items-center gap-2"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              Видеозвонок
            </button>
            <button 
              @click="$router.back()"
              class="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition"
            >
              Назад
            </button>
          </div>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <!-- Список участников (только для лидера) -->
        <div v-if="party.is_leader" class="lg:col-span-1">
          <div class="bg-white/10 backdrop-blur-lg rounded-2xl p-4 border border-white/20">
            <h3 class="text-lg font-semibold text-white mb-3">👥 Участники ({{ students.length }})</h3>
            <div class="space-y-2 max-h-96 overflow-y-auto">
              <div 
                v-for="student in students" 
                :key="student.id"
                class="flex justify-between items-center p-2 bg-white/5 rounded-lg"
              >
                <div>
                  <p class="text-white">{{ student.full_name }}</p>
                  <p class="text-white/40 text-xs">Прогресс: {{ student.course_progress?.percentage || 0 }}%</p>
                </div>
                <button 
                  v-if="student.id !== party.leader_id"
                  @click="removeStudent(student.id)"
                  class="text-red-400 hover:text-red-300 text-sm"
                  title="Удалить из группы"
                >
                  🗑️
                </button>
              </div>
            </div>
            <div class="mt-4 pt-3 border-t border-white/20">
              <p class="text-white/60 text-sm mb-2">Код приглашения:</p>
              <div class="flex gap-2">
                <code class="flex-1 bg-black/30 px-3 py-2 rounded-lg text-white font-mono">{{ party.join_code }}</code>
                <button 
                  @click="copyJoinCode"
                  class="px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                >
                  📋
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Чат -->
        <div :class="party.is_leader ? 'lg:col-span-3' : 'lg:col-span-4'">
          <div class="bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 flex flex-col h-[600px]">
            <!-- Сообщения -->
            <div class="flex-1 overflow-y-auto p-4 space-y-3" ref="messagesContainer">
              <div 
                v-for="msg in messages" 
                :key="msg.id"
                class="flex"
                :class="msg.user_id === currentUserId ? 'justify-end' : 'justify-start'"
              >
                <div 
                  class="max-w-[70%] rounded-lg p-3"
                  :class="msg.user_id === currentUserId 
                    ? 'bg-blue-500 text-white' 
                    : 'bg-white/10 text-white'"
                >
                  <div class="flex items-center gap-2 mb-1">
                    <span class="font-semibold text-sm">{{ msg.user?.full_name || msg.user?.name }}</span>
                    <span class="text-xs opacity-70">{{ formatTime(msg.created_at) }}</span>
                    <button 
                      v-if="party.is_leader && msg.user_id !== currentUserId"
                      @click="deleteMessage(msg.id)"
                      class="text-red-300 hover:text-red-200 text-xs ml-2"
                    >
                      🗑️
                    </button>
                  </div>
                  <p class="text-sm whitespace-pre-wrap break-words">{{ msg.message }}</p>
                </div>
              </div>
              <div v-if="loadingMessages" class="text-center py-4">
                <div class="animate-spin rounded-full h-6 w-6 border-2 border-white border-t-transparent mx-auto"></div>
              </div>
            </div>

            <!-- Форма отправки -->
            <div class="border-t border-white/20 p-4">
              <form @submit.prevent="sendMessage" class="flex gap-3">
                <textarea 
                  v-model="newMessage"
                  rows="2"
                  placeholder="Введите сообщение..."
                  class="flex-1 px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:border-blue-400 resize-none"
                  @keydown.ctrl.enter="sendMessage"
                ></textarea>
                <button 
                  type="submit"
                  :disabled="!newMessage.trim() || sending"
                  class="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition disabled:opacity-50"
                >
                  {{ sending ? '...' : 'Отправить' }}
                </button>
              </form>
              <p class="text-white/40 text-xs mt-2">Ctrl+Enter для отправки</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Jitsi модальное окно -->
    <div v-if="showVideoModal" class="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4">
      <div class="relative w-full max-w-5xl h-[80vh]">
        <button 
          @click="closeVideoCall"
          class="absolute -top-12 right-0 text-white hover:text-gray-300 text-2xl"
        >
          ✕ Закрыть
        </button>
        <iframe 
          :src="jitsiUrl"
          class="w-full h-full rounded-lg"
          allow="camera; microphone; fullscreen"
        ></iframe>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useAuthStore } from '~/stores/auth';
import { useNotificationStore } from '~/stores/notification';
import { useApi } from '~/composables/useApi';  // ✅ ДОБАВЛЕН ИМПОРТ

const props = defineProps({
  partyId: {
    type: Number,
    required: true
  }
});

const authStore = useAuthStore();
const notificationStore = useNotificationStore();
const { $api } = useApi();  // ✅ ДОБАВЛЕНО

const party = ref({});
const students = ref([]);
const messages = ref([]);
const newMessage = ref('');
const loadingMessages = ref(false);
const sending = ref(false);
const currentUserId = computed(() => authStore.user?.id);
const messagesContainer = ref(null);
const showVideoModal = ref(false);
const jitsiUrl = ref('');
let pollingInterval = null;

// Форматирование времени
const formatTime = (date) => {
  return new Date(date).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
};

// Загрузка информации о группе
const loadParty = async () => {
  try {
    // ✅ Используем $api вместо $fetch
    const response = await $api('/bible-school/party/my');
    if (response.has_party) {
      party.value = response.party;
      students.value = response.party.students || [];
    }
  } catch (err) {
    console.error('Load party error:', err);
  }
};

// Загрузка сообщений
const loadMessages = async () => {
  loadingMessages.value = true;
  try {
    // ✅ Используем $api вместо $fetch
    const response = await $api('/bible-school/party/messages');
    messages.value = response.messages || [];
    // Скролл вниз
    setTimeout(() => {
      if (messagesContainer.value) {
        messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight;
      }
    }, 100);
  } catch (err) {
    console.error('Load messages error:', err);
  } finally {
    loadingMessages.value = false;
  }
};

// Отправка сообщения (с цензурой на бэке)
const sendMessage = async () => {
  if (!newMessage.value.trim() || sending.value) return;
  
  sending.value = true;
  try {
    // ✅ Используем $api вместо $fetch
    await $api('/bible-school/party/messages', {
      method: 'POST',
      body: { message: newMessage.value.trim() }
    });
    newMessage.value = '';
    await loadMessages();
  } catch (err) {
    const errorMsg = err.data?.message || 'Ошибка отправки';
    notificationStore.error('Ошибка', errorMsg);
    if (errorMsg.includes('нецензурные')) {
      newMessage.value = '';
    }
  } finally {
    sending.value = false;
  }
};

// Удаление сообщения (только для лидера)
const deleteMessage = async (messageId) => {
  if (!confirm('Удалить сообщение?')) return;
  
  try {
    // ✅ Используем $api вместо $fetch
    await $api(`/bible-school/party/messages/${messageId}`, {
      method: 'DELETE'
    });
    await loadMessages();
    notificationStore.success('Удалено', 'Сообщение удалено');
  } catch (err) {
    notificationStore.error('Ошибка', 'Не удалось удалить сообщение');
  }
};

// Удаление участника (только для лидера)
const removeStudent = async (userId) => {
  if (!confirm('Удалить участника из группы?')) return;
  
  try {
    // ✅ Используем $api вместо $fetch
    await $api(`/bible-school/party/students/${userId}`, {
      method: 'DELETE'
    });
    await loadParty();
    notificationStore.success('Участник удалён', 'Пользователь исключён из группы');
  } catch (err) {
    notificationStore.error('Ошибка', 'Не удалось удалить участника');
  }
};

// Копирование кода приглашения
const copyJoinCode = () => {
  navigator.clipboard.writeText(party.value.join_code);
  notificationStore.success('Скопировано', 'Код приглашения скопирован');
};

// Jitsi видеоконференция
const openVideoCall = () => {
  const roomName = `bible_party_${party.value.id}_${Date.now()}`;
  jitsiUrl.value = `https://meet.jit.si/${roomName}?config.disableDeepLinking=true`;
  showVideoModal.value = true;
};

const closeVideoCall = () => {
  showVideoModal.value = false;
  jitsiUrl.value = '';
};

// Polling для обновления сообщений (проще WebSocket)
const startPolling = () => {
  if (pollingInterval) clearInterval(pollingInterval);
  pollingInterval = setInterval(() => {
    loadMessages();
  }, 3000);
};

onMounted(async () => {
  await loadParty();
  await loadMessages();
  startPolling();
});

onUnmounted(() => {
  if (pollingInterval) clearInterval(pollingInterval);
});
</script>