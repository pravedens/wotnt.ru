<template>
  <div
    v-if="visible"
    class="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4"
    @click.self="$emit('close')"
  >
    <div
      class="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-6 max-w-md w-full border border-white/20"
    >
      <div class="flex justify-between items-center mb-4">
        <h3 class="text-xl font-bold text-white">
          ✉️ Написать {{ teacher.full_name }}
        </h3>
        <button
          @click="$emit('close')"
          class="text-white/60 hover:text-white text-2xl"
        >
          &times;
        </button>
      </div>

      <div v-if="!isAuthenticated" class="space-y-4">
        <div>
          <label class="block text-white/80 text-sm mb-1"
            >Ваше имя <span class="text-red-400">*</span></label
          >
          <input
            v-model="form.name"
            type="text"
            class="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white"
            placeholder="Иван"
          />
        </div>
        <div>
          <label class="block text-white/80 text-sm mb-1"
            >Ваш Email <span class="text-red-400">*</span></label
          >
          <input
            v-model="form.email"
            type="email"
            class="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white"
            placeholder="ivan@example.com"
          />
        </div>
        <div>
          <label class="block text-white/80 text-sm mb-1"
            >Сообщение <span class="text-red-400">*</span></label
          >
          <textarea
            v-model="form.message"
            rows="4"
            class="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white"
            placeholder="Введите ваше сообщение..."
          ></textarea>
        </div>

        <!-- Yandex SmartCaptcha -->
        <div v-if="captchaSiteKey" class="mb-2">
          <div id="captcha-container"></div>
        </div>

        <button
          @click="sendMessage"
          :disabled="sending"
          class="w-full py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition disabled:opacity-50"
        >
          {{ sending ? "Отправка..." : "Отправить" }}
        </button>
      </div>

      <div v-else class="space-y-4">
        <div>
          <label class="block text-white/80 text-sm mb-1"
            >Сообщение <span class="text-red-400">*</span></label
          >
          <textarea
            v-model="form.message"
            rows="5"
            class="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white"
            placeholder="Введите ваше сообщение..."
          ></textarea>
        </div>

        <button
          @click="sendMessage"
          :disabled="sending"
          class="w-full py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition disabled:opacity-50"
        >
          {{ sending ? "Отправка..." : "Отправить" }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useAuthStore } from "~/stores/auth";
import { useNotificationStore } from "~/stores/notification";
import { useApi } from "~/composables/useApi";  // ✅ ДОБАВЛЕН ИМПОРТ

interface Teacher {
  id: number;
  full_name: string;
  name?: string;
  last_name?: string;
  avatar_url?: string;
  about?: string;
  email?: string;
}

interface FormData {
  name: string;
  email: string;
  message: string;
  captcha_token: string;
}

const props = defineProps<{
  visible: boolean;
  teacher: Teacher;
}>();

const emit = defineEmits<{
  (e: "close"): void;
  (e: "sent"): void;
}>();

const config = useRuntimeConfig();
const authStore = useAuthStore();
const notificationStore = useNotificationStore();
const { $api } = useApi();  // ✅ ДОБАВЛЕНО

const isAuthenticated = computed(() => authStore.isAuthenticated);
const captchaSiteKey = config.public.yandexCaptchaSiteKey as string;

// Геттер для полного имени
const userFullName = computed(() => {
  const user = authStore.user;
  if (!user) return "";
  return [user.last_name, user.name, user.middle_name]
    .filter(Boolean)
    .join(" ");
});

const sending = ref(false);

const form = ref<FormData>({
  name: userFullName.value || "",
  email: authStore.user?.email || "",
  message: "",
  captcha_token: "",
});

// Расширяем Window интерфейс
declare global {
  interface Window {
    loadCaptcha?: (
      containerId: string,
      siteKey: string,
      callback: (token: string) => void,
    ) => void;
  }
}

const loadCaptcha = (): void => {
  if (!captchaSiteKey || isAuthenticated.value) return;

  if (window.loadCaptcha) {
    window.loadCaptcha("captcha-container", captchaSiteKey, (token: string) => {
      form.value.captcha_token = token;
    });
  }
};

const sendMessage = async (): Promise<void> => {
  if (!form.value.message.trim()) {
    notificationStore.warning("Внимание", "Введите сообщение");
    return;
  }

  if (!isAuthenticated.value) {
    if (!form.value.name.trim()) {
      notificationStore.warning("Внимание", "Введите ваше имя");
      return;
    }
    if (!form.value.email.trim()) {
      notificationStore.warning("Внимание", "Введите ваш email");
      return;
    }
  }

  sending.value = true;

  try {
    const payload: Record<string, any> = {
      message: form.value.message,
    };

    if (!isAuthenticated.value) {
      payload.sender_name = form.value.name;
      payload.sender_email = form.value.email;
      if (form.value.captcha_token) {
        payload.captcha_token = form.value.captcha_token;
      }
    }

    // ✅ Используем $api вместо $fetch с baseURL
    await $api(`/teachers/${props.teacher.id}/message`, {
      method: "POST",
      body: payload,
    });

    notificationStore.success("Отправлено", "Сообщение отправлено учителю");
    form.value.message = "";
    form.value.captcha_token = "";
    emit("sent");
    emit("close");
  } catch (err: any) {
    notificationStore.error(
      "Ошибка",
      err.data?.message || "Не удалось отправить сообщение",
    );
  } finally {
    sending.value = false;
  }
};

// Следим за видимостью модального окна
watch(
  () => props.visible,
  (val: boolean) => {
    if (val) {
      form.value = {
        name: userFullName.value || "",
        email: authStore.user?.email || "",
        message: "",
        captcha_token: "",
      };
      setTimeout(loadCaptcha, 100);
    }
  },
);
</script>