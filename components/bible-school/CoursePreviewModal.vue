<template>
  <div class="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 overflow-y-auto" @click.self="$emit('close')">
    <div class="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto border border-white/20">
      
      <img 
        v-if="getImageUrl(course.image_url)" 
        :src="getImageUrl(course.image_url)" 
        :alt="course.title"
        class="w-full h-64 object-cover rounded-t-2xl"
      >
      
      <div class="p-6">
        <div class="flex justify-end">
          <button @click="$emit('close')" class="text-white/60 hover:text-white text-2xl">&times;</button>
        </div>
        
        <h2 class="text-3xl font-bold text-white mb-4">{{ course.title }}</h2>
        <div class="text-white/80 mb-6" v-html="course.description"></div>
        
        <!-- 1. Темы курса (только те, где есть уроки) -->
        <div v-if="filteredThemes.length" class="mb-6">
          <h3 class="text-xl font-semibold text-white mb-3">📚 Темы курса</h3>
          <div class="space-y-4">
            <div v-for="theme in filteredThemes" :key="theme.id" class="bg-white/5 rounded-xl p-4">
              <div class="flex justify-between items-start flex-wrap gap-2 mb-2">
                <h4 class="text-lg font-semibold text-blue-300">{{ theme.title }}</h4>
                <div v-if="theme.teacher" class="flex items-center gap-2 bg-white/10 rounded-full px-3 py-1">
                  <img :src="theme.teacher.avatar_url" class="w-6 h-6 rounded-full">
                  <span class="text-white/80 text-sm">{{ theme.teacher.full_name }}</span>
                </div>
              </div>
              <p v-if="theme.description" class="text-white/60 text-sm mb-3">{{ theme.description }}</p>
              <!-- ✅ Количество уроков с правильным склонением -->
              <div class="flex items-center gap-2 text-white/40 text-sm">
                <span>📘 {{ getLessonsCountText(theme.lessons_count || theme.lessons?.length || 0) }}</span>
              </div>
            </div>
          </div>
        </div>
        
        <!-- 2. Статусы обучения -->
        <div v-if="statuses.length" class="mb-6 bg-white/5 rounded-xl p-4">
          <h3 class="text-lg font-semibold text-white mb-3">📈 Статусы обучения</h3>
          <div class="flex flex-wrap gap-3">
            <div v-for="status in statuses" :key="status.percentage" class="px-4 py-2 bg-white/10 rounded-full text-white/80 text-sm">
              {{ status.icon }} {{ status.name }} ({{ status.percentage }}%)
            </div>
          </div>
        </div>
        
        <!-- 3. Что вы узнаете -->
        <div v-if="course.what_you_will_learn" class="mb-6 p-4 bg-blue-500/10 rounded-xl border border-blue-500/20">
          <h3 class="text-lg font-semibold text-white mb-2">🎯 Что вы узнаете</h3>
          <div class="text-white/70" v-html="course.what_you_will_learn"></div>
        </div>
        
        <!-- 4. Практические навыки -->
        <div v-if="course.skills" class="mb-6 p-4 bg-green-500/10 rounded-xl border border-green-500/20">
          <h3 class="text-lg font-semibold text-white mb-2">💡 Практические навыки</h3>
          <div class="text-white/70" v-html="course.skills"></div>
        </div>
        
        <!-- 5. Сертификат -->
        <div class="mb-6 text-center p-4 bg-yellow-500/10 rounded-xl border border-yellow-500/20">
          <p class="text-white/80 text-sm">🎓 По окончании курса вы получите именной сертификат</p>
          <p class="text-white/50 text-xs mt-1">{{ course.certificate_text || 'Успешно завершил(а) полный курс обучения' }}</p>
        </div>
        
        <!-- 6. Стоимость -->
        <div class="mb-6 text-center">
          <p class="text-white/60 text-sm">Стоимость обучения</p>
          <p class="text-3xl font-bold text-green-400">{{ course.price || 'Бесплатно' }}</p>
        </div>
        
        <!-- 7. Кнопка -->
        <div class="flex justify-center">
          <button 
            @click="handleApply"
            class="px-8 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition text-lg font-semibold"
          >
            📝 Хочу учиться
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useImageUrl } from '~/composables/useImageUrl';
import { useAuthStore } from '~/stores/auth';
import { useApi } from '~/composables/useApi';  // ✅ ДОБАВЛЕН ИМПОРТ

const props = defineProps({
  course: {
    type: Object,
    required: true
  }
});

const emit = defineEmits(['close', 'apply']);

const authStore = useAuthStore();
const { getImageUrl } = useImageUrl();
const { isAuthenticated } = storeToRefs(authStore);
const { $api } = useApi();  // ✅ ДОБАВЛЕНО

const themes = ref([]);
const statuses = ref([]);

// ✅ Правильное склонение слова "урок"
const getLessonsCountText = (count) => {
  if (count === 0) return '0 уроков';
  
  const lastDigit = count % 10;
  const lastTwoDigits = count % 100;
  
  if (lastTwoDigits >= 11 && lastTwoDigits <= 19) {
    return `${count} уроков`;
  }
  
  if (lastDigit === 1) {
    return `${count} урок`;
  }
  
  if (lastDigit >= 2 && lastDigit <= 4) {
    return `${count} урока`;
  }
  
  return `${count} уроков`;
};

// ✅ Фильтруем только те темы, в которых есть уроки
const filteredThemes = computed(() => {
  return themes.value.filter(theme => {
    const lessonsCount = theme.lessons_count || theme.lessons?.length || 0;
    return lessonsCount > 0;
  });
});

const handleApply = () => {
  if (!isAuthenticated.value) {
    navigateTo('/auth/register');
  } else {
    emit('apply');
  }
};

const fetchCourseDetails = async () => {
  try {
    // ✅ Используем $api вместо $fetch
    const response = await $api(`/bible-school/courses/${props.course.slug}/preview`);
    themes.value = response.themes || [];
    statuses.value = response.statuses || [];
    
    if (response.course) {
      props.course.what_you_will_learn = response.course.what_you_will_learn;
      props.course.skills = response.course.skills;
      props.course.price = response.course.price;
      props.course.certificate_text = response.course.certificate_text;
    }
  } catch (err) {
    console.error('Fetch course details error:', err);
  }
};

onMounted(() => {
  fetchCourseDetails();
});
</script>