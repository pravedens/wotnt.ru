export const useMinister = () => {
    const { $api } = useApi();
    
    const getMinisters = async () => {
        const response = await $fetch('/api/ministers', {
            baseURL: 'https://wotgospel.ru',
            headers: { 'Accept': 'application/json' }
        });
        return response.ministers || [];
    };
    
    const getMinisterById = async (id: number) => {
        const response = await $fetch(`/api/ministers/${id}`, {
            baseURL: 'https://wotgospel.ru',
            headers: { 'Accept': 'application/json' }
        });
        return response.minister;
    };
    
    const getAllCategories = async () => {
        const response = await $fetch('/api/ministers/categories', {
            baseURL: 'https://wotgospel.ru',
            headers: { 'Accept': 'application/json' }
        });
        return response.categories || [];
    };
    
    const getMinistersByCategory = async (slug: string) => {
        const response = await $fetch(`/api/ministers/category/${slug}`, {
            baseURL: 'https://wotgospel.ru',
            headers: { 'Accept': 'application/json' }
        });
        return response;
    };
    
    const getSocialLinks = async () => {
        const response = await $api('/user/social-links');
        return response.social_links || [];
    };
    
    const updateSocialLinks = async (socialLinks: any[]) => {
        return await $api('/user/social-links', {
            method: 'PUT',
            body: { social_links: socialLinks }
        });
    };
    
    const getFieldVisibilities = async () => {
        const response = await $api('/user/field-visibilities');
        return response.visibilities || {};
    };
    
    const updateFieldVisibilities = async (visibilities: Record<string, boolean>) => {
        return await $api('/user/field-visibilities', {
            method: 'PUT',
            body: { visibilities }
        });
    };
    
    const getMyCategories = async () => {
        const response = await $api('/user/minister-categories');
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
    return await $fetch(`/api/ministers/${ministerId}/message`, {
        method: 'POST',
        baseURL: 'https://wotgospel.ru',
        body: data
    });
};

const getMyMessages = async (page = 1) => {
    const response = await $api(`/my-messages?page=${page}`);
    return response;
};

const markMessageAsRead = async (messageId: number) => {
    return await $api(`/my-messages/${messageId}/read`, {
        method: 'PUT'
    });
};

const getUnreadCount = async () => {
    const response = await $api('/my-messages/unread-count');
    return response.count || 0;
};

const getMinisterNotificationSettings = async () => {
    const response = await $api('/user/minister-notification-settings');
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