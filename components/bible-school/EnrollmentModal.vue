<template>
  <div class="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4" @click.self="$emit('close')">
    <div class="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-white/20">
      <div class="flex justify-between items-center mb-4">
        <h3 class="text-xl font-bold text-white">📋 Заявка на обучение</h3>
        <button @click="$emit('close')" class="text-white/60 hover:text-white text-2xl">&times;</button>
      </div>
      
      <div class="mb-4 p-3 bg-blue-500/10 rounded-lg">
        <p class="text-white/80 text-sm">📌 Данные из вашего профиля уже подставлены. Заполните только недостающую информацию.</p>
      </div>
      
      <div class="space-y-4">
        <div v-for="field in missingFields" :key="field.key" class="mb-3" @blur.capture="handleFieldBlur(field.key)">
          <label class="block text-white/80 text-sm mb-1">
            {{ field.label }} <span v-if="field.required" class="text-red-400">*</span>
          </label>
          
          <input 
            v-if="field.type !== 'select' && field.type !== 'textarea'"
            v-model="form[field.key]" 
            :type="field.key === 'email' ? 'email' : 'text'"
            class="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white"
          >
          
          <select 
            v-else-if="field.type === 'select'"
            v-model="form[field.key]"
            class="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white"
          >
            <option value="">Не выбрано</option>
            <option v-for="opt in field.options" :key="opt.value" :value="opt.value">{{ opt.label }}</option>
          </select>
          
          <textarea 
            v-else-if="field.type === 'textarea'"
            v-model="form[field.key]"
            rows="2"
            class="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white"
          ></textarea>
        </div>
        
        <div class="mt-4">
          <label class="flex items-start gap-3">
            <input type="checkbox" v-model="agreementAccepted" required class="mt-1">
            <span class="text-white/80 text-sm">
              Я принимаю <NuxtLink to="/terms" target="_blank" class="text-blue-300 underline">пользовательское соглашение</NuxtLink> 
              и даю согласие на <NuxtLink to="/privacy" target="_blank" class="text-blue-300 underline">обработку персональных данных</NuxtLink>
            </span>
          </label>
        </div>

        <div class="flex gap-3 pt-4">
          <button @click="submit" :disabled="submitting" class="flex-1 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition disabled:opacity-50">
            {{ submitting ? 'Отправка...' : 'Отправить заявку' }}
          </button>
          <button @click="$emit('close')" class="px-4 py-2 bg-gray-500 text-white rounded-lg">Отмена</button>
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
  selectedCourse: {
    type: Object,
    default: null
  }
});

const authStore = useAuthStore();
const notificationStore = useNotificationStore();
const { $api } = useApi();

const emit = defineEmits(['close', 'submitted']);

const submitting = ref(false);
const agreementAccepted = ref(false);

// ✅ Отслеживаем, какие поля были тронуты (пользователь вводил и потерял фокус)
const touchedFields = ref(new Set());

// ✅ Данные из профиля пользователя
const userProfile = computed(() => authStore.user);

// ✅ Форма
const form = ref({
  name: userProfile.value?.name || '',
  last_name: userProfile.value?.last_name || '',
  email: userProfile.value?.email || '',
  phone: userProfile.value?.phone || '',
  city: userProfile.value?.city || '',
  church_name: userProfile.value?.church_name || '',
  marital_status: userProfile.value?.marital_status || '',
  gender: userProfile.value?.gender || '',
  ministry: userProfile.value?.ministry || '',
  bible_courses_experience: userProfile.value?.bible_courses_experience || '',
  learning_expectations: userProfile.value?.learning_expectations || ''
});

