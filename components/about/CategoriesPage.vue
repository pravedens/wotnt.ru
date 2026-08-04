<template>
  <div
    class="min-h-screen bg-gradient-to-br from-blue-900 to-purple-900 py-8 md:py-12"
  >
    <div class="container mx-auto px-4">
      <AboutBreadcrumbs />

      <h1
        class="text-3xl md:text-4xl font-bold text-white text-center mb-6 md:mb-8"
      >
        О нас
      </h1>

      <!-- Состояние загрузки категорий -->
      <div v-if="loadingDenominations" class="text-center py-12">
        <div
          class="inline-block animate-spin rounded-full h-8 w-8 border-4 border-white border-t-transparent"
        ></div>
        <p class="text-white/80 mt-4">Загрузка категорий...</p>
      </div>

      <!-- Ошибка -->
      <div
        v-else-if="error"
        class="bg-red-500/20 border border-red-500/50 rounded-2xl p-8 text-center max-w-2xl mx-auto"
      >
        <p class="text-red-200 text-lg mb-4">{{ error }}</p>
        <button
          @click="reload"
          class="px-6 py-2 bg-red-500/30 text-red-200 rounded-lg hover:bg-red-500/40 transition"
        >
          Попробовать снова
        </button>
      </div>

      <div v-else class="max-w-4xl mx-auto">
        <!-- Кнопки категорий - компактные -->
        <div class="flex flex-wrap justify-center gap-2 mb-8">
          <AppButton
            v-for="denom in denominations"
            :key="denom.id"
            :variant="
              selectedDenominationId === denom.id
                ? 'category-active'
                : 'category'
            "
            :disabled="loadingAbouts"
            @click="selectDenomination(denom)"
          >
            <span class="mr-1 text-base">{{
              getCategoryIcon(denom.title)
            }}</span>
            {{ denom.title }}
            <span class="ml-1 text-xs bg-white/20 px-1.5 py-0.5 rounded-full">
              {{ denom.about_count || 0 }}
            </span>
          </AppButton>
        </div>

        <!-- Контент -->
        <div
          class="bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 overflow-hidden"
        >
          <!-- Загрузка -->
          <div
            v-if="loadingAbouts"
            class="flex flex-col items-center justify-center py-16"
          >
            <div
              class="inline-block animate-spin rounded-full h-8 w-8 border-4 border-white border-t-transparent"
            ></div>
            <p class="text-white/80 mt-4 text-sm">Загрузка статей...</p>
          </div>

          <!-- Контент -->
          <Transition name="fade-up" mode="out-in">
            <div
              v-if="
                !loadingAbouts &&
                selectedDenomination &&
                categoryAbouts.length > 0
              "
              :key="'content-with-articles'"
              class="p-6 md:p-8"
            >
              <div class="text-center mb-6">
                <h2 class="text-2xl md:text-3xl font-bold text-white mb-2">
                  {{ selectedDenomination.title }}
                </h2>
                <div
                  class="w-16 h-0.5 bg-gradient-to-r from-blue-500 to-purple-500 mx-auto rounded-full"
                ></div>
              </div>

              <div class="space-y-4">
                <div
                  v-for="(about, index) in categoryAbouts"
                  :key="about.id"
                  class="group cursor-pointer"
                  :style="{ animationDelay: `${index * 0.05}s` }"
                  @click="goToAbout(about)"
                >
                  <div
                    class="border border-white/10 rounded-xl p-4 hover:bg-white/5 transition-all duration-300 hover:border-blue-500/30"
                  >
                    <div class="flex items-start gap-3">
                      <div
                        class="w-16 h-16 rounded-lg overflow-hidden bg-gradient-to-br from-blue-500/20 to-purple-500/20 flex-shrink-0"
                      >
                        <img
                          v-if="about.thumbnail"
                          :src="
                            getImageUrl(about.thumbnail, 'abouts') ?? undefined
                          "
                          :alt="about.title"
                          class="w-full h-full object-cover"
                          @error="handleImageError"
                        />
                        <div
                          v-else
                          class="w-full h-full flex items-center justify-center text-2xl"
                        >
                          📄
                        </div>
                      </div>

                      <div class="flex-1 min-w-0">
                        <h3
                          class="text-lg font-semibold text-white mb-1 group-hover:text-blue-300 transition"
                        >
                          {{ about.title }}
                        </h3>
                        <p class="text-white/60 text-sm line-clamp-1">
                          {{ about.description }}
                        </p>
                        <div class="flex items-center justify-between mt-2">
                          <span
                            class="text-white/40 text-xs flex items-center gap-1"
                          >
                            <svg
                              class="w-3 h-3"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                stroke-linecap="round"
                                stroke-linejoin="round"
                                stroke-width="2"
                                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                              />
                            </svg>
                            {{
                              formatDate(about.created_at ?? about.updated_at)
                            }}
                          </span>
                          <span
                            class="text-blue-400 group-hover:text-blue-300 transition flex items-center gap-1 text-xs"
                          >
                            Читать
                            <svg
                              class="w-3 h-3 group-hover:translate-x-0.5 transition"
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
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div
              v-else-if="
                !loadingAbouts &&
                selectedDenomination &&
                categoryAbouts.length === 0
              "
              :key="'content-empty'"
              class="p-12 text-center"
            >
              <div class="text-4xl mb-3">📭</div>
              <p class="text-white/60">В этой категории пока нет статей</p>
            </div>

            <div
              v-else-if="!loadingAbouts && !selectedDenomination"
              :key="'content-no-category'"
              class="p-12 text-center"
            >
              <div class="text-4xl mb-3">📖</div>
              <p class="text-white/60">Выберите категорию</p>
            </div>
          </Transition>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useAbout } from "~/composables/useAbout";
