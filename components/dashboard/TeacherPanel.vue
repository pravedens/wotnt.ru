<template>
  <div class="space-y-4 md:space-y-6">
    <!-- Статистика -->
    <div class="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
      <div class="bg-white/10 backdrop-blur-lg rounded-xl md:rounded-2xl p-3 md:p-4 text-center border border-white/20">
        <p class="text-xl md:text-2xl font-bold text-white">{{ stats.courses_count || 0 }}</p>
        <p class="text-white/60 text-xs md:text-sm">Курсов</p>
      </div>
      <div class="bg-white/10 backdrop-blur-lg rounded-xl md:rounded-2xl p-3 md:p-4 text-center border border-white/20">
        <p class="text-xl md:text-2xl font-bold text-white">{{ stats.lessons_count || 0 }}</p>
        <p class="text-white/60 text-xs md:text-sm">Уроков</p>
      </div>
      <div class="bg-white/10 backdrop-blur-lg rounded-xl md:rounded-2xl p-3 md:p-4 text-center border border-white/20">
        <p class="text-xl md:text-2xl font-bold text-white">{{ stats.students_count || 0 }}</p>
        <p class="text-white/60 text-xs md:text-sm">Студентов</p>
      </div>
      <div class="bg-white/10 backdrop-blur-lg rounded-xl md:rounded-2xl p-3 md:p-4 text-center border border-white/20">
        <p class="text-xl md:text-2xl font-bold text-white">{{ pendingEssaysCount }}</p>
        <p class="text-white/60 text-xs md:text-sm">Эссе на проверку</p>
      </div>
    </div>

    <!-- Кнопки быстрого доступа -->
    <div class="flex flex-wrap gap-2 md:gap-3 pb-4 border-b border-white/20">
      <NuxtLink to="/teacher/courses" class="px-3 py-1.5 md:px-4 md:py-2 bg-purple-500/80 text-white rounded-lg hover:bg-purple-600 transition text-xs md:text-sm">
        📚 Курсы
      </NuxtLink>
      <NuxtLink to="/teacher/lessons" class="px-3 py-1.5 md:px-4 md:py-2 bg-purple-500/80 text-white rounded-lg hover:bg-purple-600 transition text-xs md:text-sm">
        📖 Уроки
      </NuxtLink>
      <NuxtLink to="/teacher/themes" class="px-3 py-1.5 md:px-4 md:py-2 bg-purple-500/80 text-white rounded-lg hover:bg-purple-600 transition text-xs md:text-sm">
        📂 Темы
      </NuxtLink>
      <NuxtLink to="/teacher/questions" class="px-3 py-1.5 md:px-4 md:py-2 bg-purple-500/80 text-white rounded-lg hover:bg-purple-600 transition text-xs md:text-sm">
        📝 Вопросы
      </NuxtLink>
    </div>

    <!-- Вкладки -->
    <div class="overflow-x-auto pb-2 -mx-4 px-4">
      <div class="flex gap-2 min-w-max">
        <button 
          @click="activeTeacherTab = 'students'"
          class="px-3 py-1.5 md:px-4 md:py-2 rounded-lg transition text-sm md:text-base whitespace-nowrap"
          :class="activeTeacherTab === 'students' ? 'bg-blue-500 text-white' : 'text-white/60 hover:text-white'"
        >
          👨‍🎓 Студенты
        </button>
        <button 
          @click="activeTeacherTab = 'essays'"
          class="px-3 py-1.5 md:px-4 md:py-2 rounded-lg transition text-sm md:text-base whitespace-nowrap relative"
          :class="activeTeacherTab === 'essays' ? 'bg-blue-500 text-white' : 'text-white/60 hover:text-white'"
        >
          📝 Эссе
          <span 
            v-if="pendingEssaysCount > 0" 
            class="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center"
          >
            {{ pendingEssaysCount > 9 ? '9+' : pendingEssaysCount }}
          </span>
        </button>
        <button 
          @click="activeTeacherTab = 'chats'"
          class="px-3 py-1.5 md:px-4 md:py-2 rounded-lg transition text-sm md:text-base whitespace-nowrap"
          :class="activeTeacherTab === 'chats' ? 'bg-blue-500 text-white' : 'text-white/60 hover:text-white'"
        >
          💬 Чаты
        </button>
        <button 
          @click="activeTeacherTab = 'enrollments'"
          class="px-3 py-1.5 md:px-4 md:py-2 rounded-lg transition text-sm md:text-base whitespace-nowrap relative"
          :class="activeTeacherTab === 'enrollments' ? 'bg-blue-500 text-white' : 'text-white/60 hover:text-white'"
        >
          📋 Заявки
          <span 
            v-if="pendingEnrollmentsCount > 0" 
            class="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center"
          >
            {{ pendingEnrollmentsCount > 9 ? '9+' : pendingEnrollmentsCount }}
          </span>
        </button>
        <button 
          @click="activeTeacherTab = 'rejected'"
          class="px-3 py-1.5 md:px-4 md:py-2 rounded-lg transition text-sm md:text-base whitespace-nowrap"
          :class="activeTeacherTab === 'rejected' ? 'bg-red-500 text-white' : 'text-white/60 hover:text-white'"
        >
          ❌ Отклонённые
        </button>
      </div>
    </div>

    <!-- ========== СПИСОК СТУДЕНТОВ ========== -->
    <div v-show="activeTeacherTab === 'students'" class="bg-white/10 backdrop-blur-lg rounded-xl md:rounded-2xl p-4 md:p-6 border border-white/20">
      <div class="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3 mb-4">
        <h3 class="text-lg md:text-xl font-bold text-white">👨‍🎓 Управление учениками</h3>
        <div class="flex flex-col sm:flex-row gap-2">
          <input 
            v-model="studentSearch"
            type="text"
            placeholder="Поиск..."
            class="px-3 py-1.5 bg-white/10 border border-white/20 rounded-lg text-white text-sm"
          >
          <select v-model="filterYear" class="px-3 py-1.5 bg-white/10 border border-white/20 rounded-lg text-white text-sm">
            <option class="bg-gray-800 text-white" :value="null">Все годы</option>
            <option class="bg-gray-800 text-white" v-for="year in availableYears" :key="year" :value="year">{{ year }}</option>
          </select>
          <button @click="loadStudents" class="px-3 py-1.5 bg-blue-500 text-white rounded-lg text-sm hover:bg-blue-600">
            🔄
          </button>
        </div>
      </div>      
      <div v-if="loadingStudents" class="text-center py-8">
        <div class="animate-spin rounded-full h-8 w-8 border-2 border-white border-t-transparent mx-auto"></div>
      </div>
      
      <div v-else-if="filteredStudents.length === 0" class="text-center py-8 text-white/60">
        Нет учеников
      </div>
      
      <div v-else class="overflow-x-auto">
        <table class="w-full text-white/80 text-xs md:text-sm">
          <thead class="border-b border-white/20">
            <tr>
              <th class="text-left py-2 md:py-3">Аватар</th>
              <th class="text-left py-2 md:py-3">ФИО</th>
              <th class="text-left py-2 md:py-3 hidden md:table-cell">Email</th>
              <th class="text-left py-2 md:py-3">Прогресс</th>
              <th class="text-left py-2 md:py-3 hidden lg:table-cell">Год</th>
              <th class="text-left py-2 md:py-3 hidden lg:table-cell">Курс</th>
              <th class="text-left py-2 md:py-3">Роль</th>
              <th class="text-left py-2 md:py-3">Действия</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="student in filteredStudents" :key="student.id" class="border-b border-white/10">
              <td class="py-2 md:py-3">
                <img :src="student.avatar_url || '/images/default-avatar.png'" class="w-8 h-8 md:w-10 md:h-10 rounded-full object-cover">
              </td>
              <td class="py-2 md:py-3 font-medium">
                <div class="truncate max-w-[100px] md:max-w-none">{{ student.full_name }}</div>
                <div class="text-white/40 text-xs md:hidden">{{ student.email }}</div>
              </td>
              <td class="py-2 md:py-3 hidden md:table-cell">{{ student.email }}</td>
              <td class="py-2 md:py-3">
                <div class="flex items-center gap-1 md:gap-2">
                  <div class="w-16 md:w-24 bg-white/20 rounded-full h-1.5 md:h-2">
                    <div class="bg-blue-500 h-1.5 md:h-2 rounded-full" :style="{ width: (student.progress?.percentage || 0) + '%' }"></div>
                  </div>
                  <span class="text-xs">{{ student.progress?.percentage || 0 }}%</span>
                </div>
              </td>
              <td class="py-2 md:py-3 hidden lg:table-cell">{{ student.enrolled_year || '—' }}</td>
              <td class="py-2 md:py-3 hidden lg:table-cell">
                <div class="truncate max-w-[120px]" :title="student.assigned_course || '—'">
                  {{ student.assigned_course || '—' }}
                </div>
              </td>
              <td class="py-2 md:py-3">
                <select 
                  v-model="student.role"
                  @change="updateStudentRole(student.id, student.role)"
                  class="bg-gray-800 text-white border border-white/20 rounded-lg px-1 md:px-2 py-1 text-xs md:text-sm"
                >
                  <option value="student">Ученик</option>
                  <option value="group_leader">Лидер</option>
                </select>
              </td>
              <td class="py-2 md:py-3">
                <div class="flex flex-wrap gap-1 md:gap-2">
                  <button 
                    @click="openTeacherMessageModal(student)"
                    class="px-1.5 py-1 md:px-2 bg-blue-500 text-white rounded-lg text-xs hover:bg-blue-600"
                    title="Написать"
                  >
                    ✉️
                  </button>
                  <button 
                    @click="viewStudentProgress(student)"
                    class="px-1.5 py-1 md:px-2 bg-green-500 text-white rounded-lg text-xs hover:bg-green-600"
                    title="Прогресс"
                  >
                    📊
                  </button>
                  <button 
                    @click="removeStudentRole(student.id)"
                    class="px-1.5 py-1 md:px-2 bg-red-500 text-white rounded-lg text-xs hover:bg-red-600"
                    title="Снять роль"
                  >
                    🗑️
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- ========== ЭССЕ НА ПРОВЕРКУ ========== -->
    <div v-show="activeTeacherTab === 'essays'" class="bg-white/10 backdrop-blur-lg rounded-xl md:rounded-2xl p-4 md:p-6 border border-white/20">
      <div class="flex justify-between items-center mb-4">
        <h3 class="text-lg md:text-xl font-bold text-white">📝 Эссе на проверку</h3>
        <button @click="loadEssays" class="px-3 py-1.5 bg-blue-500 text-white rounded-lg text-sm">🔄</button>
      </div>
      
      <div v-if="loadingEssays" class="text-center py-8">
        <div class="animate-spin rounded-full h-8 w-8 border-2 border-white border-t-transparent mx-auto"></div>
      </div>
      
      <div v-else-if="pendingEssays.length === 0" class="text-center py-8 text-white/60">
        Нет эссе на проверку
      </div>
      
      <div v-else class="space-y-3 md:space-y-4">
        <div v-for="essay in pendingEssays" :key="essay.id" class="bg-white/5 rounded-lg md:rounded-xl p-3 md:p-4 border border-white/10">
          <div class="flex flex-wrap justify-between items-start gap-2 mb-2">
            <div>
              <p class="text-white font-semibold text-sm md:text-base">{{ essay.user?.full_name || essay.user?.name }}</p>
              <p class="text-white/60 text-xs">Урок: {{ essay.lesson?.title }}</p>
            </div>
            <button 
              @click="openEssayModal(essay)"
              class="px-3 py-1.5 bg-green-500 text-white rounded-lg text-sm hover:bg-green-600"
            >
              Проверить
            </button>
          </div>
          <div class="bg-white/5 rounded-lg p-2 md:p-3 max-h-24 md:max-h-32 overflow-y-auto">
            <p class="text-white/70 text-xs md:text-sm whitespace-pre-wrap">{{ essay.content }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- ========== ЧАТЫ С УЧЕНИКАМИ ========== -->
    <div v-show="activeTeacherTab === 'chats'" class="bg-white/10 backdrop-blur-lg rounded-xl md:rounded-2xl p-4 md:p-6 border border-white/20">
      <h3 class="text-lg md:text-xl font-bold text-white mb-4">💬 Чаты с учениками</h3>
      
      <div v-if="loadingStudents" class="text-center py-8">
        <div class="animate-spin rounded-full h-8 w-8 border-2 border-white border-t-transparent mx-auto"></div>
      </div>
      
      <div v-else-if="studentsList.length === 0" class="text-center py-8 text-white/60">
        Нет учеников
      </div>
      
      <div v-else class="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
        <div 
          v-for="student in studentsList" 
          :key="student.id"
          class="bg-white/5 rounded-lg md:rounded-xl p-3 md:p-4 flex justify-between items-center"
        >
          <div class="flex items-center gap-2 md:gap-3">
            <img :src="student.avatar_url || '/images/default-avatar.png'" class="w-8 h-8 md:w-10 md:h-10 rounded-full object-cover">
            <div class="min-w-0">
              <p class="text-white font-medium text-sm md:text-base truncate max-w-[120px] md:max-w-none">{{ student.full_name }}</p>
              <p class="text-white/40 text-xs truncate max-w-[100px] md:max-w-none">{{ student.email }}</p>
            </div>
          </div>
          <button 
            @click="openStudentChat(student)"
            class="px-2 py-1 md:px-3 md:py-1.5 bg-purple-500 text-white rounded-lg text-xs md:text-sm hover:bg-purple-600"
          >
            Чат
          </button>
        </div>
      </div>
    </div>

    <!-- ========== ЗАЯВКИ НА ОБУЧЕНИЕ (PENDING) ========== -->
    <div v-show="activeTeacherTab === 'enrollments'" class="bg-white/10 backdrop-blur-lg rounded-xl md:rounded-2xl p-4 md:p-6 border border-white/20">
      <div class="flex justify-between items-center mb-4">
        <h3 class="text-lg md:text-xl font-bold text-white">📋 Новые заявки</h3>
        <button @click="loadEnrollments" class="px-3 py-1.5 bg-blue-500 text-white rounded-lg text-sm">🔄</button>
      </div>
      
      <div v-if="loadingEnrollments" class="text-center py-8">
        <div class="animate-spin rounded-full h-8 w-8 border-2 border-white border-t-transparent mx-auto"></div>
      </div>
      
      <div v-else-if="enrollmentRequests.length === 0" class="text-center py-8 text-white/60">
        Нет новых заявок
      </div>
      
      <div v-else class="space-y-3 md:space-y-4">
        <div v-for="request in enrollmentRequests" :key="request.id" class="bg-white/5 rounded-lg md:rounded-xl p-3 md:p-5 border border-white/10">
          <div class="flex flex-col md:flex-row md:justify-between md:items-start gap-3">
            <div class="flex-1">
              <p class="text-white font-semibold text-sm md:text-base">{{ request.user?.full_name || request.user?.name }}</p>
              <p class="text-white/60 text-xs md:text-sm">{{ request.user?.email }}</p>
              <div class="grid grid-cols-2 gap-1 md:gap-2 mt-2 text-xs md:text-sm">
                <p><span class="text-white/40">Город:</span> {{ request.city || '—' }}</p>
                <p><span class="text-white/40">Церковь:</span> {{ request.church_name || '—' }}</p>
                <p class="col-span-2"><span class="text-white/40">Служение:</span> {{ request.ministry || '—' }}</p>
              </div>
              <p v-if="request.about" class="mt-2 text-white/60 text-xs line-clamp-2">📝 {{ request.about }}</p>
            </div>
            <div class="flex flex-col sm:flex-row gap-2">
              <select v-model="selectedCourseForRequest[request.id]" class="px-2 py-1.5 bg-white/10 border border-white/20 rounded-lg text-xs md:text-sm">
                <option :value="null">Выберите курс</option>
                <option v-for="course in coursesList" :key="course.id" :value="course.id">
                  {{ course.title }}
                </option>
              </select>
              <div class="flex gap-2">
                <button 
                  @click="approveRequest(request.id)"
                  :disabled="!selectedCourseForRequest[request.id]"
                  class="px-3 py-1.5 bg-green-500 text-white rounded-lg text-sm hover:bg-green-600 disabled:opacity-50"
                >
                  ✅
                </button>
                <button 
                  @click="rejectRequest(request.id)"
                  class="px-3 py-1.5 bg-red-500 text-white rounded-lg text-sm hover:bg-red-600"
                >
                  ❌
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- ========== ОТКЛОНЁННЫЕ ЗАЯВКИ ========== -->
    <div v-show="activeTeacherTab === 'rejected'" class="bg-white/10 backdrop-blur-lg rounded-xl md:rounded-2xl p-4 md:p-6 border border-white/20">
      <div class="flex justify-between items-center mb-4">
        <h3 class="text-lg md:text-xl font-bold text-white">❌ Отклонённые заявки</h3>
        <button @click="loadRejectedEnrollments" class="px-3 py-1.5 bg-blue-500 text-white rounded-lg text-sm">🔄</button>
      </div>
      
      <div v-if="loadingRejected" class="text-center py-8">
        <div class="animate-spin rounded-full h-8 w-8 border-2 border-white border-t-transparent mx-auto"></div>
      </div>
      
      <div v-else-if="rejectedRequests.length === 0" class="text-center py-8 text-white/60">
        Нет отклонённых заявок
      </div>
      
      <div v-else class="space-y-3 md:space-y-4">
        <div v-for="request in rejectedRequests" :key="request.id" class="bg-white/5 rounded-lg md:rounded-xl p-3 md:p-5 border border-white/10">
          <div class="flex flex-col md:flex-row md:justify-between md:items-start gap-3">
            <div class="flex-1">
              <p class="text-white font-semibold text-sm md:text-base">{{ request.user?.full_name || request.user?.name }}</p>
              <p class="text-white/60 text-xs md:text-sm">{{ request.user?.email }}</p>
              <div class="grid grid-cols-2 gap-1 md:gap-2 mt-2 text-xs md:text-sm">
                <p><span class="text-white/40">Город:</span> {{ request.city || '—' }}</p>
                <p><span class="text-white/40">Церковь:</span> {{ request.church_name || '—' }}</p>
                <p class="col-span-2"><span class="text-white/40">Служение:</span> {{ request.ministry || '—' }}</p>
              </div>
              <p v-if="request.about" class="mt-2 text-white/60 text-xs line-clamp-2">📝 {{ request.about }}</p>
            </div>
            <div class="flex gap-2">
              <button 
                @click="unblockUser(request.user_id)"
                class="px-3 py-1.5 bg-yellow-500 text-white rounded-lg text-sm hover:bg-yellow-600"
                title="Разблокировать пользователя для повторной подачи заявки"
              >
                🔓 Разблокировать
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Модальные окна -->
    <EssayReviewModal 
      v-if="selectedEssay"
      :essay="selectedEssay"
      @close="selectedEssay = null"
      @reviewed="onEssayReviewed"
    />

    <TeacherMessageModal 
      v-if="selectedStudent"
      :student="selectedStudent"
      @close="selectedStudent = null"
      @sent="onMessageSent"
    />

    <StudentChatModal
      v-if="chatStudent"
      :student="chatStudent"
      @close="chatStudent = null"
    />
    
    <TeacherChatModal 
    v-if="chatModalVisible"
    :visible="chatModalVisible"
    :student="chatStudent"
    @close="chatModalVisible = false"
  />
  </div>
</template>

<script setup>
import { useAuthStore } from '~/stores/auth';
import { useNotificationStore } from '~/stores/notification';
import { useApi } from '~/composables/useApi';
import EssayReviewModal from '~/components/dashboard/EssayReviewModal.vue';
import TeacherChatModal from '~/components/dashboard/TeacherChatModal.vue';

const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  }
})

