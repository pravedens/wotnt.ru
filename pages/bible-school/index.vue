<template>
  <div class="min-h-screen bg-gradient-to-br from-blue-900 to-purple-900 py-12">
    <div class="container mx-auto px-4">
      
      <!-- Для учителей -->
      <div v-if="isTeacher && !isSuperAdmin" class="mb-8 max-w-2xl mx-auto">
        <div class="bg-green-500/20 border border-green-500/50 rounded-2xl p-6 text-center">
          <p class="text-green-400 text-lg mb-2">👨‍🏫 Вы вошли как преподаватель</p>
          <p class="text-white/70 mb-4">Управляйте студентами, проверяйте эссе и отслеживайте прогресс</p>
          <NuxtLink 
            to="https://wotgospel.ru/admin/login"
            class="inline-block px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
          >
            Перейти в панель учителя →
          </NuxtLink>
        </div>
      </div>
      
      <!-- Статус-бар -->
      <div v-if="pageData.message && !isTeacher" class="mb-8 max-w-2xl mx-auto">
        <div class="rounded-2xl p-4 text-center border" :class="statusClass">
          <p class="text-white">{{ pageData.message }}</p>
          <NuxtLink 
            v-if="pageData.enrollment_status === 'guest'"
            to="/auth/register"
            class="mt-3 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition text-sm inline-block"
          >
            Зарегистрироваться
          </NuxtLink>
        </div>
      </div>
      
      <!-- ========== СПИСОК КУРСОВ ========== -->
      <div v-if="coursesList.length > 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
        <div v-for="course in coursesList" :key="course.id" class="bg-white/10 backdrop-blur-lg rounded-2xl overflow-hidden border border-white/20 hover:bg-white/15 transition-all group flex flex-col">
          <img 
            v-if="getImageUrl(course.image_url)" 
            :src="getImageUrl(course.image_url)" 
            :alt="course.title"
            class="w-full h-48 object-cover"
          >
          <div v-else class="w-full h-48 bg-gradient-to-r from-blue-500/30 to-purple-500/30 flex items-center justify-center">
            <span class="text-white/50 text-4xl">📖</span>
          </div>
          <div class="p-6 flex flex-col flex-1">
            <h3 class="text-xl font-bold text-white mb-2">{{ course.title }}</h3>
            <p class="text-white/60 text-sm line-clamp-2" v-html="stripTags(course.description)"></p>
            
            <div class="mt-4">
              <!-- Гость: кнопка "Подробнее" -->
              <button 
                v-if="pageData.enrollment_status === 'guest'"
                @click="openCoursePreview(course)"
                class="w-full px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
              >
                📖 Подробнее
              </button>
              
              <!-- Авторизованный, не студент и нет заявки: кнопка "Хочу учиться" (без анкеты) -->
              <button 
  v-else-if="pageData.enrollment_status === 'none'"
  @click="openEnrollmentModalWithCourse(course)"
  class="w-full px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition"
>
  📝 Заполнить анкету
