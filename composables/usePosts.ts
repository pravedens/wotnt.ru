import type {
  Post,
  PostFilters,
  Category,
  Group,
  Conference,
} from "~/types/sermon";
import type { PaginatedResponse } from "~/types/api";
import { useApi } from "~/composables/useApi";
import { useRouter, useRoute } from "vue-router"; // ✅ Добавляем импорт

export const usePosts = () => {
  const { $api } = useApi();
  const router = useRouter();
  const route = useRoute();

  const posts = ref<Post[]>([]);
  const pagination = ref<Partial<PaginatedResponse<Post>>>({});
  const loading = ref(false);
  const error = ref<string | null>(null);

  const getFiltersFromURL = (): PostFilters => {
    if (import.meta.client) {
      const urlParams = new URLSearchParams(window.location.search);
      const page = urlParams.get("page");
      const category_id = urlParams.get("category_id");
      const group_id = urlParams.get("group_id");
      const conference_id = urlParams.get("conference_id");
      const search = urlParams.get("search");

      return {
        category_id: category_id ? Number(category_id) : null,
        group_id: group_id ? Number(group_id) : null,
        conference_id: conference_id ? Number(conference_id) : null,
        search: search || null,
        page: page ? Number(page) : 1,
        per_page: 8,
      };
    }
    return {
      category_id: null,
      group_id: null,
      conference_id: null,
      search: null,
      page: 1,
      per_page: 8,
    };
  };

  const filters = ref<PostFilters>({
    category_id: null,
    group_id: null,
    conference_id: null,
    search: null,
    page: 1,
    per_page: 8,
  });

  const categories = ref<Category[]>([]);
  const groups = ref<Group[]>([]);
  const conferences = ref<Conference[]>([]);

  // composables/usePosts.ts

  const loadFilterData = async () => {
    try {
      // ✅ ОДИН ЗАПРОС вместо трех
      const response = await $api<{
        categories: Category[];
        groups: Group[];
        conferences: Conference[];
      }>("/filters", {
        params: {
          category_id: filters.value.category_id || undefined,
          group_id: filters.value.group_id || undefined,
          conference_id: filters.value.conference_id || undefined,
        },
      });

      categories.value = response.categories || [];
      groups.value = response.groups || [];
      conferences.value = response.conferences || [];
    } catch (err) {
      console.error("Error loading filters:", err);
    }
  };
  // ✅ Функция для синхронизации URL с фильтрами
  const updateURL = () => {
    if (import.meta.client) {
      const query: Record<string, string> = {};

      if (filters.value.category_id) {
        query.category_id = String(filters.value.category_id);
      }
      if (filters.value.group_id) {
        query.group_id = String(filters.value.group_id);
      }
      if (filters.value.conference_id) {
        query.conference_id = String(filters.value.conference_id);
      }
      if (filters.value.search) {
        query.search = filters.value.search;
      }
      if (filters.value.page && filters.value.page > 1) {
        query.page = String(filters.value.page);
      }

      // Используем router.replace вместо window.history
      router.replace({ query });
    }
  };

  const loadPosts = async () => {
    loading.value = true;
    error.value = null;

    try {
      const params: Record<string, any> = {
        page: filters.value.page || 1,
        per_page: filters.value.per_page || 8,
      };

      if (filters.value.category_id) {
        params.category_id = filters.value.category_id;
      }
      if (filters.value.group_id) {
        params.group_id = filters.value.group_id;
      }
      if (filters.value.conference_id) {
        params.conference_id = filters.value.conference_id;
      }
      if (filters.value.search) {
        params.search = filters.value.search;
      }

      const response = await $api<PaginatedResponse<Post>>("/posts", {
        params,
      });

      if (response?.data && Array.isArray(response.data)) {
        posts.value = response.data;
        pagination.value = {
          current_page: response.current_page,
          last_page: response.last_page,
          total: response.total,
          per_page: response.per_page,
          first_page_url: response.first_page_url,
          last_page_url: response.last_page_url,
          next_page_url: response.next_page_url,
          prev_page_url: response.prev_page_url,
          links: response.links,
        };
      } else {
        console.warn("⚠️ Unexpected response format:", response);
        posts.value = [];
        pagination.value = {};
      }

      // ✅ Обновляем URL после загрузки
      updateURL();
    } catch (err: any) {
      console.error("❌ Error loading posts:", err);
      error.value = err.message || "Ошибка загрузки";
      posts.value = [];
    } finally {
      loading.value = false;
    }
  };

  // ✅ Исправленный setFilter
  const setFilter = (key: keyof PostFilters, value: any) => {
    // Обновляем фильтр
    filters.value[key] = value;

    // Если это не page, сбрасываем page на 1
    if (key !== "page") {
      filters.value.page = 1;
    }

    // Загружаем посты с новыми фильтрами
    loadPosts();
  };

  const resetFilters = () => {
    filters.value = {
      category_id: null,
      group_id: null,
      conference_id: null,
      search: null,
      page: 1,
      per_page: 8,
    };
    loadPosts();
  };

  const goToPage = async (page: number) => {
    filters.value.page = page;
    await loadPosts();
    if (import.meta.client) {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  return {
    posts,
    pagination,
    loading,
    error,
    filters,
    categories,
    groups,
    conferences,
    loadFilterData,
    loadPosts,
    setFilter,
    resetFilters,
    goToPage,
  };
};