const authStore = useAuthStore();
const notificationStore = useNotificationStore();
const { $api } = useApi();

// State
const activeTeacherTab = ref('students');
const stats = ref({});
const studentsList = ref([]);
const coursesList = ref([]);
const pendingEssays = ref([]);
const enrollmentRequests = ref([]);
const rejectedRequests = ref([]);
const studentSearch = ref('');
const selectedCourseForRequest = ref({});
const loadingStudents = ref(false);
const loadingCourses = ref(false);
const loadingEssays = ref(false);
const loadingEnrollments = ref(false);
const loadingRejected = ref(false);
const pendingEssaysCount = ref(0);
const filterYear = ref(null);
const availableYears = ref([]);
const pendingEnrollmentsCount = ref(0);

// Модальные окна
const selectedEssay = ref(null);
const selectedStudent = ref(null);
const chatStudent = ref(null);
const chatModalVisible = ref(false);

// Вычисляемые свойства
const filteredStudents = computed(() => {
  if (!studentsList.value || !Array.isArray(studentsList.value)) {
    return [];
  }
  
  let result = studentsList.value;
  
  if (studentSearch.value) {
    const search = studentSearch.value.toLowerCase();
    result = result.filter(s => 
      s.full_name?.toLowerCase().includes(search) || 
      s.email?.toLowerCase().includes(search)
    );
  }
  
  if (filterYear.value) {
    result = result.filter(s => s.enrolled_year === filterYear.value);
  }
  
  return result;
});

