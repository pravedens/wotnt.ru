<template>
  <div
    class="min-h-screen bg-gradient-to-br from-blue-900 to-purple-900 p-4 md:p-8"
  >
    <div class="max-w-6xl mx-auto">
      <!-- Шапка с кнопками -->
      <div class="flex justify-between items-center mb-6 md:mb-8">
        <div class="flex gap-2 md:gap-4 flex-wrap">
          <button
            @click="activeTab = 'profile'"
            class="px-3 py-2 md:px-4 md:py-2 rounded-lg transition flex items-center gap-2"
            :class="
              activeTab === 'profile'
                ? 'bg-blue-500 text-white'
                : 'bg-white/10 text-white/80 hover:bg-white/20'
            "
          >
            <span class="text-lg md:text-base">👤</span>
            <span class="hidden md:inline">Профиль</span>
          </button>
          <button
            @click="activeTab = 'settings'"
            class="px-3 py-2 md:px-4 md:py-2 rounded-lg transition flex items-center gap-2"
            :class="
              activeTab === 'settings'
                ? 'bg-blue-500 text-white'
                : 'bg-white/10 text-white/80 hover:bg-white/20'
            "
          >
            <span class="text-lg md:text-base">⚙️</span>
            <span class="hidden md:inline">Настройки</span>
          </button>
          <ClientOnly>
            <!-- Библейская школа - только для учеников -->
            <button
              v-if="isStudent"
              @click="activeTab = 'bibleSchool'"
              class="px-3 py-2 md:px-4 md:py-2 rounded-lg transition flex items-center gap-2"
              :class="
                activeTab === 'bibleSchool'
                  ? 'bg-blue-500 text-white'
                  : 'bg-white/10 text-white/80 hover:bg-white/20'
              "
            >
              <span class="text-lg md:text-base">📖</span>
              <span class="hidden md:inline">Библейская школа</span>
            </button>

            <!-- Панель учителя - только для учителей -->
            <button
              v-if="isTeacher"
              @click="activeTab = 'teacher'"
              class="px-3 py-2 md:px-4 md:py-2 rounded-lg transition flex items-center gap-2"
              :class="
                activeTab === 'teacher'
                  ? 'bg-blue-500 text-white'
                  : 'bg-white/10 text-white/80 hover:bg-white/20'
              "
            >
              <span class="text-lg md:text-base">👨‍🏫</span>
              <span class="hidden md:inline">Панель учителя</span>
            </button>

            <button
              v-if="isMinister"
              @click="activeTab = 'minister'"
              class="px-3 py-2 md:px-4 md:py-2 rounded-lg transition flex items-center gap-2 relative"
              :class="
                activeTab === 'minister'
                  ? 'bg-blue-500 text-white'
                  : 'bg-white/10 text-white/80 hover:bg-white/20'
              "
            >
              <span class="text-lg md:text-base">👔</span>
              <span class="hidden md:inline">Служитель</span>
            </button>

            <button
              v-if="isMinister"
              @click="activeTab = 'messages'"
              class="px-3 py-2 md:px-4 md:py-2 rounded-lg transition flex items-center gap-2 relative"
              :class="
                activeTab === 'messages'
                  ? 'bg-blue-500 text-white'
                  : 'bg-white/10 text-white/80 hover:bg-white/20'
              "
            >
              <span class="text-lg md:text-base">💬</span>
              <span class="hidden md:inline">Сообщения</span>
              <span
                v-if="unreadMessagesCount > 0"
                class="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center"
              >
                {{ unreadMessagesCount > 9 ? "9+" : unreadMessagesCount }}
              </span>
            </button>

            <template #fallback>
              <div class="w-20 h-10 bg-white/10 rounded animate-pulse" />
            </template>
          </ClientOnly>
        </div>

        <button
          @click="handleLogout"
          class="px-3 py-2 md:px-4 md:py-2 bg-red-500/20 border border-red-500/50 text-red-200 rounded-lg hover:bg-red-500/30 transition flex items-center gap-2"
        >
          <span class="text-lg md:text-base">🚪</span>
          <span class="hidden md:inline">Выйти</span>
        </button>
      </div>

      <!-- Скелетон загрузки -->
      <div
        v-if="!user"
        class="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20"
      >
        <div class="flex items-center justify-center py-12">
          <div
            class="animate-spin rounded-full h-12 w-12 border-b-2 border-white"
          ></div>
          <span class="ml-3 text-white">Загрузка...</span>
        </div>
      </div>

      <!-- Контент -->
      <template v-else>
        <!-- ==================== ПРОФИЛЬ ==================== -->
        <div v-show="activeTab === 'profile'">
          <!-- Карточка пользователя с аватаром -->
          <div
            class="bg-white/10 backdrop-blur-lg rounded-2xl p-4 md:p-6 border border-white/20 mb-6 md:mb-8"
          >
            <div
              class="flex flex-col sm:flex-row items-center sm:items-start gap-4 md:gap-6"
            >
              <div class="relative">
                <Avatar
                  :src="avatarUrl || undefined"
                  :name="user.name"
                  size="lg"
                  rounded="lg"
                  :border="true"
                  containerClass="shrink-0"
                />
                <button
                  @click="openAvatarUpload"
                  class="absolute -bottom-2 -right-2 bg-blue-500 text-white p-2 rounded-full hover:bg-blue-600 transition shadow-lg"
                >
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
                      d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                    />
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                </button>
              </div>

              <div class="flex-1 min-w-0 text-center sm:text-left">
                <h2 class="text-xl md:text-2xl font-bold text-white truncate">
                  {{ fullName }}
                </h2>
                <p class="text-white/60 text-sm truncate">{{ user.email }}</p>
                <div
                  class="mt-2 flex flex-wrap gap-2 justify-center sm:justify-start"
                >
                  <span
                    v-for="role in userRolesList"
                    :key="role"
                    class="px-2 py-1 text-xs md:px-3 md:py-1 md:text-sm rounded-full"
                    :class="getRoleClass(role)"
                  >
                    {{ role }}
                  </span>
                  <span
                    v-if="user.church_name"
                    class="px-2 py-1 text-xs md:px-3 md:py-1 md:text-sm rounded-full bg-blue-500/20 text-blue-200 border border-blue-500/50"
                  >
                    {{ user.church_name }}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <!-- Карточки статистики -->
          <div
            class="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-6 md:mb-8"
          >
            <div
              class="bg-white/10 backdrop-blur-lg rounded-2xl p-4 md:p-6 border border-white/20"
            >
              <h3 class="text-base md:text-lg font-semibold text-white mb-2">
                📊 Статус
              </h3>
              <p class="text-2xl md:text-3xl font-bold text-white">✓</p>
              <p class="text-white/60 text-xs md:text-sm">Аккаунт активен</p>
            </div>

            <div
              class="bg-white/10 backdrop-blur-lg rounded-2xl p-4 md:p-6 border border-white/20"
            >
              <h3 class="text-base md:text-lg font-semibold text-white mb-2">
                👥 Роль
              </h3>
              <p
                class="text-xl md:text-2xl lg:text-3xl font-bold text-white break-words"
              >
                {{ userRoles || "Пользователь" }}
              </p>
              <p class="text-white/60 text-xs md:text-sm">Текущая роль</p>
              <div
                v-if="userRolesList && userRolesList.length > 1"
                class="mt-3 pt-2 border-t border-white/10"
              >
                <div class="flex flex-wrap gap-1">
                  <span
                    v-for="role in userRolesList"
                    :key="role"
                    class="text-xs px-2 py-0.5 rounded-full bg-white/10 text-white/70"
                    >{{ role }}</span
                  >
                </div>
              </div>
            </div>

            <div
              class="bg-white/10 backdrop-blur-lg rounded-2xl p-4 md:p-6 border border-white/20"
            >
              <h3 class="text-base md:text-lg font-semibold text-white mb-2">
                📅 Регистрация
              </h3>
              <p
                class="text-xl md:text-2xl lg:text-3xl font-bold text-white break-words"
              >
                {{ registrationDate }}
              </p>
              <p class="text-white/60 text-xs md:text-sm">Дата регистрации</p>
            </div>

            <NuxtLink
              to="/favorites"
              class="bg-white/10 backdrop-blur-lg rounded-2xl p-4 md:p-6 border border-white/20 hover:bg-white/15 transition-all group"
            >
              <div class="flex items-center justify-between mb-2">
                <h3 class="text-base md:text-lg font-semibold text-white">
                  ⭐ Избранное
                </h3>
                <span
                  class="text-xl md:text-2xl transform group-hover:scale-110 transition-transform"
                  >⭐</span
                >
              </div>
              <p class="text-2xl md:text-3xl font-bold text-white">
                {{ favoritesCount }}
              </p>
              <p class="text-white/60 text-xs md:text-sm">
                Сохраненных проповедей
              </p>
            </NuxtLink>
          </div>

          <!-- Мои регистрации на конференции -->
          <div
            class="bg-white/10 backdrop-blur-lg rounded-2xl p-4 md:p-6 border border-white/20 mb-6 md:mb-8"
          >
            <h3 class="text-lg md:text-xl font-bold text-white mb-4">
              📝 Мои регистрации на конференции
            </h3>

            <div v-if="registrationsLoading" class="text-center py-8">
              <div
                class="animate-spin rounded-full h-8 w-8 border-2 border-white border-t-transparent mx-auto"
              ></div>
              <p class="text-white/60 mt-2">Загрузка...</p>
            </div>

            <div
              v-else-if="myRegistrations.length === 0"
              class="text-center py-8 text-white/60"
            >
              <p>У вас пока нет регистраций на конференции</p>
            </div>

            <div v-else class="space-y-3">
              <div
                v-for="reg in myRegistrations"
                :key="reg.id"
                class="bg-white/5 rounded-lg p-3 md:p-4 border border-white/10 hover:bg-white/10 transition"
              >
                <div class="flex flex-wrap justify-between items-start gap-3">
                  <div class="flex-1 min-w-0">
                    <NuxtLink
                      :to="`/events/${reg.event_slug}`"
                      class="text-white font-semibold hover:text-blue-300 transition text-sm md:text-base"
                      >{{ reg.event_title }}</NuxtLink
                    >
                    <div class="mt-2 space-y-1">
                      <div
                        v-for="service in reg.selected_services"
                        :key="service.id"
                        class="text-white/60 text-xs md:text-sm"
                      >
                        • {{ service.title }} — {{ service.date }}
                        <span v-if="service.time">в {{ service.time }}</span>
                        <span v-if="service.speaker" class="text-white/40">
                          ({{ service.speaker }})</span
                        >
                      </div>
                    </div>
                    <p class="text-white/40 text-xs mt-2">
                      Зарегистрировано:
                      {{ formatRegistrationDate(reg.created_at) }}
                    </p>
                  </div>
                  <div class="flex items-center gap-3">
                    <span
                      class="px-2 py-1 text-xs rounded-full"
                      :class="getRegistrationStatusClass(reg.status)"
                      >{{ getRegistrationStatusText(reg.status) }}</span
                    >
                    <button
                      v-if="
                        reg.status === 'pending' || reg.status === 'confirmed'
                      "
                      @click="cancelRegistration(reg.id)"
                      class="text-red-400 hover:text-red-300 text-xs md:text-sm"
                    >
                      Отменить
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Согласия и политики -->
          <div
            class="bg-white/10 backdrop-blur-lg rounded-2xl p-4 md:p-6 border border-white/20 mb-6 md:mb-8"
          >
            <div class="flex flex-wrap justify-between items-center gap-4 mb-4">
              <h3 class="text-lg md:text-xl font-bold text-white">
                📋 Согласия и политики
              </h3>
              <NuxtLink
                to="/privacy"
                target="_blank"
                class="inline-flex items-center gap-2 px-3 py-1.5 md:px-4 md:py-2 bg-blue-500/20 border border-blue-500/50 text-blue-200 rounded-lg hover:bg-blue-500/30 transition text-xs md:text-sm"
              >
                <svg
                  class="w-3 h-3 md:w-4 md:h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                  />
                </svg>
                <span class="hidden xs:inline">Просмотреть политику</span>
              </NuxtLink>
            </div>

            <div class="space-y-4">
              <div class="bg-white/5 rounded-lg p-4">
                <div class="flex items-start gap-3">
                  <div class="text-2xl flex-shrink-0">✅</div>
                  <div class="flex-1 min-w-0">
                    <h4 class="text-white font-semibold mb-2">
                      Согласие на обработку персональных данных
                    </h4>
                    <div
                      class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-sm"
                    >
                      <div>
                        <span class="text-white/60">Дата принятия:</span
                        ><span class="text-white ml-2 break-words">{{
                          consentDate || "Не указано"
                        }}</span>
                      </div>
                      <div>
                        <span class="text-white/60">Версия политики:</span
                        ><span class="text-white ml-2">{{
                          consentVersion
                        }}</span>
                      </div>
                      <div v-if="consentIp">
                        <span class="text-white/60">IP-адрес:</span
                        ><span class="text-white ml-2 break-words">{{
                          consentIp
                        }}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div
                v-if="needsConsentUpdate"
                class="bg-yellow-500/20 border border-yellow-500/50 rounded-lg p-4"
              >
                <div class="flex items-start gap-3">
                  <div class="text-2xl flex-shrink-0">⚠️</div>
                  <div class="flex-1">
                    <h4 class="text-white font-semibold mb-1">
                      Требуется обновление согласия
                    </h4>
                    <p class="text-white/80 text-sm mb-3">
                      Политика конфиденциальности была обновлена. Пожалуйста,
                      подтвердите свое согласие с новой версией.
                    </p>
                    <button
                      @click="showConsentModal = true"
                      class="px-4 py-2 bg-yellow-500/30 text-yellow-200 rounded-lg hover:bg-yellow-500/40 transition text-sm"
                    >
                      Обновить согласие
                    </button>
                  </div>
                </div>
              </div>

              <div v-if="consentHistory.length > 0" class="mt-4">
                <h4 class="text-white font-semibold mb-2">История согласий</h4>
                <div class="space-y-2">
                  <div
                    v-for="(item, index) in consentHistory"
                    :key="index"
                    class="bg-white/5 rounded-lg p-3 text-sm flex flex-wrap items-center justify-between gap-2"
                  >
                    <div class="flex flex-wrap items-center gap-2">
                      <span class="text-white/60"
                        >Версия {{ item.version }}</span
                      ><span class="text-white/60 hidden sm:inline">•</span
                      ><span class="text-white break-words">{{
                        item.date
                      }}</span>
                    </div>
                    <span class="text-white/40 text-xs break-words">{{
                      item.ip
                    }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Форма редактирования профиля -->
          <div
            class="bg-white/10 backdrop-blur-lg rounded-2xl p-4 md:p-6 border border-white/20 mb-6 md:mb-8"
          >
            <h3 class="text-lg md:text-xl font-bold text-white mb-6">
              ✏️ Редактировать профиль
            </h3>

            <form @submit.prevent="updateProfile" class="space-y-6">
              <div>
                <h4
                  class="text-base md:text-lg font-semibold text-white/90 mb-4"
                >
                  Основная информация
                </h4>
                <div
                  class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4"
                >
                  <div>
                    <label class="block text-white/80 text-sm mb-2">Имя</label
                    ><input
                      v-model="profileForm.name"
                      type="text"
                      class="w-full px-3 py-2 md:px-4 bg-white/10 border border-white/20 rounded-lg text-white text-sm md:text-base"
                      placeholder="Иван"
                    />
                  </div>
                  <div>
                    <label class="block text-white/80 text-sm mb-2"
                      >Фамилия</label
                    ><input
                      v-model="profileForm.last_name"
                      type="text"
                      class="w-full px-3 py-2 md:px-4 bg-white/10 border border-white/20 rounded-lg text-white text-sm md:text-base"
                      placeholder="Иванов"
                    />
                  </div>
                  <div>
                    <label class="block text-white/80 text-sm mb-2"
                      >Отчество</label
                    ><input
                      v-model="profileForm.middle_name"
                      type="text"
                      class="w-full px-3 py-2 md:px-4 bg-white/10 border border-white/20 rounded-lg text-white text-sm md:text-base"
                      placeholder="Иванович"
                    />
                  </div>
                </div>
              </div>

              <div>
                <h4
                  class="text-base md:text-lg font-semibold text-white/90 mb-4"
                >
                  Контактная информация
                </h4>
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
                  <div>
                    <label class="block text-white/80 text-sm mb-2">Email</label
                    ><input
                      v-model="profileForm.email"
                      type="email"
                      class="w-full px-3 py-2 md:px-4 bg-white/10 border border-white/20 rounded-lg text-white text-sm md:text-base"
                      placeholder="email@example.com"
                    />
                  </div>
                  <div>
                    <label class="block text-white/80 text-sm mb-2"
                      >Телефон</label
                    ><input
                      v-model="profileForm.phone"
                      type="tel"
                      class="w-full px-3 py-2 md:px-4 bg-white/10 border border-white/20 rounded-lg text-white text-sm md:text-base"
                      placeholder="+7 (999) 999-99-99"
                    />
                  </div>
                </div>
              </div>

              <div>
                <h4
                  class="text-base md:text-lg font-semibold text-white/90 mb-4"
                >
                  Личные данные
                </h4>
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
                  <div>
                    <label class="block text-white/80 text-sm mb-2"
                      >Дата рождения</label
                    ><input
                      v-model="birthDateFormatted"
                      type="date"
                      class="w-full px-3 py-2 md:px-4 bg-white/10 border border-white/20 rounded-lg text-white text-sm md:text-base"
                    />
                  </div>
                  <div>
                    <label class="block text-white/80 text-sm mb-2">Город</label
                    ><input
                      v-model="profileForm.city"
                      type="text"
                      class="w-full px-3 py-2 md:px-4 bg-white/10 border border-white/20 rounded-lg text-white text-sm md:text-base"
                      placeholder="Москва"
                    />
                  </div>
                </div>
              </div>

              <div>
                <h4
                  class="text-base md:text-lg font-semibold text-white/90 mb-4"
                >
                  Церковь
                </h4>
                <input
                  v-model="profileForm.church_name"
                  type="text"
                  class="w-full px-3 py-2 md:px-4 bg-white/10 border border-white/20 rounded-lg text-white text-sm md:text-base"
                  placeholder="Название церкви"
                />
              </div>

              <div>
                <h4
                  class="text-base md:text-lg font-semibold text-white/90 mb-4"
                >
                  О себе
                </h4>
                <textarea
                  v-model="profileForm.about"
                  rows="4"
                  class="w-full px-3 py-2 md:px-4 bg-white/10 border border-white/20 rounded-lg text-white text-sm md:text-base"
                  placeholder="Расскажите о себе..."
                ></textarea>
              </div>

              <!-- Анкета для библейской школы -->
              <div
                v-if="isStudent || isGroupLeader"
                class="mt-6 pt-4 border-t border-white/20"
              >
                <h4
                  class="text-base md:text-lg font-semibold text-white/90 mb-4"
                >
                  📋 Анкета для библейской школы
                </h4>

                <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
                  <div>
                    <label class="block text-white/80 text-sm mb-2"
                      >Семейное положение</label
                    >
                    <select
                      v-model="profileForm.marital_status"
                      class="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white"
                    >
                      <option value="" class="bg-gray-800 text-white">
                        Не выбрано
                      </option>
                      <option value="single" class="bg-gray-800 text-white">
                        Холост/Не замужем
                      </option>
                      <option value="married" class="bg-gray-800 text-white">
                        В браке
                      </option>
                      <option value="divorced" class="bg-gray-800 text-white">
                        Разведён(а)
                      </option>
                      <option value="widowed" class="bg-gray-800 text-white">
                        Вдова/Вдовец
                      </option>
                    </select>
                  </div>

                  <div>
                    <label class="block text-white/80 text-sm mb-2">Пол</label>
                    <select
                      v-model="profileForm.gender"
                      class="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white"
                    >
                      <option value="" class="bg-gray-800 text-white">
                        Не выбрано
                      </option>
                      <option value="male" class="bg-gray-800 text-white">
                        Мужской
                      </option>
                      <option value="female" class="bg-gray-800 text-white">
                        Женский
                      </option>
                    </select>
                  </div>

                  <div class="sm:col-span-2">
                    <label class="block text-white/80 text-sm mb-2"
                      >Служение в церкви</label
                    >
                    <input
                      v-model="profileForm.ministry"
                      type="text"
                      class="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white"
                      placeholder="Например: Прославление, Молодёжное, Воскресная школа..."
                    />
                  </div>

                  <div class="sm:col-span-2">
                    <label class="block text-white/80 text-sm mb-2"
                      >Опыт прохождения библейских курсов</label
                    >
                    <textarea
                      v-model="profileForm.bible_courses_experience"
                      rows="3"
                      class="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white"
                      placeholder="Какие курсы вы уже проходили? Где? Когда?"
                    ></textarea>
                  </div>

                  <div class="sm:col-span-2">
                    <label class="block text-white/80 text-sm mb-2"
                      >Ожидания от обучения</label
                    >
                    <textarea
                      v-model="profileForm.learning_expectations"
                      rows="3"
                      class="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white"
                      placeholder="Что вы хотите получить от обучения в нашей библейской школе?"
                    ></textarea>
                  </div>
                </div>
              </div>

              <div>
                <h4
                  class="text-base md:text-lg font-semibold text-white/90 mb-4"
                >
                  Смена пароля
                </h4>
                <div class="grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-4">
                  <div>
                    <label class="block text-white/80 text-sm mb-2"
                      >Текущий пароль</label
                    ><input
                      v-model="passwordForm.current_password"
                      type="password"
                      class="w-full px-3 py-2 md:px-4 bg-white/10 border border-white/20 rounded-lg text-white text-sm md:text-base"
                    />
                  </div>
                  <div>
                    <label class="block text-white/80 text-sm mb-2"
                      >Новый пароль</label
                    ><input
                      v-model="passwordForm.new_password"
                      type="password"
                      class="w-full px-3 py-2 md:px-4 bg-white/10 border border-white/20 rounded-lg text-white text-sm md:text-base"
                    />
                  </div>
                  <div>
                    <label class="block text-white/80 text-sm mb-2"
                      >Подтверждение</label
                    ><input
                      v-model="passwordForm.new_password_confirmation"
                      type="password"
                      class="w-full px-3 py-2 md:px-4 bg-white/10 border border-white/20 rounded-lg text-white text-sm md:text-base"
                    />
                  </div>
                </div>
                <p v-if="passwordMismatch" class="mt-2 text-red-300 text-sm">
                  Пароли не совпадают
                </p>
              </div>

              <div class="flex justify-end gap-4 pt-4">
                <button
                  type="button"
                  @click="resetForm"
                  class="px-4 py-2 text-sm md:text-base bg-gray-500/20 border border-gray-500/50 text-gray-200 rounded-lg hover:bg-gray-500/30 transition"
                >
                  Сбросить
                </button>
                <button
                  type="submit"
                  class="px-4 py-2 text-sm md:text-base bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
                  :disabled="updateLoading"
                >
                  {{ updateLoading ? "Сохранение..." : "Сохранить изменения" }}
                </button>
              </div>
            </form>
          </div>
        </div>

        <!-- ==================== БИБЛЕЙСКАЯ ШКОЛА ==================== -->
        <div v-show="activeTab === 'bibleSchool'">
          <!-- Статус заявки / роль студента -->
          <div
            class="bg-white/10 backdrop-blur-lg rounded-2xl p-4 md:p-6 border border-white/20 mb-6"
          >
            <div
              class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
            >
              <div>
                <h3 class="text-lg md:text-xl font-bold text-white mb-2">
                  📖 Статус в школе
                </h3>
                <p v-if="isBibleStudent" class="text-green-400">
                  ✓ Вы зачислены как студент
                </p>
                <p
                  v-else-if="enrollmentStatus === 'pending'"
                  class="text-yellow-400"
                >
                  ⏳ Ваша заявка рассматривается
                </p>
                <p
                  v-else-if="enrollmentStatus === 'rejected'"
                  class="text-red-400"
                >
                  ✗ Заявка отклонена
                </p>
                <p v-else class="text-white/80">Вы ещё не зачислены</p>
              </div>

              <button
                v-if="!isBibleStudent && enrollmentStatus !== 'pending'"
                @click="submitEnrollmentRequest"
                class="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
                :disabled="enrollmentLoading"
              >
                {{
                  enrollmentLoading
                    ? "Отправка..."
                    : "📝 Подать заявку на обучение"
                }}
              </button>
            </div>
          </div>

          <!-- Прогресс обучения (если студент) -->
          <div
            v-if="isBibleStudent"
            class="bg-white/10 backdrop-blur-lg rounded-2xl p-4 md:p-6 border border-white/20 mb-6"
          >
            <h3 class="text-lg md:text-xl font-bold text-white mb-4">
              🎓 Мой прогресс
            </h3>

            <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div class="bg-white/5 rounded-lg p-4 text-center">
                <p class="text-2xl md:text-3xl font-bold text-white">
                  {{ overallProgress.percentage || 0 }}%
                </p>
                <p class="text-white/60 text-sm">Общий прогресс</p>
              </div>
              <div class="bg-white/5 rounded-lg p-4 text-center">
                <p class="text-2xl md:text-3xl font-bold text-white">
                  {{ bibleStudentLevel }}
                </p>
                <p class="text-white/60 text-sm">Уровень</p>
              </div>
              <div class="bg-white/5 rounded-lg p-4 text-center">
                <p class="text-2xl md:text-3xl font-bold text-white">
                  {{ certificatesCount }}
                </p>
                <p class="text-white/60 text-sm">Сертификатов</p>
              </div>
            </div>

            <!-- Список курсов с прогрессом -->
            <div v-if="coursesProgress.length > 0" class="space-y-4">
              <h4 class="text-white font-semibold mb-3">Курсы:</h4>
              <div
                v-for="course in coursesProgress"
                :key="course.course_id"
                class="bg-white/5 rounded-lg p-4"
              >
                <div
                  class="flex flex-wrap justify-between items-center mb-2 gap-2"
                >
                  <h5 class="text-white font-medium">
                    {{ course.course_title }}
                  </h5>
                  <span class="text-white/60 text-sm"
                    >{{ course.completed }}/{{ course.total }} уроков</span
                  >
                </div>
                <div class="w-full bg-white/20 rounded-full h-2">
                  <div
                    class="bg-blue-500 h-2 rounded-full"
                    :style="{ width: course.percentage + '%' }"
                  ></div>
                </div>
                <NuxtLink
                  :to="`/bible-school/courses/${course.course_slug}`"
                  class="inline-block mt-3 text-sm text-blue-300 hover:text-blue-200"
                >
                  Продолжить обучение →
                </NuxtLink>
              </div>
            </div>

            <div v-else class="text-center py-8">
              <p class="text-white/60">Курсы пока не добавлены</p>
            </div>
          </div>

          <!-- Мои сертификаты -->
          <div
            v-if="isBibleStudent && certificates.length > 0"
            class="bg-white/10 backdrop-blur-lg rounded-2xl p-4 md:p-6 border border-white/20 mb-6"
          >
            <h3 class="text-lg md:text-xl font-bold text-white mb-4">
              🏆 Мои сертификаты
            </h3>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div
                v-for="cert in certificates"
                :key="cert.id"
                class="bg-white/5 rounded-lg p-4 flex justify-between items-center"
              >
                <div>
                  <p class="text-white font-medium">{{ cert.course_title }}</p>
                  <p class="text-white/60 text-sm">
                    Получен: {{ formatDate(cert.issued_at) }}
                  </p>
                </div>
                <a
                  :href="cert.pdf_url"
                  download
                  class="text-blue-300 hover:text-blue-200"
                >
                  <svg
                    class="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M12 10v6m0 0l-3-3m3 3l3-3m4 0a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </a>
              </div>
            </div>
          </div>

          <!-- Моя группа (если есть) -->
          <div
            v-if="isBibleStudent && myParty"
            class="bg-white/10 backdrop-blur-lg rounded-2xl p-4 md:p-6 border border-white/20 mb-6"
          >
            <h3 class="text-lg md:text-xl font-bold text-white mb-4">
              👥 Моя учебная группа
            </h3>
            <div class="space-y-3">
              <p>
                <span class="text-white/60">Название:</span>
                <span class="text-white">{{ myParty.name }}</span>
              </p>
              <p>
                <span class="text-white/60">Курс:</span>
                <span class="text-white">{{ myParty.course_title }}</span>
              </p>
              <p v-if="myParty.meeting_day">
                <span class="text-white/60">Встреча:</span>
                <span class="text-white"
                  >{{ getDayName(myParty.meeting_day)
                  }}{{
                    myParty.meeting_time ? " в " + myParty.meeting_time : ""
                  }}</span
                >
              </p>
              <button
                @click="goToPartyChat"
                class="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition"
              >
                💬 Чат группы
              </button>
            </div>
          </div>

          <!-- Вступить в группу по коду -->
          <div
            v-if="isBibleStudent && !myParty"
            class="bg-white/10 backdrop-blur-lg rounded-2xl p-4 md:p-6 border border-white/20"
          >
            <h3 class="text-lg md:text-xl font-bold text-white mb-4">
              🔗 Вступить в группу
            </h3>
            <div class="flex flex-col sm:flex-row gap-4">
              <input
                v-model="joinCode"
                type="text"
                placeholder="Введите код приглашения (6 символов)"
                maxlength="6"
                class="flex-1 px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white"
              />
              <button
                @click="joinParty"
                :disabled="!joinCode || joinLoading"
                class="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition disabled:opacity-50"
              >
                {{ joinLoading ? "Загрузка..." : "Вступить" }}
              </button>
            </div>
            <p class="text-white/60 text-sm mt-2">
              Код можно получить у лидера вашей группы
            </p>
          </div>

          <!-- Кнопка чата с учителем -->
          <button
            @click="openChatModal"
            class="mt-4 px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition"
          >
            💬 Чат с учителем
          </button>

          <!-- ==================== НАСТРОЙКИ УВЕДОМЛЕНИЙ БИБЛЕЙСКОЙ ШКОЛЫ ==================== -->
          <div
            v-if="isBibleStudent"
            class="bg-white/10 backdrop-blur-lg rounded-2xl p-4 md:p-6 border border-white/20 mt-6"
          >
            <h3 class="text-lg md:text-xl font-bold text-white mb-4">
              🔔 Уведомления библейской школы
            </h3>
            <p class="text-white/60 text-sm mb-4">
              Настройте получение уведомлений, связанных с обучением
            </p>

            <div class="space-y-4">
              <!-- Отклонение заявки -->
              <div class="bg-white/5 rounded-lg p-3 sm:p-4">
                <div
                  class="flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div>
                    <span class="text-white font-medium"
                      >❌ Отклонение заявки</span
                    >
                    <p class="text-white/40 text-xs">
                      Уведомление при отклонении заявки на обучение
                    </p>
                  </div>
                  <div class="flex flex-wrap gap-4">
                    <label class="flex items-center gap-2">
                      <span class="text-white/60 text-sm">Email</span>
                      <input
                        type="checkbox"
                        v-model="
                          bibleSchoolSettings.notify_enrollment_rejected_email
                        "
                        class="toggle"
                      />
                    </label>
                    <label class="flex items-center gap-2">
                      <span class="text-white/60 text-sm">Push</span>
                      <input
                        type="checkbox"
                        v-model="
                          bibleSchoolSettings.notify_enrollment_rejected_webpush
                        "
                        class="toggle"
                      />
                    </label>
                  </div>
                </div>
              </div>

              <!-- Выдача сертификата -->
              <div class="bg-white/5 rounded-lg p-3 sm:p-4">
                <div
                  class="flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div>
                    <span class="text-white font-medium"
                      >🎓 Выдача сертификата</span
                    >
                    <p class="text-white/40 text-xs">
                      Уведомление о получении сертификата
                    </p>
                  </div>
                  <div class="flex flex-wrap gap-4">
                    <label class="flex items-center gap-2">
                      <span class="text-white/60 text-sm">Email</span>
                      <input
                        type="checkbox"
                        v-model="
                          bibleSchoolSettings.notify_certificate_issued_email
                        "
                        class="toggle"
                      />
                    </label>
                    <label class="flex items-center gap-2">
                      <span class="text-white/60 text-sm">Push</span>
                      <input
                        type="checkbox"
                        v-model="
                          bibleSchoolSettings.notify_certificate_issued_webpush
                        "
                        class="toggle"
                      />
                    </label>
                  </div>
                </div>
              </div>

              <div class="flex justify-end pt-2">
                <button
                  @click="saveBibleSchoolNotificationSettings"
                  :disabled="savingBibleSchoolSettings"
                  class="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition disabled:opacity-50"
                >
                  {{
                    savingBibleSchoolSettings
                      ? "Сохранение..."
                      : "Сохранить настройки"
                  }}
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- ==================== ПАНЕЛЬ УЧИТЕЛЯ ==================== -->
        <div v-show="activeTab === 'teacher'">
          <TeacherPanel />
        </div>

        <!-- ==================== НАСТРОЙКИ ==================== -->
        <div v-show="activeTab === 'settings'">
          <NotificationSettings />

          <MinisterCategoriesManager v-if="isMinister" />
        </div>

        <!-- ==================== СЛУЖИТЕЛЬ ==================== -->
        <div v-show="activeTab === 'minister' && isMinister">
          <MinisterNotificationSettings />

          <SocialLinksManager />

          <FieldVisibilitySettings />
        </div>

        <!-- ==================== СООБЩЕНИЯ ==================== -->
        <div v-show="activeTab === 'messages' && isMinister">
          <MinisterMessages @unread-count-update="updateUnreadCount" />
        </div>

        <!-- Модальные окна -->
        <div
          v-if="showUploadModal"
          class="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
        >
          <div
            class="bg-white/10 backdrop-blur-lg p-8 rounded-2xl shadow-2xl w-full max-w-md border border-white/20"
          >
            <h3 class="text-2xl font-bold text-white mb-4">Загрузить аватар</h3>
            <input
              type="file"
              ref="fileInput"
              accept="image/*"
              class="hidden"
              @change="handleFileSelect"
            />
            <button
              @click="triggerFileInput"
              class="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition mb-4"
            >
              Выбрать файл
            </button>
            <div v-if="previewUrl" class="mb-4">
              <p class="text-white mb-2">Предпросмотр:</p>
              <img
                :src="previewUrl"
                class="w-32 h-32 rounded-lg object-cover mx-auto"
              />
            </div>
            <div class="flex gap-2">
              <button
                @click="uploadAvatar"
                :disabled="!selectedFile || uploadLoading"
                class="flex-1 bg-green-500 text-white py-2 rounded-lg hover:bg-green-600 transition disabled:opacity-50"
              >
                {{ uploadLoading ? "Загрузка..." : "Загрузить" }}
              </button>
              <button
                @click="closeUploadModal"
                class="flex-1 bg-gray-500 text-white py-2 rounded-lg hover:bg-gray-600 transition"
              >
                Отмена
              </button>
            </div>
          </div>
        </div>

        <!-- Чат с учителем -->
        <StudentChatModal
          v-if="chatModalVisible"
          :visible="chatModalVisible"
          @close="chatModalVisible = false"
        />

        <div
          v-if="showConsentModal"
          class="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
        >
          <div
            class="bg-white/10 backdrop-blur-lg p-8 rounded-2xl shadow-2xl w-full max-w-md border border-white/20"
          >
            <h3 class="text-2xl font-bold text-white mb-4">
              Обновление согласия
            </h3>
            <p class="text-white/80 mb-6">
              Политика конфиденциальности была обновлена до версии 2.0.
              Пожалуйста, подтвердите свое согласие с новой версией.
            </p>
            <div class="mb-6">
              <div class="flex items-start gap-3">
                <div class="flex items-center h-6">
                  <input
                    id="update-privacy"
                    v-model="consentAccepted"
                    type="checkbox"
                    class="w-4 h-4 bg-white/10 border border-white/20 rounded text-blue-500 focus:ring-blue-500 focus:ring-offset-0"
                  />
                </div>
                <div class="flex-1">
                  <label for="update-privacy" class="text-white/80 text-sm"
                    >Я согласен на обработку персональных данных с новой версией
                    политики</label
                  >
                </div>
              </div>
            </div>
            <div class="flex gap-2">
              <button
                @click="handleConsentUpdate"
                :disabled="!consentAccepted || consentUpdating"
                class="flex-1 bg-green-500 text-white py-2 rounded-lg hover:bg-green-600 transition disabled:opacity-50"
              >
                {{ consentUpdating ? "Обновление..." : "Подтвердить" }}
              </button>
              <button
                @click="closeConsentModal"
                class="flex-1 bg-gray-500 text-white py-2 rounded-lg hover:bg-gray-600 transition"
              >
                Отмена
              </button>
            </div>
          </div>
        </div>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRoute } from "vue-router";
