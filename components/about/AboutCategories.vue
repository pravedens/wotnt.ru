<template>
  <div class="min-h-screen bg-gradient-to-br from-blue-900 to-purple-900 py-12">
    <div class="container mx-auto px-4">
      <h1 class="text-4xl md:text-5xl font-bold text-white text-center mb-8">
        О нас
      </h1>

      <div class="categories-grid mb-12">
        <button
          v-for="category in categories"
          :key="category.id"
          @click="selectCategory(category.id)"
          class="category-button px-6 py-3 rounded-full font-medium transition-all duration-300 transform hover:scale-105 whitespace-nowrap"
          :class="[
            activeCategory === category.id
              ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg shadow-blue-500/30 scale-105'
              : 'bg-white/10 text-white/70 hover:bg-white/20 hover:text-white',
          ]"
        >
          {{ category.name }}
        </button>
      </div>

      <Transition :name="transitionName" mode="out-in">
        <div
          v-if="currentArticle"
          :key="activeCategory"
          class="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20 max-w-4xl mx-auto"
        >
          <div
            v-if="currentArticle.thumbnail"
            class="mb-8 rounded-xl overflow-hidden"
          >
            <img
              :src="
                getImageUrl(currentArticle.thumbnail, 'abouts') ?? undefined
              "
              :alt="currentArticle.title"
              class="w-full max-h-[400px] object-cover"
              @error="handleImageError"
              loading="lazy"
            />
          </div>

          <div class="prose prose-invert max-w-none">
            <h2 class="text-3xl font-bold text-white mb-4">
              {{ currentArticle.title }}
            </h2>

            <div
              class="flex items-center gap-4 text-white/50 text-sm mb-6 pb-4 border-b border-white/10"
            >
              <span v-if="currentArticle.created_at">
                📅 {{ formatDate(currentArticle.created_at) }}
              </span>
              <span v-if="currentArticle.views">
                👁️ {{ currentArticle.views }} просмотров
              </span>
            </div>

            <div
              class="text-white/80 text-lg leading-relaxed"
              v-html="currentArticle.content"
            ></div>
          </div>
        </div>

        <div
          v-else-if="loading"
          key="loading"
          class="bg-white/10 backdrop-blur-lg rounded-2xl p-12 border border-white/20 text-center"
        >
          <div
            class="inline-block animate-spin rounded-full h-8 w-8 border-4 border-white border-t-transparent"
          ></div>
          <p class="text-white/80 mt-4">Загрузка статьи...</p>
        </div>

        <div
          v-else-if="error"
          key="error"
          class="bg-white/10 backdrop-blur-lg rounded-2xl p-12 border border-white/20 text-center"
        >
          <p class="text-red-200 text-lg mb-4">{{ error }}</p>
          <button
            @click="loadCurrentArticle"
            class="px-6 py-2 bg-blue-500/20 text-blue-200 rounded-lg hover:bg-blue-500/30 transition"
          >
            Попробовать снова
          </button>
        </div>
      </Transition>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useImageUrl } from "~/composables/useImageUrl";
import { useAbout } from "~/composables/useAbout";
import type { Category, About } from '~/types/about'

const { getImageUrl } = useImageUrl();
const { loadAboutsByDenomination } = useAbout();

const config = useRuntimeConfig();
const { siteUrl } = config.public;

useSeoMeta({
  title: "О нас | Церковь Слово Истины",
  description:
    "История, миссия, ценности и пасторы церкви Слово Истины. Узнайте больше о нашей общине верующих и служениях.",
  ogTitle: "О нас | Церковь Слово Истины",
  ogDescription: "История, миссия, ценности и пасторы церкви Слово Истины.",
  ogType: "website",
  ogUrl: `${siteUrl}/about`,
  ogSiteName: "Церковь Слово Истины",
  ogLocale: "ru_RU",
  twitterCard: "summary_large_image",
});

useHead({
  meta: [
    {
      name: "description",
      content:
        "История, миссия, ценности и пасторы церкви Слово Истины. Узнайте больше о нашей общине верующих и служениях.",
    },
    {
      name: "keywords",
      content:
        "о нас, история церкви, миссия, ценности, пасторы, служения, община верующих, церковь слово истины",
    },
  ],
  link: [{ rel: "canonical", href: `${siteUrl}/about` }],
});

const categories = ref<Category[]>([]);
// ✅ Используем About вместо Article
const articlesMap = ref<Map<string, About>>(new Map());
const activeCategory = ref<string>("");
const loading = ref(false);
const error = ref<string | null>(null);
const transitionName = ref<string>("fade-slide");

const currentArticle = computed(() => {
  return articlesMap.value.get(activeCategory.value);
});