const getMaritalStatusLabel = (status) => {
  const map = {
    single: 'Холост/Не замужем',
    married: 'В браке',
    divorced: 'Разведён(а)',
    widowed: 'Вдова/Вдовец'
  };
  return map[status] || '—';
};

// Загрузка данных
const loadDashboard = async () => {
  try {
    const response = await $api('/bible-school/teacher/dashboard');
    stats.value = response;
    pendingEssays.value = response.pending_essays || [];
    pendingEssaysCount.value = response.pending_essays?.length || 0;
    enrollmentRequests.value = response.enrollment_requests || [];
  } catch (err) {
    console.error('Load dashboard error:', err);
  }
};

const loadCourses = async () => {
  loadingCourses.value = true;
  try {
    const response = await $api('/bible-school/courses');
    coursesList.value = response.courses || [];
  } catch (err) {
    console.error('Load courses error:', err);
  } finally {
    loadingCourses.value = false;
  }
};

const loadStudents = async () => {
  loadingStudents.value = true;
  try {
    const response = await $api('/bible-school/teacher/students');
    studentsList.value = response.students || response || [];
    
    const years = studentsList.value
      .map(s => s.enrolled_year)
      .filter(year => year !== null && year !== undefined && year !== '');
    
    availableYears.value = [...new Set(years)].sort().reverse();
  } catch (err) {
    console.error('Load students error:', err);
  } finally {
    loadingStudents.value = false;
  }
};

