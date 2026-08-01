<template>
  <div class="verse-wrapper">
    <div class="verse-container">
      <div class="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
        <div class="flex items-center gap-3 mb-4">
          <svg class="w-6 h-6 text-blue-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
          </svg>
          <h2 class="text-xl font-bold text-white">Стих дня</h2>
        </div>
        
        <div v-if="!verse" class="text-center py-8 text-white/60">
          Стих дня будет добавлен позже
        </div>
        
        <div v-else class="space-y-4">
          <div class="text-center">
            <h3 class="text-lg font-semibold text-blue-200 mb-2">{{ verse.title }}</h3>
            <div class="text-white/90 text-lg leading-relaxed italic prose prose-invert max-w-none">
              <div v-html="cleanDescription"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { BibleVerse } from '~/types/bible'

// ============================================
// ПРОПСЫ
// ============================================
const props = defineProps<{
  verse: BibleVerse | null
}>()

// ============================================
// ВЫЧИСЛЯЕМЫЕ СВОЙСТВА
// ============================================
const cleanDescription = computed(() => {
  if (!props.verse?.description) return ''
  return props.verse.description.replace(/<[^>]*>/g, '')
})
</script>

<style scoped>
/* ✅ Плавное ограничение ширины, как в карусели */
.verse-wrapper {
  width: 100%;
  margin: 0 auto;
}

.verse-container {
  width: 100%;
  max-width: 1278px;
  margin: 0 auto;
  padding: 0 16px;
}

@media (min-width: 769px) and (max-width: 1024px) {
  .verse-wrapper {
    width: 100vw;
    margin-left: calc(-50vw + 50%);
    margin-right: calc(-50vw + 50%);
  }
  
  .verse-container {
    max-width: 90%;
    padding: 0;
  }
}

@media (min-width: 1025px) {
  .verse-wrapper {
    display: flex;
    justify-content: center;
  }
}

@media (max-width: 768px) {
  .verse-wrapper {
    width: 100vw;
    margin-left: calc(-50vw + 50%);
    margin-right: calc(-50vw + 50%);
  }
  
  .verse-container {
    padding: 0;
  }
  
  .verse-container :deep(.bg-white\/10) {
    border-radius: 0;
    border-left: none;
    border-right: none;
  }
}
</style>