const formatDate = (dateStr: string | null) => {
  if (!dateStr) return "Дата неизвестна";
  const date = new Date(dateStr);
  return date.toLocaleDateString("ru-RU", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
};

const handleImageError = (e: Event) => {
  const img = e.target as HTMLImageElement;
  img.style.display = "none";
  console.warn("Image failed to load:", img.src);
};

const loadCategories = async () => {
  try {
    categories.value = [
      { id: "1", slug: "history", name: "История", about_count: 1 },
      { id: "2", slug: "mission", name: "Миссия", about_count: 1 },
      { id: "3", slug: "values", name: "Ценности", about_count: 1 },
      { id: "4", slug: "pastors", name: "Пасторы", about_count: 1 },
      { id: "5", slug: "contacts", name: "Контакты", about_count: 1 },
    ];

    if (categories.value.length > 0) {
      const firstCategory = categories.value[0];
      if (firstCategory) {
        activeCategory.value = firstCategory.id;
        await loadArticleForCategory(firstCategory.slug);
      }
    }
  } catch (err) {
    console.error("Error loading categories:", err);
    error.value = "Не удалось загрузить категории";
  }
};

const loadArticleForCategory = async (slug: string) => {
  loading.value = true;
  error.value = null;

  try {
    const response = await loadAboutsByDenomination(slug);

    let articles: About[] = [];

    if (response && Array.isArray(response)) {
      articles = response;
    } else if (response && response.abouts) {
      articles = response.abouts;
    }

    if (articles.length > 0) {
      const article = articles[0];
      if (article) {
        const category = categories.value.find((c) => c.slug === slug);
        if (category) {
          articlesMap.value.set(category.id, article);
        }
      }
    } else {
      const category = categories.value.find((c) => c.slug === slug);
      if (category) {
        // ✅ Теперь thumbnail: null допустим
        articlesMap.value.set(category.id, {
          id: 0,
          title: category.name,
          slug: category.slug,
          content: "<p>Контент для этой категории пока не добавлен.</p>",
          thumbnail: null,
          description: "",
          denomination_id: 0,
          created_at: null,
          updated_at: null,
          views: 0,
        } as About);
      }
    }
  } catch (err) {
    console.error("Error loading article:", err);
    error.value = `Не удалось загрузить статью для категории "${slug}"`;
  } finally {
    loading.value = false;
  }
};
const loadCurrentArticle = () => {
  const category = categories.value.find((c) => c.id === activeCategory.value);
  if (category) {
    loadArticleForCategory(category.slug);
  }
};

const selectCategory = async (categoryId: string) => {
  if (categoryId === activeCategory.value) return;

  const oldIndex = categories.value.findIndex(
    (c) => c.id === activeCategory.value,
  );
  const newIndex = categories.value.findIndex((c) => c.id === categoryId);

  transitionName.value = newIndex > oldIndex ? "slide-left" : "slide-right";

  activeCategory.value = categoryId;

  if (!articlesMap.value.has(categoryId)) {
    const category = categories.value.find((c) => c.id === categoryId);
    if (category) {
      await loadArticleForCategory(category.slug);
    }
  }

  localStorage.setItem("about_active_category", categoryId);
};

onMounted(async () => {
  const savedCategory = localStorage.getItem("about_active_category");

  await loadCategories();

  if (savedCategory && categories.value.some((c) => c.id === savedCategory)) {
    await selectCategory(savedCategory);
  }
});
</script>

<style scoped>
.categories-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(auto, max-content));
  justify-content: center;
  gap: 0.75rem;
  max-width: 100%;
  margin: 0 auto;
}

.category-button {
  transition: all 0.3s ease;
  min-width: fit-content;
}

@media (max-width: 480px) {
  .categories-grid {
    gap: 0.5rem;
  }
  .category-button {
    padding-left: 1rem;
    padding-right: 1rem;
    font-size: 0.875rem;
  }
}

.fade-slide-enter-active,
.fade-slide-leave-active {
  transition: all 0.3s ease;
}

.fade-slide-enter-from {
  opacity: 0;
  transform: translateY(-20px);
}

.fade-slide-leave-to {
  opacity: 0;
  transform: translateY(20px);
}

.slide-left-enter-active,
.slide-left-leave-active {
  transition: all 0.3s ease;
}

.slide-left-enter-from {
  opacity: 0;
  transform: translateX(50px);
}

.slide-left-leave-to {
  opacity: 0;
  transform: translateX(-50px);
}

.slide-right-enter-active,
.slide-right-leave-active {
  transition: all 0.3s ease;
}

.slide-right-enter-from {
  opacity: 0;
  transform: translateX(-50px);
}

.slide-right-leave-to {
  opacity: 0;
  transform: translateX(50px);
}

.prose {
  color: rgba(255, 255, 255, 0.8);
}

.prose :deep(h2) {
  color: white;
  margin-top: 0;
}

.prose :deep(p) {
  line-height: 1.8;
  margin-bottom: 1rem;
}

.prose :deep(img) {
  border-radius: 0.5rem;
  margin: 1.5rem 0;
  max-width: 100%;
}

.prose :deep(blockquote) {
  border-left: 4px solid rgba(59, 130, 246, 0.5);
  padding-left: 1rem;
  font-style: italic;
  color: rgba(255, 255, 255, 0.7);
}

@media (max-width: 640px) {
  .container {
    padding-left: 1rem;
    padding-right: 1rem;
  }
  h1 {
    font-size: 2.5rem;
  }
  .prose {
    font-size: 1rem;
  }
}
</style>