const loadEssays = async () => {
  loadingEssays.value = true;
  try {
    const response = await $api('/bible-school/teacher/dashboard');
    pendingEssays.value = response.pending_essays || [];
    pendingEssaysCount.value = response.pending_essays?.length || 0;
  } catch (err) {
    console.error('Load essays error:', err);
  } finally {
    loadingEssays.value = false;
  }
};

const loadEnrollments = async () => {
  loadingEnrollments.value = true;
  try {
    const response = await $api('/bible-school/teacher/dashboard');
    enrollmentRequests.value = response.enrollment_requests || [];
    pendingEnrollmentsCount.value = enrollmentRequests.value.length;
  } catch (err) {
    console.error('Load enrollments error:', err);
  } finally {
    loadingEnrollments.value = false;
  }
};

const loadRejectedEnrollments = async () => {
  loadingRejected.value = true;
  try {
    const response = await $api('/bible-school/teacher/dashboard');
    rejectedRequests.value = response.rejected_requests || [];
  } catch (err) {
    console.error('Load rejected enrollments error:', err);
  } finally {
    loadingRejected.value = false;
  }
};

// Действия со студентами
const updateStudentRole = async (userId, role) => {
  if (!authStore.isAuthenticated || !authStore.isTeacher) {
    notificationStore.error('Ошибка', 'Недостаточно прав');
    return;
  }
  
  try {
    await $api(`/bible-school/teacher/students/${userId}/role`, {
      method: 'PUT',
      body: { role }
    });
    notificationStore.success('Роль обновлена', `Пользователь теперь ${role === 'group_leader' ? 'лидер группы' : 'ученик'}`);
    
    const student = studentsList.value.find(s => s.id === userId);
    if (student) {
      student.role = role;
    }
  } catch (err) {
    notificationStore.error('Ошибка', 'Не удалось обновить роль');
  }
};