// ✅ Проверка, можно ли считать поле заполненным (для скрытия)
const isFieldReadyToHide = (key, value) => {
  if (key === 'phone') {
    const digits = String(value || '').replace(/\D/g, '');
    return digits.length >= 11;
  }
  
  // Email — полная проверка
  if (key === 'email') {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(String(value || ''));
  }
  
  // Для select — есть выбранное значение
  if (key === 'marital_status' || key === 'gender') {
    return !!value && value !== '';
  }
  
  // Для текстовых полей — минимум 2 символа
  if (key === 'city' || key === 'church_name' || key === 'ministry') {
    return String(value || '').trim().length >= 2;
  }
  
  // Для name, last_name
  if (key === 'name' || key === 'last_name') {
    return String(value || '').trim().length >= 2;
  }
  
  // Для textarea
  if (key === 'bible_courses_experience' || key === 'learning_expectations') {
    return String(value || '').trim().length >= 10;
  }
  
  return !!value && String(value).trim() !== '';
};

// ✅ Обработчик потери фокуса
const handleFieldBlur = (fieldKey) => {
  const value = form.value[fieldKey];
  // Если поле уже достаточно заполнено, помечаем как "завершённое"
  if (isFieldReadyToHide(fieldKey, value)) {
    touchedFields.value.add(fieldKey);
  }
};

// ✅ Поля, которые нужно показать:
// 1. Поле ещё не заполнено до нужного минимума
// 2. ИЛИ поле не было "подтверждено" потерей фокуса (пользователь ещё не переключился)
// 3. НО если поле уже было заполнено из профиля — не показываем
const missingFields = computed(() => {
  const allFields = [
    { key: 'name', label: 'Имя', required: true },
    { key: 'last_name', label: 'Фамилия', required: false },
    { key: 'email', label: 'Email', required: true },
    { key: 'phone', label: 'Телефон', required: false },
    { key: 'city', label: 'Город', required: false },
    { key: 'church_name', label: 'Церковь', required: false },
    { key: 'marital_status', label: 'Семейное положение', required: false, type: 'select', options: [
      { value: 'single', label: 'Холост/Не замужем' },
      { value: 'married', label: 'В браке' },
      { value: 'divorced', label: 'Разведён(а)' },
      { value: 'widowed', label: 'Вдова/Вдовец' }
    ]},
    { key: 'gender', label: 'Пол', required: false, type: 'select', options: [
      { value: 'male', label: 'Мужской' },
      { value: 'female', label: 'Женский' }
    ]},
    { key: 'ministry', label: 'Служение в церкви', required: false },
    { key: 'bible_courses_experience', label: 'Опыт прохождения библейских курсов', required: false, type: 'textarea' },
    { key: 'learning_expectations', label: 'Ожидания от обучения', required: false, type: 'textarea' }
  ];
  
  return allFields.filter(field => {
    const value = form.value[field.key];
    const isReady = isFieldReadyToHide(field.key, value);
    const isTouched = touchedFields.value.has(field.key);
    
    // Если поле уже заполнено из профиля (есть значение И готово к скрытию), НЕ показываем
    if (value && isReady) {
      return false;
    }
    
    // Показываем поле, если оно НЕ готово к скрытию ИЛИ не было "подтверждено" потерей фокуса
    return !(isReady && isTouched);
  });
});

const submit = async () => {
  if (!agreementAccepted.value) {
    notificationStore.warning('Внимание', 'Необходимо принять пользовательское соглашение');
    return;
  }
  
  if (!props.selectedCourse?.id) {
    notificationStore.error('Ошибка', 'Курс не выбран');
    return;
  }

  submitting.value = true;
  try {
    const response = await $api('/bible-school/enroll', {
      method: 'POST',
      body: {
        ...form.value,
        agreement_accepted: agreementAccepted.value,
        course_id: props.selectedCourse.id
      }
    });
    
    if (response.success) {
      notificationStore.success('Заявка отправлена', response.message);
      emit('submitted');
      emit('close');
    }
  } catch (err) {
    console.error('Enrollment error:', err);
    notificationStore.error('Ошибка', err.data?.message || 'Не удалось отправить заявку');
  } finally {
    submitting.value = false;
  }
};
</script>

<style scoped>
select option {
  background-color: #1e293b;
  color: #ffffff;
}
</style>