</button>
              
              <!-- Заявка на рассмотрении -->
              <div v-else-if="pageData.enrollment_status === 'pending'" class="text-center py-2 text-yellow-400">
                ⏳ Заявка на рассмотрении
              </div>
              
              <!-- Студент: кнопки обучения -->
              <template v-else-if="pageData.enrollment_status === 'approved'">
                <NuxtLink 
                  v-if="course.progress && course.progress.percentage < 100"
                  :to="`/bible-school/courses/${course.slug}`"
                  class="block w-full text-center px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition"
                >
                  ▶️ Продолжить ({{ course.progress.percentage }}%)
                </NuxtLink>
                <button 
                  v-else-if="course.progress && course.progress.percentage >= 100"
                  @click="repeatCourse(course)"
                  class="w-full px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition"
                >
                  🔄 Повторить курс
                </button>
                <NuxtLink 
                  v-else
                  :to="`/bible-school/courses/${course.slug}`"
                  class="block w-full text-center px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
                >
                  🚀 Начать обучение
                </NuxtLink>
              </template>
            </div>
          </div>
        </div>
      </div>

      <div v-else-if="!loading" class="text-center py-12">
        <p class="text-white/60">Курсы пока не добавлены</p>
      </div>
      
      <!-- Как проходит обучение -->
      <div class="mt-16 bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20">
        <h2 class="text-2xl font-bold text-white text-center mb-6">📖 Как проходит обучение</h2>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div class="text-center">
            <div class="text-4xl mb-3">1️⃣</div>
            <h3 class="text-lg font-semibold text-white mb-2">Зарегистрируйтесь</h3>
            <p class="text-white/60 text-sm">Создайте аккаунт на сайте</p>
          </div>
          <div class="text-center">
            <div class="text-4xl mb-3">2️⃣</div>
            <h3 class="text-lg font-semibold text-white mb-2">Подайте заявку</h3>
            <p class="text-white/60 text-sm">Нажмите «Хочу учиться» на выбранном курсе</p>
          </div>
          <div class="text-center">
            <div class="text-4xl mb-3">3️⃣</div>
            <h3 class="text-lg font-semibold text-white mb-2">Учитесь</h3>
            <p class="text-white/60 text-sm">Проходите уроки, сдавайте тесты и получайте сертификаты</p>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Наши выпускники -->
    <div v-if="graduates.length" class="mt-16 bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
      <h2 class="text-2xl font-bold text-white text-center mb-6">🎓 Наши выпускники</h2>
      
      <div class="flex flex-wrap justify-center gap-4 mb-6">
        <button 
          v-for="year in graduateYears" 
          :key="year"
          @click="selectedYear = year"
          class="px-4 py-2 rounded-full text-sm"
          :class="selectedYear === year ? 'bg-blue-500 text-white' : 'bg-white/10 text-white/70 hover:bg-white/20'"
        >
          {{ year }}
        </button>
        <button 
          @click="selectedYear = null"
          class="px-4 py-2 rounded-full text-sm"
          :class="!selectedYear ? 'bg-blue-500 text-white' : 'bg-white/10 text-white/70 hover:bg-white/20'"
        >
          Все
        </button>
      </div>
      
      <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
        <div v-for="grad in filteredGraduates" :key="grad.id" class="bg-white/5 rounded-xl p-3 text-center">
          <img :src="grad.avatar_url" class="w-16 h-16 rounded-full mx-auto object-cover">
          <p class="text-white text-sm mt-2">{{ grad.full_name }}</p>
          <p class="text-white/40 text-xs">{{ grad.course_title }}</p>
          <p class="text-white/30 text-xs">{{ grad.graduation_year }}</p>
        </div>
      </div>
    </div>

    <!-- Модальное окно обзорной программы курса (для гостей) -->
    <CoursePreviewModal
      v-if="showCoursePreviewModal"
      :course="selectedCourseForPreview"
      @close="closeCoursePreviewModal"
      @apply="handleApplyFromPreview"
    />
    
    <!-- Модальное окно анкеты -->
<EnrollmentModal 
  v-if="showModal && !isTeacher" 
  :selected-course="selectedCourseForEnrollment"
  @close="closeModal" 
  @submitted="onEnrollmentSubmitted"
/>
  </div>
</template>

<script setup>
import { useAuthStore } from '~/stores/auth';
import { useImageUrl } from '~/composables/useImageUrl';
import { useNotificationStore } from '~/stores/notification';
import { useApi } from '~/composables/useApi';  // ✅ ДОБАВЛЕН ИМПОРТ
import CoursePreviewModal from '~/components/bible-school/CoursePreviewModal.vue';
import EnrollmentModal from '~/components/bible-school/EnrollmentModal.vue';

const authStore = useAuthStore();
const notificationStore = useNotificationStore();
const { getImageUrl } = useImageUrl();
const { $api } = useApi();  // ✅ ДОБАВЛЕНО
const { isTeacher, isSuperAdmin, isAuthenticated } = storeToRefs(authStore);

const pageData = ref({
  teachers: [],
  courses: [],
  enrollment_status: 'guest',
  user_can_apply: false,
  message: null
});

