<template>
  <div class="min-h-screen bg-gradient-to-br from-blue-900 to-purple-900 py-12">
    <div class="container mx-auto px-4 max-w-4xl">
      <img :src="getImageUrl(course.image_url)" class="w-full h-64 object-cover rounded-2xl mb-8">
      <h1 class="text-3xl font-bold text-white mb-4">{{ course.title }}</h1>
      <div class="text-white/80 mb-8" v-html="course.description"></div>
      
      <h2 class="text-2xl font-bold text-white mb-4">📚 Уроки курса</h2>
      <div class="space-y-2 mb-8">
        <div v-for="lesson in course.lessons" class="bg-white/5 rounded-lg p-4">
          <h3 class="text-white font-semibold">{{ lesson.order }}. {{ lesson.title }}</h3>
        </div>
      </div>
      
      <h2 class="text-2xl font-bold text-white mb-4">👨‍🏫 Преподаватели</h2>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        <TeacherCard v-for="teacher in teachers" :key="teacher.id" :teacher="teacher" />
      </div>
      
      <div class="bg-white/10 rounded-2xl p-6 text-center">
        <p class="text-white/80 mb-4">Стоимость обучения: <span class="text-2xl font-bold text-white">Бесплатно</span></p>
        <NuxtLink to="/auth/register" class="inline-block px-8 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition text-lg">
          📝 Хочу учиться
        </NuxtLink>
      </div>
    </div>
  </div>
</template>