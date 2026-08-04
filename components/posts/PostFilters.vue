<template>
  <div
    class="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 mb-8"
  >
    <h3 class="text-lg font-semibold text-white mb-4">Фильтры</h3>

    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
      <!-- Категории (Спикеры) -->
      <div>
        <label class="block text-white/80 mb-2">
          Спикер
          <span v-if="!hasAvailableCategories" class="text-red-300 text-xs ml-2"
            >(нет доступных)</span
          >
        </label>
        <select
          v-model="selectedCategory"
          @change="updateFilter('category_id', selectedCategory)"
          class="w-full px-4 py-2 bg-white/20 border border-white/30 rounded-lg text-white focus:outline-none focus:border-blue-400 transition disabled:opacity-50"
          :disabled="!hasAvailableCategories"
        >
          <option :value="null" class="bg-gray-800 text-white">
            Все спикеры
          </option>
          <option
            v-for="category in availableCategories"
            :key="category.id"
            :value="category.id"
            class="bg-gray-800 text-white"
          >
            {{ category.title }} ({{ category.posts_count || 0 }})
          </option>
        </select>
        <p
          v-if="!hasAvailableCategories && selectedCategory"
          class="text-red-300 text-xs mt-1"
        >
          Нет спикеров для выбранных фильтров
        </p>
      </div>

      <!-- Группы (Год) -->
      <div>
        <label class="block text-white/80 mb-2">
          Год
          <span v-if="!hasAvailableGroups" class="text-red-300 text-xs ml-2"
            >(нет доступных)</span
          >
        </label>
        <select
          v-model="selectedGroup"
          @change="updateFilter('group_id', selectedGroup)"
          class="w-full px-4 py-2 bg-white/20 border border-white/30 rounded-lg text-white focus:outline-none focus:border-blue-400 transition disabled:opacity-50"
          :disabled="!hasAvailableGroups"
        >
          <option :value="null" class="bg-gray-800 text-white">Все года</option>
          <option
            v-for="group in availableGroups"
            :key="group.id"
            :value="group.id"
            class="bg-gray-800 text-white"
          >
            {{ group.title }} ({{ group.posts_count || 0 }})
          </option>
        </select>
        <p
          v-if="!hasAvailableGroups && selectedGroup"
          class="text-red-300 text-xs mt-1"
        >
          Нет годов для выбранных фильтров
        </p>
      </div>

      <!-- Конференции (Мероприятия) -->
      <div>
        <label class="block text-white/80 mb-2">
          Мероприятие
          <span
            v-if="!hasAvailableConferences"
            class="text-red-300 text-xs ml-2"
            >(нет доступных)</span
          >
        </label>
        <select
          v-model="selectedConference"
          @change="updateFilter('conference_id', selectedConference)"
          class="w-full px-4 py-2 bg-white/20 border border-white/30 rounded-lg text-white focus:outline-none focus:border-blue-400 transition disabled:opacity-50"
          :disabled="!hasAvailableConferences"
        >
          <option :value="null" class="bg-gray-800 text-white">
            Все мероприятия
          </option>
          <option
            v-for="conference in availableConferences"
            :key="conference.id"
            :value="conference.id"
            class="bg-gray-800 text-white"
          >
            {{ conference.title }} ({{ conference.posts_count || 0 }})
          </option>
        </select>
        <p
          v-if="!hasAvailableConferences && selectedConference"
          class="text-red-300 text-xs mt-1"
        >
          Нет мероприятий для выбранных фильтров
        </p>
      </div>
    </div>

    <!-- Информация о количестве постов -->
    <div class="mt-4 text-white/60 text-sm">
      Найдено проповедей: {{ totalPosts || 0 }}
    </div>

    <!-- Кнопка сброса -->
    <div class="mt-4 flex justify-end">
      <AppButton
        variant="reset"
        size="sm"
        :disabled="!hasActiveFilters"
        @click="resetAll"
      >
        Сбросить все фильтры
      </AppButton>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useApi } from "~/composables/useApi";
import type { Category, Group, Conference } from "~/types/sermon";

