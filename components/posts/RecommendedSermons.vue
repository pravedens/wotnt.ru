<template>
  <div class="w-full max-w-7xl mx-auto mb-12 px-4">
    <!-- Заголовок -->
    <div class="flex flex-wrap items-center justify-between gap-3 mb-6">
      <h2 class="text-2xl sm:text-3xl font-bold text-white">
        📖 Рекомендуемые проповеди
      </h2>
      <AppButton to="/sermons" variant="ghost-light" size="sm">
        Все проповеди
        <template #right-icon>
          <svg
            class="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M9 5l7 7-7 7"
            />
          </svg>
        </template>
      </AppButton>
    </div>

    <!-- Нет проповедей -->
    <div
      v-if="sermons.length === 0"
      class="bg-white/10 backdrop-blur-lg rounded-2xl p-12 text-center"
    >
      <p class="text-white/80 text-lg">Нет рекомендуемых проповедей</p>
    </div>

    <!-- Сетка проповедей -->
    <div
      v-else
      class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6"
    >
      <div v-for="sermon in sermons" :key="sermon.id" class="h-full">
        <h3 class="sr-only">{{ sermon.title }}</h3>
        <PostCard :post="sermon" :stats="getPostStats(sermon.id)" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useStatsStore } from "~/stores/stats";
import PostCard from "~/components/posts/PostCard.vue";
import type { Post } from "~/types/sermon";

// ============================================
// ПРОПСЫ
// ============================================
const props = defineProps<{
  posts: Post[];
}>();

// ============================================
// COMPOSABLES
// ============================================
const statsStore = useStatsStore();

// ============================================
// ВЫЧИСЛЯЕМЫЕ СВОЙСТВА
// ============================================
const sermons = computed(() => props.posts || []);

const getPostStats = (postId: number) => {
  return statsStore.getPostStats(postId);
};

// ============================================
// ЖИЗНЕННЫЙ ЦИКЛ
// ============================================
onMounted(() => {
  // Загружаем статистику для всех постов одним запросом
  if (sermons.value.length) {
    const postIds = sermons.value.map((p) => p.id);
    statsStore.fetchMultipleStats(postIds);
  }
});
</script>

<style scoped>
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border-width: 0;
}
</style>
