export const useTeacher = () => {
    const { $api, baseUrl } = useApi();
    
    // ✅ Добавляем интерфейсы для типизации ответов
    interface MessagesResponse {
        data: any[];
        pagination?: any;
        [key: string]: any;
    }
    
    interface UnreadCountResponse {
        count: number;
    }
    
    const sendMessageToTeacher = async (teacherId: number, data: {
        sender_name?: string;
        sender_email?: string;
        message: string;
        captcha_token?: string;
    }) => {
        // ✅ Исправлено: используем $api вместо жёсткой ссылки
        return await $api(`/bible-school/teachers/${teacherId}/message`, {
            method: 'POST',
            body: data
        });
    };
    
    const getMyTeacherMessages = async (page = 1) => {
        const response = await $api<MessagesResponse>(`/bible-school/teacher-messages?page=${page}`);
        return response;
    };
    
    const markTeacherMessageAsRead = async (messageId: number) => {
        return await $api(`/bible-school/teacher-messages/${messageId}/read`, {
            method: 'PUT'
        });
    };
    
    const getTeacherUnreadCount = async () => {
        const response = await $api<UnreadCountResponse>('/bible-school/teacher-messages/unread-count');
        return response.count || 0;
    };
    
    return {
        sendMessageToTeacher,
        getMyTeacherMessages,
        markTeacherMessageAsRead,
        getTeacherUnreadCount,
    };
};