const removeStudentRole = async (userId) => {
  if (!authStore.isAuthenticated || !authStore.isTeacher) {
    notificationStore.error('Ошибка', 'Недостаточно прав');
    return;
  }
  
  if (!confirm('Снять все роли (кроме user)?')) return;
  try {
    await $api(`/bible-school/teacher/students/${userId}/role`, {
      method: 'DELETE'
    });
    notificationStore.success('Роль снята', 'Пользователь больше не ученик');
    await loadStudents();
  } catch (err) {
    notificationStore.error('Ошибка', 'Не удалось снять роль');
  }
};

const viewStudentProgress = (student) => {
  alert(`📊 Прогресс ${student.full_name}:\n\n` +
        `Общий прогресс: ${student.progress?.percentage || 0}%\n` +
        `Пройдено уроков: ${student.progress?.completed || 0} из ${student.progress?.total || 0}\n` +
        `Назначенный курс: ${student.assigned_course || 'Все курсы'}`);
};

// Действия с заявками
const approveRequest = async (requestId) => {
  if (!authStore.isAuthenticated || !authStore.isTeacher) {
    notificationStore.error('Ошибка', 'Недостаточно прав');
    return;
  }
  
  const courseId = selectedCourseForRequest.value[requestId];
  if (!courseId) {
    notificationStore.warning('Внимание', 'Выберите курс');
    return;
  }
  
  try {
    await $api(`/bible-school/enrollment-requests/${requestId}/approve`, {
      method: 'POST',
      body: { course_id: courseId }
    });
    notificationStore.success('Заявка одобрена', 'Ученик зачислен');
    await loadEnrollments();
    await loadStudents();
  } catch (err) {
    notificationStore.error('Ошибка', 'Не удалось одобрить заявку');
  }
};

