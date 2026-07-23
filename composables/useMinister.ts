export const useMinister = () => {
    const { $api, baseUrl } = useApi();  // ✅ УЖЕ ЕСТЬ
    
    // Интерфейсы для типизации ответов
    interface MinistersResponse {
        ministers: any[];
    }
    
    interface MinisterResponse {
        minister: any;
    }
    
    interface CategoriesResponse {
        categories: any[];
    }
    
    interface SocialLinksResponse {
        social_links: any[];
    }
    
    interface FieldVisibilitiesResponse {
        visibilities: Record<string, boolean>;
    }
    
    interface MyCategoriesResponse {
        categories: any[];
        minister_categories?: any[];
    }
    
    interface MessagesResponse {
        data: any[];
        pagination?: any;
        [key: string]: any;
    }
    
    interface UnreadCountResponse {
        count: number;
    }
    
    interface NotificationSettingsResponse {
        settings: { email: boolean; webpush: boolean };
    }
    
    // ✅ Исправлено: используем $api вместо $fetch с baseURL
    const getMinisters = async () => {
        const response = await $api<MinistersResponse>('/ministers');
        return response.ministers || [];
    };
    
    const getMinisterById = async (id: number) => {
        const response = await $api<MinisterResponse>(`/ministers/${id}`);
        return response.minister;
    };
    
    const getAllCategories = async () => {
        const response = await $api<CategoriesResponse>('/ministers/categories');
        return response.categories || [];
    };
    
    const getMinistersByCategory = async (slug: string) => {
        const response = await $api<any>(`/ministers/category/${slug}`);
        return response;
    };
    
    const getSocialLinks = async () => {
        const response = await $api<SocialLinksResponse>('/user/social-links');
        return response.social_links || [];
    };
    
    const updateSocialLinks = async (socialLinks: any[]) => {
        return await $api('/user/social-links', {
            method: 'PUT',
            body: { social_links: socialLinks }
        });
    };
    
    const getFieldVisibilities = async () => {
        const response = await $api<FieldVisibilitiesResponse>('/user/field-visibilities');
        return response.visibilities || {};
    };
    
    const updateFieldVisibilities = async (visibilities: Record<string, boolean>) => {
        return await $api('/user/field-visibilities', {
            method: 'PUT',
            body: { visibilities }
        });
    };
    
    const getMyCategories = async () => {
        const response = await $api<MyCategoriesResponse>('/user/minister-categories');
        return response;
    };
    
    const updateMyCategories = async (categoryIds: number[]) => {
        return await $api('/user/minister-categories', {
            method: 'PUT',
            body: { category_ids: categoryIds }
        });
    };
    
    // ============ СООБЩЕНИЯ СЛУЖИТЕЛЯМ ============

    const sendMessageToMinister = async (ministerId: number, data: {
        sender_name?: string;
        sender_email?: string;
        message: string;
        captcha_token?: string;
    }) => {
        // ✅ УЖЕ ИСПОЛЬЗУЕТ $api
        return await $api(`/ministers/${ministerId}/message`, {
            method: 'POST',
            body: data
        });
    };

    const getMyMessages = async (page = 1) => {
        const response = await $api<MessagesResponse>(`/my-messages?page=${page}`);
        return response;
    };

    const markMessageAsRead = async (messageId: number) => {
        return await $api(`/my-messages/${messageId}/read`, {
            method: 'PUT'
        });
    };

    const getUnreadCount = async () => {
        const response = await $api<UnreadCountResponse>('/my-messages/unread-count');
        return response.count || 0;
    };

    const getMinisterNotificationSettings = async () => {
        const response = await $api<NotificationSettingsResponse>('/user/minister-notification-settings');
        return response.settings || { email: true, webpush: false };
    };

    const updateMinisterNotificationSettings = async (settings: { email: boolean; webpush: boolean }) => {
        return await $api('/user/minister-notification-settings', {
            method: 'PUT',
            body: { settings }
        });
    };
    
    return {
        getMinisters,
        getMinisterById,
        getAllCategories,
        getMinistersByCategory,
        getSocialLinks,
        updateSocialLinks,
        getFieldVisibilities,
        updateFieldVisibilities,
        getMyCategories,
        updateMyCategories,
        sendMessageToMinister,
        getMyMessages,
        markMessageAsRead,
        getUnreadCount,
        getMinisterNotificationSettings,
        updateMinisterNotificationSettings,
    };
};