import { useAuthStore } from "~/stores/auth";
import { useNotificationStore } from "~/stores/notification";
import { useFavorites } from "~/composables/useFavorites";
import { useApi } from "~/composables/useApi";
import Avatar from "~/components/auth/Avatar.vue";
import NotificationSettings from "~/components/NotificationSettings.vue";
import SocialLinksManager from "~/components/dashboard/SocialLinksManager.vue";
import FieldVisibilitySettings from "~/components/dashboard/FieldVisibilitySettings.vue";
import MinisterCategoriesManager from "~/components/dashboard/MinisterCategoriesManager.vue";
import MinisterMessages from "~/components/dashboard/MinisterMessages.vue";
import MinisterNotificationSettings from "~/components/dashboard/MinisterNotificationSettings.vue";
import TeacherPanel from "~/components/dashboard/TeacherPanel.vue";
import StudentChatModal from "~/components/dashboard/StudentChatModal.vue";

import type { User } from "~/stores/auth";
import type {
  RegistrationsResponse,
  EnrollmentStatusResponse,
  ProgressResponse,
  CertificatesResponse,
  PartyResponse
} from "~/types/bible-school";

definePageMeta({ middleware: "auth" });

// ✅ useRoute() на верхнем уровне
const route = useRoute();

const authStore = useAuthStore();
const notificationStore = useNotificationStore();
const router = useRouter();
const { favorites, loadFavorites } = useFavorites();
const { $api } = useApi();
const favoritesCount = ref(0);
const activeTab = ref("profile");
const unreadMessagesCount = ref(0);
const chatModalVisible = ref(false);