const rejectRequest = async (requestId) => {
  if (!authStore.isAuthenticated || !authStore.isTeacher) {
    notificationStore.error('Ошибка', 'Недостаточно прав');
    return;
  }
  
  if (!confirm('Отклонить заявку?')) return;
  try {
    await $api(`/bible-school/enrollment-requests/${requestId}/reject`, {
      method: 'POST'
    });
    notificationStore.warning('Заявка отклонена', 'Ученик не зачислен');
    await loadEnrollments();
  } catch (err) {
    notificationStore.error('Ошибка', 'Не удалось отклонить заявку');
  }
};

// Разблокировка пользователя
const unblockUser = async (userId) => {
  if (!authStore.isAuthenticated || !authStore.isTeacher) {
    notificationStore.error('Ошибка', 'Недостаточно прав');
    return;
  }
  
  if (!confirm('Разблокировать пользователя? Он сможет подать новую заявку.')) return;
  
  try {
    await $api(`/bible-school/enroll/unblock/${userId}`, { method: 'POST' });
    notificationStore.success('Доступ восстановлен', 'Пользователь может подать новую заявку');
    await loadEnrollments();
    await loadRejectedEnrollments();
    await loadStudents();
  } catch (err) {
    console.error('Unblock error:', err);
    notificationStore.error('Ошибка', 'Не удалось разблокировать пользователя');
  }
};