const coursesList = ref([]);
const showCoursePreviewModal = ref(false);
const loading = ref(true);
const selectedCourseForPreview = ref(null);
const graduates = ref([]);
const graduateYears = ref([]);
const selectedYear = ref(null);
const showModal = ref(false);
const selectedCourseForEnrollment = ref(null);

const openEnrollmentModalWithCourse = (course) => {
  selectedCourseForEnrollment.value = course;
  showModal.value = true;
};

const closeModal = () => {
  showModal.value = false;
  selectedCourseForEnrollment.value = null;
};

const onEnrollmentSubmitted = () => {
  closeModal();
  fetchPageData();
};

const statusClass = computed(() => {
  switch (pageData.value.enrollment_status) {
    case 'approved': return 'bg-green-500/20 border-green-500/50';
    case 'pending': return 'bg-yellow-500/20 border-yellow-500/50';
    case 'rejected': return 'bg-red-500/20 border-red-500/50';
    case 'guest': return 'bg-blue-500/20 border-blue-500/50';
    default: return 'bg-blue-500/20 border-blue-500/50';
  }
});

const filteredGraduates = computed(() => {
  if (!selectedYear.value) return graduates.value;
  return graduates.value.filter(g => g.graduation_year === selectedYear.value);
});

const fetchGraduates = async () => {
  try {
    // ✅ Используем $api вместо $fetch
    const res = await $api('/bible-school/graduates');
    graduates.value = res.graduates || [];
    graduateYears.value = res.years || [];
  } catch (err) {
    console.error('Fetch graduates error:', err);
  }
};

const stripTags = (html) => {
  if (!html) return '';
  return html.replace(/<[^>]*>/g, '');
};

const fetchPageData = async () => {
  loading.value = true;
  try {
    // ✅ Используем $api вместо $fetch
    const response = await $api('/bible-school/page-data');
    pageData.value = response;
    
    // ✅ Используем $api вместо $fetch
    const coursesResponse = await $api('/bible-school/courses');
    coursesList.value = coursesResponse.courses || [];
  } catch (err) {
    console.error('Fetch page data error:', err);
  } finally {
    loading.value = false;
  }
};

const submitEnrollment = async (course) => {
  if (!isAuthenticated.value) {
    navigateTo('/auth/register');
    return;
  }
  
  try {
    // ✅ Используем $api вместо $fetch
    const response = await $api('/bible-school/enroll', {
      method: 'POST',
      body: {
        course_id: course.id,
        course_title: course.title,
        agreement_accepted: true 
      }
    });
    
    if (response.success) {
      notificationStore.success('Заявка отправлена', 'Ожидайте подтверждения');
      await fetchPageData();
    } else {
      notificationStore.error('Ошибка', response.message);
    }
  } catch (err) {
    console.error('Submit error:', err);
    notificationStore.error('Ошибка', err.data?.message || 'Не удалось отправить заявку');
  }
};

const openCoursePreview = (course) => {
  selectedCourseForPreview.value = course;
  showCoursePreviewModal.value = true;
};

const closeCoursePreviewModal = () => {
  showCoursePreviewModal.value = false;
  selectedCourseForPreview.value = null;
};

const handleApplyFromPreview = () => {
  closeCoursePreviewModal();
  if (!isAuthenticated.value) {
    navigateTo('/auth/register');
  } else {
    if (selectedCourseForPreview.value) {
      submitEnrollment(selectedCourseForPreview.value);
    }
  }
};

const repeatCourse = async (course) => {
  if (confirm('Вы уверены, что хотите повторить курс? Весь прогресс будет сброшен.')) {
    try {
      // ✅ Используем $api вместо $fetch
      await $api(`/bible-school/courses/${course.slug}/reset`, {
        method: 'POST'
      });
      alert('Курс сброшен. Можете начинать заново.');
      await fetchPageData();
    } catch (err) {
      alert('Ошибка при сбросе курса');
    }
  }
};

onMounted(() => {
  fetchPageData();
  fetchGraduates();
});
</script>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  line-clamp: 2;
  overflow: hidden;
}
</style>