// ✅ Типизация пропсов
interface Props {
  categories: Category[];
  groups: Group[];
  conferences: Conference[];
  modelValue: {
    category_id?: number | null;
    group_id?: number | null;
    conference_id?: number | null;
    search?: string | null;
    page?: number;
  };
  totalPosts: number;
}

const props = withDefaults(defineProps<Props>(), {
  categories: () => [],
  groups: () => [],
  conferences: () => [],
  totalPosts: 0,
  modelValue: () => ({
    category_id: null,
    group_id: null,
    conference_id: null,
    search: null,
    page: 1,
  }),
});

const emit = defineEmits<{
  (e: "update:modelValue", value: Props["modelValue"]): void;
  (e: "filter-change", key: string, value: any): void;
}>();

const { $api } = useApi();

// Локальные модели для select
const selectedCategory = ref<number | null>(
  props.modelValue.category_id ?? null,
);
const selectedGroup = ref<number | null>(props.modelValue.group_id ?? null);
const selectedConference = ref<number | null>(
  props.modelValue.conference_id ?? null,
);

// ✅ ИСПОЛЬЗУЕМ ДАННЫЕ ИЗ PROPS вместо отдельных запросов
const availableCategories = computed(() => props.categories || []);
const availableGroups = computed(() => props.groups || []);
const availableConferences = computed(() => props.conferences || []);

// Вычисляемые свойства для проверки наличия опций
const hasAvailableCategories = computed(
  () => availableCategories.value.length > 0,
);
const hasAvailableGroups = computed(() => availableGroups.value.length > 0);
const hasAvailableConferences = computed(
  () => availableConferences.value.length > 0,
);

// Проверка, есть ли активные фильтры
const hasActiveFilters = computed(() => {
  return (
    selectedCategory.value || selectedGroup.value || selectedConference.value
  );
});

// ✅ Обновление фильтра - БЕЗ дополнительных запросов
const updateFilter = (key: string, value: any) => {
  if (key === "category_id") selectedCategory.value = value;
  if (key === "group_id") selectedGroup.value = value;
  if (key === "conference_id") selectedConference.value = value;

  // ✅ Проверяем валидность выбранных значений (без запросов)
  if (
    selectedGroup.value &&
    !availableGroups.value.some((g) => g.id === selectedGroup.value)
  ) {
    selectedGroup.value = null;
    emit("filter-change", "group_id", null);
  }
  if (
    selectedConference.value &&
    !availableConferences.value.some((c) => c.id === selectedConference.value)
  ) {
    selectedConference.value = null;
    emit("filter-change", "conference_id", null);
  }

  emit("filter-change", key, value);
};

// ✅ Сброс всех фильтров - БЕЗ дополнительных запросов
const resetAll = () => {
  selectedCategory.value = null;
  selectedGroup.value = null;
  selectedConference.value = null;

  emit("filter-change", "reset", null);
};

// ✅ Убираем onMounted и watch с запросами

// ✅ Следим за изменениями props (синхронизация без запросов)
watch(
  () => props.modelValue,
  (newVal) => {
    selectedCategory.value = newVal.category_id ?? null;
    selectedGroup.value = newVal.group_id ?? null;
    selectedConference.value = newVal.conference_id ?? null;
  },
  { deep: true },
);

// ✅ Следим за изменением категорий/групп/конференций из props
watch(
  () => [props.categories, props.groups, props.conferences],
  () => {
    // Проверяем, что выбранные значения все еще валидны
    if (
      selectedCategory.value &&
      !availableCategories.value.some((c) => c.id === selectedCategory.value)
    ) {
      selectedCategory.value = null;
      emit("filter-change", "category_id", null);
    }
    if (
      selectedGroup.value &&
      !availableGroups.value.some((g) => g.id === selectedGroup.value)
    ) {
      selectedGroup.value = null;
      emit("filter-change", "group_id", null);
    }
    if (
      selectedConference.value &&
      !availableConferences.value.some((c) => c.id === selectedConference.value)
    ) {
      selectedConference.value = null;
      emit("filter-change", "conference_id", null);
    }
  },
  { deep: true },
);
</script>