// Эссе
const openEssayModal = (essay) => {
  if (!authStore.isAuthenticated || !authStore.isTeacher) return;
  selectedEssay.value = essay;
};

const onEssayReviewed = () => {
  selectedEssay.value = null;
  loadEssays();
  loadDashboard();
};

// Сообщения и чаты
const openTeacherMessageModal = (student) => {
  if (!authStore.isAuthenticated || !authStore.isTeacher) return;
  selectedStudent.value = student;
};

const onMessageSent = () => {
  selectedStudent.value = null;
  notificationStore.success('Сообщение отправлено', 'Ученик получит уведомление');
};

const openStudentChat = (student) => {
  chatStudent.value = student;
  chatModalVisible.value = true;
};

// ============================================
// ФУНКЦИЯ ДЛЯ ВЫБОРА УЧЕНИКА
// ============================================
const selectStudent = (student) => {
  if (!student) return
  
  // Проверяем, есть ли уже беседа с этим учеником
  const { $api } = useApi()
  
  // Найти или создать беседу
  $api('/bible-school/chat/conversations/find-or-create', {
    method: 'POST',
    body: { user_id: student.id }
  }).then(response => {
    if (response.success) {
      const conversationId = response.data.conversation_id
      chatStudent.value = student
      chatModalVisible.value = true
      
      // Загрузить сообщения
      const chatStore = useChatStore()
      chatStore.loadMessages(conversationId)
    }
  }).catch(err => {
    console.error('Ошибка создания беседы:', err)
    notificationStore.error('Ошибка', 'Не удалось открыть чат')
  })
}

watch(() => props.student, (newStudent) => {
  if (newStudent) {
    selectStudent(newStudent)
  }
}, { immediate: true })

// Монтирование
onMounted(async () => {
  if (!authStore.isAuthenticated || !authStore.isTeacher) {
    return;
  }
  
  await loadStudents();
  await Promise.all([
    loadDashboard(),
    loadCourses(),
    loadStudents(),
    loadEnrollments()
  ]);
  await loadRejectedEnrollments();
});
</script>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>