import AboutBreadcrumbs from "~/components/about/Breadcrumbs.vue";
import type { Denomination, About } from "~/types/about";
import { useImageUrl } from "~/composables/useImageUrl";

const { getImageUrl } = useImageUrl();

const handleImageError = (e: Event) => {
  const img = e.target as HTMLImageElement;
  img.style.display = "none";
  console.warn("Image failed to load:", img.src);
};

const router = useRouter();
const route = useRoute();

const { denominations, loadDenominations, loadAboutsByDenomination } =
  useAbout();

const loadingDenominations = ref(false);
const loadingAbouts = ref(false);
const error = ref<string | null>(null);
const selectedDenomination = ref<Denomination | null>(null);
const selectedDenominationId = computed(() => selectedDenomination.value?.id);
const categoryAbouts = ref<About[]>([]);
const categoryCache = ref<Map<number, About[]>>(new Map());

const getCategoryIcon = (title: string): string => {
  const icons: Record<string, string> = {
    История: "📜",
    Миссия: "🎯",
    Ценности: "💎",
    Пасторы: "👨‍💼",
    Команда: "🤝",
    Служения: "⛪",
    Контакты: "📞",
  };
  return icons[title] || "📄";
};

const loadData = async () => {
  loadingDenominations.value = true;
  error.value = null;

  try {
    await loadDenominations();

    if (!denominations.value.length) {
      error.value = "Категории не найдены";
      return;
    }

    let defaultDenom: Denomination | null = null;

    const categorySlug = route.query.category as string | undefined;
    if (categorySlug) {
      const found = denominations.value.find((d) => d.slug === categorySlug);
      if (found) {
        defaultDenom = found;
      } else {
        router.replace({ query: {} });
      }
    }

    if (!defaultDenom) {
      const savedId = localStorage.getItem("about_selected_category");
      if (savedId) {
        const found = denominations.value.find((d) => d.id === Number(savedId));
        if (found) {
          defaultDenom = found;
        } else {
          localStorage.removeItem("about_selected_category");
        }
      }
    }

    if (!defaultDenom && denominations.value.length > 0) {
      const firstDenom = denominations.value[0];
      if (firstDenom) {
        defaultDenom = firstDenom;
      }
    }

    if (defaultDenom) {
      await selectDenomination(defaultDenom);
    }
  } catch (err) {
    error.value = "Не удалось загрузить категории";
    console.error(err);
  } finally {
    loadingDenominations.value = false;
  }
};

const selectDenomination = async (denom: Denomination) => {
  if (selectedDenomination.value?.id === denom.id || loadingAbouts.value)
    return;

  if (categoryCache.value.has(denom.id)) {
    selectedDenomination.value = denom;
    categoryAbouts.value = categoryCache.value.get(denom.id) || [];
    localStorage.setItem("about_selected_category", String(denom.id));
    router.push({ query: { category: denom.slug } });
    return;
  }

  loadingAbouts.value = true;
  selectedDenomination.value = denom;
  error.value = null;

  try {
    const response = await loadAboutsByDenomination(denom.slug);

    let articles: About[] = [];
    if (response && Array.isArray(response)) {
      articles = response;
    } else if (response && response.abouts) {
      articles = response.abouts;
    }

    categoryCache.value.set(denom.id, articles);
    categoryAbouts.value = articles;

    localStorage.setItem("about_selected_category", String(denom.id));
    router.push({ query: { category: denom.slug } });
  } catch (err) {
    console.error("Error loading articles:", err);
    categoryAbouts.value = [];
  } finally {
    loadingAbouts.value = false;
  }
};

const goToAbout = (about: About) => {
  router.push(`/about/${about.slug}`);
};

const formatDate = (dateStr: string | null | undefined): string => {
  if (!dateStr) return "Дата неизвестна";
  return new Date(dateStr).toLocaleDateString("ru-RU", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
};

const reload = () => {
  loadData();
};

onMounted(() => {
  loadData();
});
</script>

<style scoped>
/* Анимация */
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.fade-up-enter-active,
.fade-up-leave-active {
  transition:
    opacity 0.2s ease,
    transform 0.2s ease;
}

.fade-up-enter-from,
.fade-up-leave-to {
  opacity: 0;
  transform: translateY(10px);
}

.category-btn {
  transition: all 0.2s ease;
  cursor: pointer;
}

.category-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

@media (max-width: 640px) {
  .category-btn {
    padding-left: 0.75rem;
    padding-right: 0.75rem;
    font-size: 0.8rem;
  }
}
</style>
