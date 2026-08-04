<template>
  <NuxtLink
    v-if="to"
    :to="to"
    class="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
    :class="[
      variantClasses[variant],
      sizeClasses[size],
      fullWidth ? 'w-full' : '',
      className
    ]"
    @click="handleClick"
  >
    <slot name="left-icon">
      <component v-if="leftIcon" :is="leftIcon" class="w-4 h-4" />
    </slot>
    <span><slot>{{ label }}</slot></span>
    <slot name="right-icon">
      <component v-if="rightIcon" :is="rightIcon" class="w-4 h-4" />
    </slot>
  </NuxtLink>

  <a
    v-else-if="href"
    :href="href"
    class="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
    :class="[
      variantClasses[variant],
      sizeClasses[size],
      fullWidth ? 'w-full' : '',
      className
    ]"
    @click="handleClick"
  >
    <slot name="left-icon">
      <component v-if="leftIcon" :is="leftIcon" class="w-4 h-4" />
    </slot>
    <span><slot>{{ label }}</slot></span>
    <slot name="right-icon">
      <component v-if="rightIcon" :is="rightIcon" class="w-4 h-4" />
    </slot>
  </a>

  <button
    v-else
    :type="type"
    :disabled="disabled"
    class="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
    :class="[
      variantClasses[variant],
      sizeClasses[size],
      fullWidth ? 'w-full' : '',
      className
    ]"
    @click="handleClick"
  >
    <slot name="left-icon">
      <component v-if="leftIcon" :is="leftIcon" class="w-4 h-4" />
    </slot>
    <span><slot>{{ label }}</slot></span>
    <slot name="right-icon">
      <component v-if="rightIcon" :is="rightIcon" class="w-4 h-4" />
    </slot>
  </button>
</template>

<script setup lang="ts">
// ============================================
// ТИПЫ (ДОБАВЛЯЕМ 'reset')
// ============================================
type ButtonVariant = 
  | 'primary' 
  | 'secondary' 
  | 'success' 
  | 'danger' 
  | 'warning' 
  | 'ghost' 
  | 'ghost-light' 
  | 'outline' 
  | 'reset'   
  | 'category' 
  | 'category-active'
  | 'submit'

type ButtonSize = 'xs' | 'sm' | 'md' | 'lg'

// ============================================
// ПРОПСЫ
// ============================================
interface Props {
  label?: string
  variant?: ButtonVariant
  size?: ButtonSize
  fullWidth?: boolean
  disabled?: boolean
  type?: 'button' | 'submit' | 'reset'
  to?: string | object
  href?: string
  className?: string
  leftIcon?: any
  rightIcon?: any
}

const props = withDefaults(defineProps<Props>(), {
  label: 'Кнопка',
  variant: 'primary',
  size: 'md',
  fullWidth: false,
  disabled: false,
  type: 'button',
  className: '',
})

// ============================================
// КЛАССЫ ДЛЯ ВАРИАНТОВ
// ============================================
const variantClasses: Record<ButtonVariant, string> = {
  primary: 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500 dark:bg-blue-500 dark:hover:bg-blue-600',
  secondary: 'bg-gray-200 text-gray-800 hover:bg-gray-300 focus:ring-gray-500 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600',
  success: 'bg-green-600 text-white hover:bg-green-700 focus:ring-green-500 dark:bg-green-500 dark:hover:bg-green-600',
  danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500 dark:bg-red-500 dark:hover:bg-red-600',
  warning: 'bg-yellow-500 text-white hover:bg-yellow-600 focus:ring-yellow-400 dark:bg-yellow-400 dark:hover:bg-yellow-500',
  ghost: 'bg-transparent text-gray-700 hover:bg-gray-100 focus:ring-gray-300 dark:text-gray-300 dark:hover:bg-gray-800',
  'ghost-light': 'bg-white/5 text-white/70 hover:text-white hover:bg-white/10 focus:ring-white/20',
  outline: 'border-2 border-blue-600 text-blue-600 hover:bg-blue-50 focus:ring-blue-500 dark:border-blue-400 dark:text-blue-400 dark:hover:bg-blue-950',
  reset: 'bg-white/20 text-white border border-white/30 hover:bg-white/30 focus:ring-white/20', 
  category: 'bg-white/10 text-white/70 hover:bg-white/20 hover:text-white rounded-full px-4 py-1.5 text-sm font-medium',
  'category-active': 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-md shadow-blue-500/25 rounded-full px-4 py-1.5 text-sm font-medium',
  submit: 'bg-gradient-to-r from-blue-500 to-purple-500 text-white hover:from-blue-600 hover:to-purple-600 focus:ring-blue-500',
}

// ============================================
// КЛАССЫ ДЛЯ РАЗМЕРОВ
// ============================================
const sizeClasses: Record<ButtonSize, string> = {
  xs: 'px-2.5 py-1.5 text-xs',
  sm: 'px-3 py-2 text-sm',
  md: 'px-5 py-2.5 text-base',
  lg: 'px-7 py-3.5 text-lg',
}

// ============================================
// ЭМИТЫ
// ============================================
const emit = defineEmits<{
  click: [event: MouseEvent]
}>()

const handleClick = (event: MouseEvent) => {
  if (props.disabled) return
  emit('click', event)
}
</script>