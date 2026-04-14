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
import { usePosts } from '~/composables/usePosts'

interface Breadcrumb {
  title: string
  to?: any
}

const props = defineProps<{
  postTitle?: string
  postSlug?: string
}>()

const route = useRoute()
const { filters, categories, groups, conferences } = usePosts()

// Получаем название категории по ID
const getCategoryName = (id: string | number | null): string => {
  if (!id || !categories.value?.length) return 'Категория'
  const category = categories.value.find(c => c.id === Number(id))
  return category?.title || 'Категория'
}

// Получаем название группы по ID
const getGroupName = (id: string | number | null): string => {
  if (!id || !groups.value?.length) return 'Группа'
  const group = groups.value.find(g => g.id === Number(id))
  return group?.title || 'Группа'
}

// Получаем название конференции по ID
const getConferenceName = (id: string | number | null): string => {
  if (!id || !conferences.value?.length) return 'Конференция'
  const conference = conferences.value.find(c => c.id === Number(id))
  return conference?.title || 'Конференция'
}

// Формируем ссылку на список с сохранением ВСЕХ фильтров
const getListLink = () => {
  const query: any = {}
  
  // Берем фильтры из URL (они уже включают page)
  if (route.query.category_id) query.category_id = String(route.query.category_id)
  if (route.query.group_id) query.group_id = String(route.query.group_id)
  if (route.query.conference_id) query.conference_id = String(route.query.conference_id)
  if (route.query.search) query.search = String(route.query.search)
  if (route.query.page && Number(route.query.page) > 1) query.page = String(route.query.page)
  
  
  return {
    path: '/sermons',
    query: Object.keys(query).length > 0 ? query : undefined
  }
}

// Формируем ссылку на конференцию с сохранением ВСЕХ фильтров
const getConferenceLink = () => {
  const conferenceId = route.query.conference_id || filters.value?.conference_id
  if (!conferenceId) return null
  
  const query: any = { conference_id: String(conferenceId) }
  
  // Сохраняем ВСЕ остальные фильтры, включая страницу
  if (route.query.category_id) query.category_id = String(route.query.category_id)
  if (route.query.group_id) query.group_id = String(route.query.group_id)
  if (route.query.search) query.search = String(route.query.search)
  if (route.query.page && Number(route.query.page) > 1) query.page = String(route.query.page)
  
  
  return {
    path: '/sermons',
    query
  }
}

// Формируем ссылку на категорию с сохранением ВСЕХ фильтров
const getCategoryLink = () => {
  const categoryId = route.query.category_id || filters.value?.category_id
  if (!categoryId) return null
  
  const query: any = { category_id: String(categoryId) }
  
  // Сохраняем ВСЕ остальные фильтры
  if (route.query.group_id) query.group_id = String(route.query.group_id)
  if (route.query.conference_id) query.conference_id = String(route.query.conference_id)
  if (route.query.search) query.search = String(route.query.search)
  if (route.query.page && Number(route.query.page) > 1) query.page = String(route.query.page)
  
  return {
    path: '/sermons',
    query
  }
}

// Формируем ссылку на группу с сохранением ВСЕХ фильтров
const getGroupLink = () => {
  const groupId = route.query.group_id || filters.value?.group_id
  if (!groupId) return null
  
  const query: any = { group_id: String(groupId) }
  
  // Сохраняем ВСЕ остальные фильтры
  if (route.query.category_id) query.category_id = String(route.query.category_id)
  if (route.query.conference_id) query.conference_id = String(route.query.conference_id)
  if (route.query.search) query.search = String(route.query.search)
  if (route.query.page && Number(route.query.page) > 1) query.page = String(route.query.page)
  
  return {
    path: '/sermons',
    query
  }
}

const breadcrumbs = computed<Breadcrumb[]>(() => {
  const crumbs: Breadcrumb[] = []
  
  // Определяем текущий путь
  const isListPage = route.path === '/sermons'
  const isDetailPage = route.path.startsWith('/sermons/') && route.path !== '/sermons'
  
  // Если мы на странице списка
  if (isListPage) {
    crumbs.push({ title: 'Проповеди' })
  }
  
  // Если мы на детальной странице
  else if (isDetailPage) {
    // Ссылка на список проповедей (с сохранением всех фильтров)
    crumbs.push({ 
      title: 'Проповеди',
      to: getListLink()
    })
    
    // Если есть категория - добавляем
    const categoryId = route.query.category_id || filters.value?.category_id
    if (categoryId) {
      crumbs.push({ 
        title: getCategoryName(categoryId),
        to: getCategoryLink() || undefined
      })
    }
    
    // Если есть группа - добавляем
    const groupId = route.query.group_id || filters.value?.group_id
    if (groupId) {
      crumbs.push({ 
        title: getGroupName(groupId),
        to: getGroupLink() || undefined
      })
    }
    
    // Если есть конференция - добавляем (САМЫЙ ВАЖНЫЙ СЛУЧАЙ)
    const conferenceId = route.query.conference_id || filters.value?.conference_id
    if (conferenceId) {
      crumbs.push({ 
        title: getConferenceName(conferenceId),
        to: getConferenceLink() || undefined
      })
    }
    
    // Название текущего поста
    if (props.postTitle) {
      crumbs.push({ title: props.postTitle })
    } else {
      crumbs.push({ title: 'Проповедь' })
    }
  }
  
  
  return crumbs
})
</script>

<style scoped>
/* Скрываем скроллбар для WebKit браузеров */
.scrollbar-hide::-webkit-scrollbar {
  display: none;
}

/* Скрываем скроллбар для Firefox */
.scrollbar-hide {
  scrollbar-width: none;
}
</style>