const {
  user,
  isAdmin,
  isMember,
  isMinister,
  isPastor,
  isTeacher,
  isStudent,
  isGroupLeader,
  userRoles,
  userRolesList,
  avatarUrl,
} = storeToRefs(authStore);

const consentDate = computed(() => authStore.consentDate);
const consentVersion = computed(() => authStore.consentVersion || "1.0");
const consentIp = computed(() => authStore.consentIp);
const consentHistory = computed(() => authStore.consentHistory);
const needsConsentUpdate = computed(() => authStore.needsConsentUpdate);

const myRegistrations = ref<any[]>([]);
const registrationsLoading = ref(false);

const loadMyRegistrations = async () => {
  registrationsLoading.value = true;
  try {
    const response = await $api<RegistrationsResponse>("/user/registrations");
    if (response.success) {
      myRegistrations.value = response.registrations || [];
    }
  } catch (err) {
    console.error("Load registrations error:", err);
  } finally {
    registrationsLoading.value = false;
  }
};

const updateUnreadCount = (count: number) => {
  unreadMessagesCount.value = count;
};

const formatRegistrationDate = (date: string) => {
  return new Date(date).toLocaleDateString("ru-RU", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const getRegistrationStatusClass = (status: string) => {
  const classes: Record<string, string> = {
    pending: "bg-yellow-500/20 text-yellow-200 border border-yellow-500/50",
    confirmed: "bg-green-500/20 text-green-200 border border-green-500/50",
    cancelled: "bg-red-500/20 text-red-200 border border-red-500/50",
    waiting: "bg-blue-500/20 text-blue-200 border border-blue-500/50",
  };
  return classes[status] || "bg-gray-500/20 text-gray-200";
};

const getRegistrationStatusText = (status: string) => {
  const texts: Record<string, string> = {
    pending: "Ожидает подтверждения",
    confirmed: "Подтверждена",
    cancelled: "Отменена",
    waiting: "Лист ожидания",
  };
  return texts[status] || status;
};

const cancelRegistration = async (registrationId: number) => {
  if (!confirm("Вы уверены, что хотите отменить регистрацию?")) return;

  try {
    const response = await $api<{ success: boolean; message?: string }>(
      `/registrations/${registrationId}/cancel`,
      { method: "PUT" },
    );
    if (response.success) {
      notificationStore.success(
        "Регистрация отменена",
        response.message || "Регистрация отменена",
      );
      await loadMyRegistrations();
    }
  } catch (err: any) {
    notificationStore.error(
      "Ошибка",
      err.data?.message || "Не удалось отменить регистрацию",
    );
  }
};

const profileForm = ref({
  name: "",
  last_name: "",
  middle_name: "",
  email: "",
  phone: "",
  city: "",
  church_name: "",
  about: "",
  birth_date: "",
  marital_status: "",
  gender: "",
  ministry: "",
  bible_courses_experience: "",
  learning_expectations: "",
});

const passwordForm = ref({
  current_password: "",
  new_password: "",
  new_password_confirmation: "",
});

const updateLoading = ref(false);
const uploadLoading = ref(false);
const consentUpdating = ref(false);
const dataLoaded = ref(false);

const showUploadModal = ref(false);
const selectedFile = ref<File | null>(null);
const previewUrl = ref<string | null>(null);
const fileInput = ref<HTMLInputElement | null>(null);

const showConsentModal = ref(false);
const consentAccepted = ref(false);

// ========== БИБЛЕЙСКАЯ ШКОЛА ==========
const enrollmentStatus = ref<string | null>(null);
const enrollmentLoading = ref(false);
const isBibleStudent = ref(false);

const overallProgress = ref({ percentage: 0 });
const bibleStudentLevel = ref("Ученик");
const certificatesCount = ref(0);
const certificates = ref<any[]>([]);
const coursesProgress = ref<any[]>([]);

const myParty = ref<any>(null);
const joinCode = ref("");
const joinLoading = ref(false);

const fullName = computed(() => {
  if (!user.value) return "Пользователь";
  const parts = [
    user.value.last_name,
    user.value.name,
    user.value.middle_name,
  ].filter(Boolean);
  return parts.join(" ") || user.value.name || "Пользователь";
});

const passwordMismatch = computed(() => {
  return (
    passwordForm.value.new_password &&
    passwordForm.value.new_password_confirmation &&
    passwordForm.value.new_password !==
      passwordForm.value.new_password_confirmation
  );
});

const registrationDate = computed(() => {
  if (user.value?.created_at) {
    return new Date(user.value.created_at).toLocaleDateString("ru-RU");
  }
  return "Неизвестно";
});

const formatDateForInput = (dateString: string | undefined | null): string => {
  if (!dateString) return ''
  const str = String(dateString)
  // ✅ Используем ?? для защиты от undefined
  return str.includes('T') ? (str.split('T')[0] ?? str) : str
}

const birthDateFormatted = computed({
  get: (): string => formatDateForInput(profileForm.value.birth_date),
  set: (value: string) => {
    profileForm.value.birth_date = value || ''
  },
});

const getRoleClass = (role: string) => {
  const roleClasses: Record<string, string> = {
    "Супер-администратор":
      "bg-red-500/20 text-red-200 border border-red-500/50",
    Администратор:
      "bg-orange-500/20 text-orange-200 border border-orange-500/50",
    Редактор: "bg-blue-500/20 text-blue-200 border border-blue-500/50",
    Прихожанин: "bg-green-500/20 text-green-200 border border-green-500/50",
    Служитель: "bg-purple-500/20 text-purple-200 border border-purple-500/50",
    Пастор: "bg-indigo-500/20 text-indigo-200 border border-indigo-500/50",
    Пользователь: "bg-gray-500/20 text-gray-200 border border-gray-500/50",
  };
  return (
    roleClasses[role] ||
    "bg-gray-500/20 text-gray-200 border border-gray-500/50"
  );
};

const loadUserData = () => {
  if (user.value) {
    profileForm.value = {
      name: user.value.name || "",
      last_name: user.value.last_name || "",
      middle_name: user.value.middle_name || "",
      email: user.value.email || "",
      phone: user.value.phone || "",
      city: user.value.city || "",
      church_name: user.value.church_name || "",
      about: user.value.about || "",
      birth_date: user.value.birth_date || "",
      marital_status: user.value.marital_status || "",
      gender: user.value.gender || "",
      ministry: user.value.ministry || "",
      bible_courses_experience: user.value.bible_courses_experience || "",
      learning_expectations: user.value.learning_expectations || "",
    };
    dataLoaded.value = true;
  }
};

const restoreScroll = () => {
  if (import.meta.client) {
    document.body.style.overflow = "";
    document.body.style.position = "";
    document.body.style.top = "";
    document.body.style.width = "";
  }
};

const closeConsentModal = () => {
  showConsentModal.value = false;
  consentAccepted.value = false;
  restoreScroll();
};

const handleConsentUpdate = async () => {
  if (!consentAccepted.value) {
    notificationStore.warning("Внимание", "Необходимо подтвердить согласие");
    return;
  }
  consentUpdating.value = true;
  const result = await authStore.updateConsent("2.0");
  if (result.success) {
    notificationStore.success("Согласие обновлено", "Спасибо за подтверждение");
    closeConsentModal();
  } else {
    notificationStore.error("Ошибка", result.error);
  }
  consentUpdating.value = false;
};

const resetForm = () => {
  loadUserData();
  passwordForm.value = {
    current_password: "",
    new_password: "",
    new_password_confirmation: "",
  };
  notificationStore.info("Форма сброшена", "Данные возвращены к исходным");
};

const handleLogout = async () => {
  await authStore.logout();
  restoreScroll();
  notificationStore.info("До свидания!", "Вы вышли из системы");
};

const openAvatarUpload = () => {
  showUploadModal.value = true;
};
const closeUploadModal = () => {
  showUploadModal.value = false;
  selectedFile.value = null;
  previewUrl.value = null;
  restoreScroll();
};
const triggerFileInput = () => {
  fileInput.value?.click();
};
const handleFileSelect = (event: Event) => {
  const target = event.target as HTMLInputElement;
  const file = target.files?.[0];
  if (file) {
    selectedFile.value = file;
    previewUrl.value = URL.createObjectURL(file);
  }
};

const uploadAvatar = async () => {
  if (!selectedFile.value) {
    notificationStore.warning("Нет файла", "Выберите файл для загрузки");
    return;
  }
  uploadLoading.value = true;
  const formData = new FormData();
  formData.append("avatar", selectedFile.value);
  try {
    const response = await $api<{ avatar: string; message?: string }>(
      "/user/avatar",
      {
        method: "POST",
        body: formData,
      },
    );
    if (response.avatar && user.value) {
      user.value.avatar = response.avatar;
      if (import.meta.client) {
        const userStr = localStorage.getItem("auth_user");
        if (userStr) {
          const localUser = JSON.parse(userStr);
          localUser.avatar = response.avatar;
          localStorage.setItem("auth_user", JSON.stringify(localUser));
        }
      }
      authStore.user = { ...authStore.user, avatar: response.avatar } as User;
    }
    closeUploadModal();
    notificationStore.success(
      "Аватар обновлен",
      "Новый аватар успешно загружен",
    );
  } catch (err: any) {
    notificationStore.error(
      "Ошибка загрузки",
      err?.data?.message || "Не удалось загрузить аватар",
    );
  } finally {
    uploadLoading.value = false;
  }
};

const openChatModal = () => {
  chatModalVisible.value = true;
};

const updateProfile = async () => {
  if (passwordForm.value.new_password && passwordMismatch.value) {
    notificationStore.error("Ошибка", "Пароли не совпадают");
    return;
  }
  updateLoading.value = true;
  const updateData: Record<string, any> = {
    name: profileForm.value.name,
    last_name: profileForm.value.last_name,
    middle_name: profileForm.value.middle_name,
    email: profileForm.value.email,
    phone: profileForm.value.phone,
    city: profileForm.value.city,
    church_name: profileForm.value.church_name,
    about: profileForm.value.about,
    birth_date: profileForm.value.birth_date,
    marital_status: profileForm.value.marital_status,
    gender: profileForm.value.gender,
    ministry: profileForm.value.ministry,
    bible_courses_experience: profileForm.value.bible_courses_experience,
    learning_expectations: profileForm.value.learning_expectations,
  };
  if (passwordForm.value.new_password) {
    updateData.current_password = passwordForm.value.current_password;
    updateData.new_password = passwordForm.value.new_password;
    updateData.new_password_confirmation =
      passwordForm.value.new_password_confirmation;
  }
  try {
    const response = await $api<{
      user: User;
      email_verification_required?: boolean;
      message?: string;
    }>("/user/profile", {
      method: "PUT",
      body: updateData,
    });
    if (response.user && user.value) {
      Object.assign(user.value, response.user);
      if (import.meta.client)
        localStorage.setItem("auth_user", JSON.stringify(user.value));
    }
    passwordForm.value = {
      current_password: "",
      new_password: "",
      new_password_confirmation: "",
    };
    notificationStore.success(
      "Профиль обновлен",
      "Ваши данные успешно сохранены",
    );
    if (response.email_verification_required) {
      notificationStore.warning(
        "Требуется подтверждение email",
        "На новый email отправлено письмо с ссылкой для подтверждения",
      );
    }
  } catch (err: any) {
    notificationStore.error(
      "Ошибка обновления",
      err?.data?.message || "Не удалось обновить профиль",
    );
  } finally {
    updateLoading.value = false;
  }
};

const loadFavoritesCount = async () => {
  await loadFavorites();
  favoritesCount.value = favorites.value.length;
};

// ========== МЕТОДЫ БИБЛЕЙСКОЙ ШКОЛЫ ==========

const loadEnrollmentStatus = async () => {
  try {
    const response = await $api<EnrollmentStatusResponse>(
      "/bible-school/enroll/status",
    );
    if (response.is_enrolled) {
      isBibleStudent.value = true;
    } else if (response.has_request) {
      enrollmentStatus.value = response.status || null // ✅ Преобразуем undefined в null
    }
  } catch (err) {
    console.error("Load enrollment status error:", err);
  }
};

const submitEnrollmentRequest = async () => {
  if (!profileForm.value.marital_status) {
    notificationStore.warning("Внимание", "Пожалуйста, выберите семейное положение");
    return;
  }
  if (!profileForm.value.gender) {
    notificationStore.warning("Внимание", "Пожалуйста, выберите пол");
    return;
  }

  enrollmentLoading.value = true;
  try {
    const response = await $api<{ success: boolean; message?: string }>(
      "/bible-school/enroll",
      {
        method: "POST",
        body: {
          city: profileForm.value.city,
          church_name: profileForm.value.church_name,
          phone: profileForm.value.phone,
          birth_date: profileForm.value.birth_date,
          about: profileForm.value.about,
          marital_status: profileForm.value.marital_status,
          gender: profileForm.value.gender,
          ministry: profileForm.value.ministry,
          bible_courses_experience: profileForm.value.bible_courses_experience,
          learning_expectations: profileForm.value.learning_expectations,
        },
      }
    );
    if (response.success) {
      enrollmentStatus.value = "pending";
      notificationStore.success("Заявка отправлена", response.message || "Заявка отправлена");
    }
  } catch (err: any) {
    notificationStore.error(
      "Ошибка",
      err.data?.message || "Не удалось отправить заявку"
    );
  } finally {
    enrollmentLoading.value = false;
  }
};

const loadStudentProgress = async () => {
  try {
    const response = await $api<ProgressResponse>("/bible-school/my/progress");
    if (response.success) {
      overallProgress.value = response.overall || { percentage: 0 };
      bibleStudentLevel.value = response.overall?.level || "Ученик";
      coursesProgress.value = response.courses || [];
    }
  } catch (err) {
    console.error("Load progress error:", err);
  }
};

const loadCertificates = async () => {
  try {
    const response = await $api<CertificatesResponse>(
      "/bible-school/my/certificates",
    );
    if (response.success) {
      certificates.value = response.certificates || [];
      certificatesCount.value = response.certificates?.length || 0;
    }
  } catch (err) {
    console.error("Load certificates error:", err);
  }
};

const loadMyParty = async () => {
  try {
    const response = await $api<PartyResponse>("/bible-school/party/my");
    if (response.has_party) {
      myParty.value = response.party;
    }
  } catch (err) {
    console.error("Load party error:", err);
  }
};

const joinParty = async () => {
  if (!joinCode.value) {
    notificationStore.warning("Внимание", "Введите код приглашения");
    return;
  }
  
  joinLoading.value = true;
  try {
    const response = await $api<{ success: boolean; message?: string }>(
      "/bible-school/party/join",
      {
        method: "POST",
        body: { join_code: joinCode.value.toUpperCase() },
      }
    );
    if (response.success) {
      notificationStore.success("Успех", response.message || "Вы вступили в группу");
      await loadMyParty();
      joinCode.value = "";
    }
  } catch (err: any) {
    notificationStore.error(
      "Ошибка",
      err.data?.message || "Не удалось вступить в группу"
    );
  } finally {
    joinLoading.value = false;
  }
};

const goToPartyChat = () => {
  if (myParty.value) {
    router.push(`/bible-school/party/${myParty.value.id}/chat`);
  }
};

const formatDate = (date: string) => {
  if (!date) return "";
  return new Date(date).toLocaleDateString("ru-RU", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
};

const getDayName = (day: string) => {
  const days: Record<string, string> = {
    monday: "Понедельник, ",
    tuesday: "Вторник, ",
    wednesday: "Среда, ",
    thursday: "Четверг, ",
    friday: "Пятница, ",
    saturday: "Суббота, ",
    sunday: "Воскресенье, ",
  };
  return days[day] || "";
};

// ========== НАСТРОЙКИ УВЕДОМЛЕНИЙ БИБЛЕЙСКОЙ ШКОЛЫ ==========
const bibleSchoolSettings = ref({
  notify_enrollment_rejected_email: false,
  notify_enrollment_rejected_webpush: false,
  notify_certificate_issued_email: false,
  notify_certificate_issued_webpush: false,
});
const savingBibleSchoolSettings = ref(false);

const loadBibleSchoolNotificationSettings = async () => {
  try {
    const response = await $api<{ success: boolean; settings: any }>(
      "/user/notification-settings",
    );
    if (response.success) {
      bibleSchoolSettings.value = {
        notify_enrollment_rejected_email:
          response.settings.notify_enrollment_rejected_email || false,
        notify_enrollment_rejected_webpush:
          response.settings.notify_enrollment_rejected_webpush || false,
        notify_certificate_issued_email:
          response.settings.notify_certificate_issued_email || false,
        notify_certificate_issued_webpush:
          response.settings.notify_certificate_issued_webpush || false,
      };
    }
  } catch (err) {
    console.error("Failed to load bible school notification settings:", err);
  }
};

const saveBibleSchoolNotificationSettings = async () => {
  savingBibleSchoolSettings.value = true;
  try {
    const response = await $api<{ success: boolean; message?: string }>(
      "/user/notification-settings",
      {
        method: "PUT",
        body: {
          ...bibleSchoolSettings.value,
          consent_given: true,
        },
      },
    );
    if (response.success) {
      notificationStore.success(
        "Настройки сохранены",
        "Уведомления библейской школы обновлены",
      );
    }
  } catch (err: any) {
    notificationStore.error(
      "Ошибка",
      err?.data?.message || "Не удалось сохранить настройки",
    );
  } finally {
    savingBibleSchoolSettings.value = false;
  }
};

const refreshStudentStatus = async () => {
  try {
    await authStore.refreshSession();
    await loadEnrollmentStatus();
  } catch (err) {
    console.error("Refresh student status error:", err);
  }
};

// Следим за сменой вкладки
watch(activeTab, async (newTab) => {
  if (newTab === "bibleSchool") {
    await refreshStudentStatus();

    if (isBibleStudent.value) {
      await loadStudentProgress();
      await loadCertificates();
      await loadMyParty();
    }
  }
});

// Следим за изменением ролей пользователя
watch(
  () => authStore.roles,
  async () => {
    if (activeTab.value === "bibleSchool") {
      await refreshStudentStatus();

      if (isBibleStudent.value) {
        await loadStudentProgress();
        await loadCertificates();
        await loadMyParty();
      }
    }
  },
  { deep: true },
);

onMounted(async () => {
  if (!authStore.initialized) await authStore.init();
  if (!authStore.isAuthenticated) {
    await router.push("/auth/login");
    return;
  }
  if (!authStore.isEmailVerified) {
    await router.push("/auth/verify");
    return;
  }
  loadUserData();
  await loadFavoritesCount();
  await authStore.fetchConsentHistory();
  await loadMyRegistrations();

  await refreshStudentStatus();

  if (isBibleStudent.value) {
    await loadStudentProgress();
    await loadCertificates();
    await loadMyParty();
    await loadBibleSchoolNotificationSettings();
  }

  // ✅ route теперь доступен на верхнем уровне
  if (route.query.tab === "bibleSchool") {
    activeTab.value = "bibleSchool";
  }
  if (route.query.tab === "teacher" && isTeacher.value) {
    activeTab.value = "teacher";
  }
});

watch(
  user,
  (newUser) => {
    if (newUser && !dataLoaded.value) loadUserData();
  },
  { immediate: true, deep: true },
);

watch(
  profileForm,
  (newVal) => {
    if (user.value && dataLoaded.value) {
      // ✅ Проверяем, что поле существует перед присваиванием
      if ("marital_status" in user.value) {
        user.value.marital_status = newVal.marital_status;
      }
      if ("gender" in user.value) {
        user.value.gender = newVal.gender;
      }
      if ("ministry" in user.value) {
        user.value.ministry = newVal.ministry;
      }
      if ("bible_courses_experience" in user.value) {
        user.value.bible_courses_experience = newVal.bible_courses_experience;
      }
      if ("learning_expectations" in user.value) {
        user.value.learning_expectations = newVal.learning_expectations;
      }
    }
  },
  { deep: true },
);
</script>

<style scoped>
.break-words {
  word-break: break-word;
  overflow-wrap: break-word;
}
.hyphens-auto {
  hyphens: auto;
}
.truncate {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.whitespace-normal {
  white-space: normal;
}
.toggle {
  appearance: none;
  width: 36px;
  height: 20px;
  background-color: rgba(255, 255, 255, 0.2);
  border-radius: 10px;
  position: relative;
  cursor: pointer;
  transition: all 0.3s;
  flex-shrink: 0;
}
.toggle:checked {
  background-color: #3b82f6;
}
.toggle::before {
  content: "";
  position: absolute;
  width: 16px;
  height: 16px;
  background-color: white;
  border-radius: 50%;
  top: 2px;
  left: 2px;
  transition: transform 0.3s;
}
.toggle:checked::before {
  transform: translateX(16px);
}
.toggle:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}
</style>
