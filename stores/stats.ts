import { defineStore } from "pinia";
import { useApi } from "~/composables/useApi";

interface PostStats {
  views_count: number;
  likes_count: number;
  liked: boolean;
  viewed_today?: boolean;
}

export const useStatsStore = defineStore("stats", {
  state: () => ({
    postsStats: {} as Record<number, PostStats>,
    loadingStates: {} as Record<number, boolean>,
    fetchingInProgress: new Set<number>(),
  }),

  getters: {
    getPostStats: (state) => (postId: number) => {
      return (
        state.postsStats[postId] || {
          views_count: 0,
          likes_count: 0,
          liked: false,
        }
      );
    },
    isLoading: (state) => (postId: number) => {
      return state.loadingStates[postId] || false;
    },
    isLiked: (state) => (postId: number) => {
      return state.postsStats[postId]?.liked || false;
    },
    getLikesCount: (state) => (postId: number) => {
      return state.postsStats[postId]?.likes_count || 0;
    },
    getViewsCount: (state) => (postId: number) => {
      return state.postsStats[postId]?.views_count || 0;
    },
  },

  actions: {
    updatePostStats(postId: number, data: Partial<PostStats>) {
      if (!this.postsStats[postId]) {
        this.postsStats[postId] = {
          views_count: 0,
          likes_count: 0,
          liked: false,
        };
      }
      Object.assign(this.postsStats[postId], data);
    },

    setLoading(postId: number, isLoading: boolean) {
      this.loadingStates[postId] = isLoading;
    },

    async fetchPostStats(postId: number) {
      if (this.fetchingInProgress.has(postId)) return;

      this.fetchingInProgress.add(postId);
      this.setLoading(postId, true);

      try {
        const { $api } = useApi();
        const response = await $api(`/posts/${postId}/stats`);

        if (response) {
          this.updatePostStats(postId, {
            views_count: response.views_count,
            likes_count: response.likes_count,
            liked: response.liked,
            viewed_today: response.viewed_today,
          });
        }
        return response;
      } catch (err) {
        console.error("Error fetching stats:", err);
      } finally {
        this.fetchingInProgress.delete(postId);
        this.setLoading(postId, false);
      }
    },

    async toggleLike(postId: number) {
      this.setLoading(postId, true);

      try {
        const { $api } = useApi();
        const response = await $api(`/posts/${postId}/like`, {
          method: "POST",
        });

        if (response) {
          this.updatePostStats(postId, {
            liked: response.liked,
            likes_count: response.likes_count,
            views_count: response.views_count,
          });
        }

        return response;
      } catch (err) {
        console.error("Error toggling like:", err);
        throw err;
      } finally {
        this.setLoading(postId, false);
      }
    },

    async trackView(postId: number) {
      try {
        const { $api } = useApi();
        const response = await $api(`/posts/${postId}/view`, {
          method: "POST",
        });

        if (response) {
          this.updatePostStats(postId, {
            views_count: response.views_count,
            likes_count: response.likes_count,
            liked: response.liked,
          });
        }

        return response;
      } catch (err) {
        console.error("Error tracking view:", err);
      }
    },

    async fetchMultipleStats(postIds: number[]) {
      if (!postIds.length) return;

      const uniqueIds = [...new Set(postIds)];

      // ✅ Проверяем кеш перед запросом
      const uncachedIds = uniqueIds.filter((id) => !this.postsStats[id]);

      if (!uncachedIds.length) {
        console.log("📦 Stats already cached");
        return;
      }

      try {
        const { $api } = useApi();
        const response = await $api<Record<number, PostStats>>(
          "/posts/stats/bulk",
          {
            method: "POST",
            body: { ids: uncachedIds },
          },
        );

        if (response) {
          Object.entries(response).forEach(([id, stats]) => {
            this.updatePostStats(Number(id), stats);
          });
        }
      } catch (err) {
        console.error("Error fetching bulk stats:", err);
      }
    },
  },
});
