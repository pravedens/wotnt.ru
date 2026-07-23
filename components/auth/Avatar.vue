<template>
  <div class="relative" :class="containerClass">
    <img 
      v-if="avatarUrl"
      :src="avatarUrl" 
      :alt="alt"
      :class="[
        'object-cover',
        roundedClass,
        sizeClass,
        borderClass
      ]"
      @load="onLoad"
      @error="onError"
    >
    <div 
      v-else
      :class="[
        'flex items-center justify-center text-white font-bold',
        roundedClass,
        sizeClass,
        bgClass
      ]"
    >
      {{ initials }}
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

// ============================================
// ПОЛУЧАЕМ КОНФИГУРАЦИЮ
// ============================================
const config = useRuntimeConfig()
const { apiBase, storageUrl } = config.public

const props = defineProps({
  src: {
    type: String,
    default: null
  },
  name: {
    type: String,
    default: 'User'
  },
  alt: {
    type: String,
    default: 'Avatar'
  },
  size: {
    type: String,
    default: 'md',
    validator: (value) => ['sm', 'md', 'lg', 'xl'].includes(value)
  },
  rounded: {
    type: String,
    default: 'full',
    validator: (value) => ['full', 'lg', 'md', 'none'].includes(value)
  },
  border: {
    type: Boolean,
    default: true
  },
  containerClass: {
    type: String,
    default: ''
  }
})

// Размеры
const sizeClass = computed(() => {
  const sizes = {
    sm: 'w-8 h-8 text-sm',
    md: 'w-10 h-10 text-base',
    lg: 'w-24 h-24 text-2xl',
    xl: 'w-32 h-32 text-3xl'
  }
  return sizes[props.size] || sizes.md
})

// Скругление
const roundedClass = computed(() => {
  const roundings = {
    full: 'rounded-full',
    lg: 'rounded-lg',
    md: 'rounded-md',
    none: 'rounded-none'
  }
  return roundings[props.rounded] || roundings.full
})

// Граница
const borderClass = computed(() => {
  return props.border ? 'border-2 border-white/20' : ''
})

// Фон для заглушки
const bgClass = computed(() => {
  return 'bg-gradient-to-br from-blue-500 to-purple-500'
})

// ✅ Обработка URL аватара (поддержка S3 и локального хранилища)
const avatarUrl = computed(() => {
  if (!props.src) return null
  
  // Если уже полный URL
  if (props.src.startsWith('http')) {
    return props.src
  }
  
  // Если аватар на S3 (Yandex Cloud)
  if (props.src.startsWith('avatars/')) {
    return `${storageUrl}/${props.src}` 
  }
  
  // Если путь начинается с storage/
 if (props.src.startsWith('storage/')) {
    return `${apiBase}/${props.src}`  
  }
  
  // Fallback для локальных аватаров
  return `${apiBase}/storage/${props.src}` 
})

const initials = computed(() => {
  if (!props.name) return 'U'
  return props.name
    .split(' ')
    .map(word => word[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
})

const onLoad = () => {
}

const onError = (e) => {
  console.error('❌ Avatar error:', avatarUrl.value, e)
  // При ошибке показываем инициалы (компонент переключится на v-else)
}
</script>