<template>
  <nav class="flex mb-6 text-sm" aria-label="Breadcrumb">
    <ol class="inline-flex items-center space-x-1 md:space-x-3 flex-wrap">
      <li class="inline-flex items-center">
        <NuxtLink to="/" class="text-white/60 hover:text-white transition inline-flex items-center">
          <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
          Главная
        </NuxtLink>
      </li>
      
      <li>
        <div class="flex items-center">
          <svg class="w-6 h-6 text-white/40" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd" />
          </svg>
          <NuxtLink to="/about" class="text-white/60 hover:text-white transition ml-1 md:ml-2">
            О нас
          </NuxtLink>
        </div>
      </li>
      
      <li v-if="denominationTitle">
        <div class="flex items-center">
          <svg class="w-6 h-6 text-white/40" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd" />
          </svg>
          <span class="text-white ml-1 md:ml-2 font-medium">{{ denominationTitle }}</span>
        </div>
      </li>
      
      <li v-if="aboutTitle">
        <div class="flex items-center">
          <svg class="w-6 h-6 text-white/40" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd" />
          </svg>
          <span class="text-white ml-1 md:ml-2 font-medium">{{ aboutTitle }}</span>
        </div>
      </li>
    </ol>
  </nav>
</template>

<script setup lang="ts">
defineProps<{
  denominationTitle?: string
  aboutTitle?: string
}>()
</script>