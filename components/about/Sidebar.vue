<template>
  <div class="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
    <h3 class="text-xl font-bold text-white mb-4">Категории</h3>
    
    <div v-if="loading" class="space-y-2">
      <div v-for="i in 3" :key="i" class="h-10 bg-white/5 rounded-lg animate-pulse"></div>
    </div>
    
    <div v-else-if="denominations.length === 0" class="text-white/60 text-center py-4">
      Нет категорий
    </div>
    
    <ul v-else class="space-y-2">
      <li v-for="denom in denominations" :key="denom.id">
        <NuxtLink 
          :to="`/about/category/${denom.slug}`"
          class="flex items-center justify-between p-3 rounded-lg transition"
          :class="[
            isActive(denom.slug) 
              ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30' 
              : 'text-white/70 hover:bg-white/5 hover:text-white'
          ]"
        >
          <span>{{ denom.title }}</span>
          <span class="text-sm bg-white/10 px-2 py-1 rounded-full">
            {{ denom.about_count || 0 }}
          </span>
        </NuxtLink>
      </li>
    </ul>
  </div>
</template>

<script setup lang="ts">
import type { Denomination } from '~/types/about'

const props = defineProps<{
  denominations: Denomination[]
  loading?: boolean
  currentSlug?: string
}>()

const route = useRoute()

const isActive = (slug: string) => {
  return props.currentSlug === slug || route.params.slug === slug
}
</script>