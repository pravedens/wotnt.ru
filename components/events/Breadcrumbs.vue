<template>
  <nav class="flex items-center gap-2 text-white/70 mb-6 overflow-x-auto pb-2 scrollbar-hide">
    <NuxtLink 
      to="/" 
      class="flex items-center gap-1 hover:text-white transition whitespace-nowrap"
    >
      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
      </svg>
      <span class="hidden sm:inline">Главная</span>
    </NuxtLink>
    
    <template v-for="(crumb, index) in breadcrumbs" :key="index">
      <svg class="w-4 h-4 text-white/40 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
      </svg>
      
      <NuxtLink 
        v-if="crumb.to && index < breadcrumbs.length - 1"
        :to="crumb.to"
        class="hover:text-white transition whitespace-nowrap"
      >
        {{ crumb.title }}
      </NuxtLink>
      
      <span 
        v-else
        class="text-white font-medium whitespace-nowrap"
      >
        {{ crumb.title }}
      </span>
    </template>
  </nav>
</template>

<script setup lang="ts">
import { useRoute } from 'vue-router'

interface Breadcrumb {
  title: string
  to?: any
}

const props = defineProps<{
  eventTitle?: string
  eventSlug?: string
}>()

const route = useRoute()

const breadcrumbs = computed<Breadcrumb[]>(() => {
  const crumbs: Breadcrumb[] = []
  
  // Определяем текущий путь
  const isListPage = route.path === '/events'
  const isDetailPage = route.path.startsWith('/events/') && route.path !== '/events'
  
  // Если мы на странице списка событий
  if (isListPage) {
    crumbs.push({ title: 'События' })
  }
  
  // Если мы на детальной странице события
  else if (isDetailPage) {
    crumbs.push({ 
      title: 'События',
      to: '/events'
    })
    
    // Название текущего события
    if (props.eventTitle) {
      crumbs.push({ title: props.eventTitle })
    } else {
      crumbs.push({ title: 'Событие' })
    }
  }
  
  return crumbs
})
</script>

<style scoped>
.scrollbar-hide::-webkit-scrollbar {
  display: none;
}
.scrollbar-hide {
  scrollbar-width: none;
}
</style>