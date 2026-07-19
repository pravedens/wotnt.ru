export const useTeacher = () => {
    const { $api } = useApi();
    
    const sendMessageToTeacher = async (teacherId: number, data: {
        sender_name?: string;
        sender_email?: string;
        message: string;
        captcha_token?: string;
    }) => {
        // ✅ ИСПРАВЛЕНО: добавлен префикс /bible-school
        return await $fetch(`/api/bible-school/teachers/${teacherId}/message`, {
            method: 'POST',
            baseURL: 'https://wotgospel.ru',
            body: data
        });
    };
    
    const getMyTeacherMessages = async (page = 1) => {
        // ✅ ИСПРАВЛЕНО: добавлен префикс /bible-school
        const response = await $api(`/bible-school/teacher-messages?page=${page}`);
        return response;
    };
    
    const markTeacherMessageAsRead = async (messageId: number) => {
        // ✅ ИСПРАВЛЕНО: добавлен префикс /bible-school
        return await $api(`/bible-school/teacher-messages/${messageId}/read`, {
            method: 'PUT'
        });
    };
    
    const getTeacherUnreadCount = async () => {
        // ✅ ИСПРАВЛЕНО: добавлен префикс /bible-school
        const response = await $api('/bible-school/teacher-messages/unread-count');
        return response.count || 0;
    };
    
    return {
        sendMessageToTeacher,
        getMyTeacherMessages,
        markTeacherMessageAsRead,
        getTeacherUnreadCount,
    };
};