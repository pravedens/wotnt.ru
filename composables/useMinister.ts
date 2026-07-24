// composables/useMinister.ts

import { useApi } from '~/composables/useApi'
import type {
  Minister,
  MinisterCategory,
  SocialLink,
  MinistersResponse,
  MinisterResponse,
  CategoriesResponse,
  SocialLinksResponse,
  FieldVisibilitiesResponse,
  MyCategoriesResponse,
  MinisterMessagesResponse,
  MinisterUnreadCountResponse,
  MinisterNotificationSettingsResponse,
  SendMessageToMinisterData
} from '~/types/minister'

export const useMinister = () => {
    const { $api } = useApi(); 
    
    const getMinisters = async (): Promise<Minister[]> => {
        const response = await $api<MinistersResponse>('/ministers');
        return response.ministers || [];
    };
    
    const getMinisterById = async (id: number): Promise<Minister> => {
        const response = await $api<MinisterResponse>(`/ministers/${id}`);
        return response.minister;
    };
    
    const getAllCategories = async (): Promise<MinisterCategory[]> => {
        const response = await $api<CategoriesResponse>('/ministers/categories');
        return response.categories || [];
    };
    
    const getMinistersByCategory = async (slug: string): Promise<any> => {
        const response = await $api<any>(`/ministers/category/${slug}`);
        return response;
    };
    
    const getSocialLinks = async (): Promise<SocialLink[]> => {
        const response = await $api<SocialLinksResponse>('/user/social-links');
        return response.social_links || [];
    };
    
    const updateSocialLinks = async (socialLinks: SocialLink[]): Promise<any> => {
        return await $api('/user/social-links', {
            method: 'PUT',
            body: { social_links: socialLinks }
        });
    };
    
    const getFieldVisibilities = async (): Promise<Record<string, boolean>> => {
        const response = await $api<FieldVisibilitiesResponse>('/user/field-visibilities');
        return response.visibilities || {};
    };
    
    const updateFieldVisibilities = async (visibilities: Record<string, boolean>): Promise<any> => {
        return await $api('/user/field-visibilities', {
            method: 'PUT',
            body: { visibilities }
        });
    };
    
    const getMyCategories = async (): Promise<MyCategoriesResponse> => {
        const response = await $api<MyCategoriesResponse>('/user/minister-categories');
        return response;
    };
    
    const updateMyCategories = async (categoryIds: number[]): Promise<any> => {
        return await $api('/user/minister-categories', {
            method: 'PUT',
            body: { category_ids: categoryIds }
        });
    };
    
    // ============ СООБЩЕНИЯ СЛУЖИТЕЛЯМ ============

    const sendMessageToMinister = async (ministerId: number, data: SendMessageToMinisterData): Promise<any> => {
        return await $api(`/ministers/${ministerId}/message`, {
            method: 'POST',
            body: data
        });
    };

    const getMyMessages = async (page = 1): Promise<MinisterMessagesResponse> => {
        const response = await $api<MinisterMessagesResponse>(`/my-messages?page=${page}`);
        return response;
    };

    const markMessageAsRead = async (messageId: number): Promise<any> => {
        return await $api(`/my-messages/${messageId}/read`, {
            method: 'PUT'
        });
    };

    const getUnreadCount = async (): Promise<number> => {
        const response = await $api<MinisterUnreadCountResponse>('/my-messages/unread-count');
        return response.count || 0;
    };

    const getMinisterNotificationSettings = async (): Promise<{ email: boolean; webpush: boolean }> => {
        const response = await $api<MinisterNotificationSettingsResponse>('/user/minister-notification-settings');
        return response.settings || { email: true, webpush: false };
    };

    const updateMinisterNotificationSettings = async (settings: { email: boolean; webpush: boolean }): Promise<any> => {
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