export const useTeacherPanel = () => {
    const { $api } = useApi();
    
    // Получение дашборда учителя
    const getDashboard = async () => {
        return await $api('/bible-school/teacher/dashboard');
    };
    
    // Одобрить заявку на обучение
    const approveEnrollmentRequest = async (requestId) => {
        return await $api(`/bible-school/enrollment-requests/${requestId}/approve`, {
            method: 'POST'
        });
    };
    
    // Отклонить заявку на обучение
    const rejectEnrollmentRequest = async (requestId) => {
        return await $api(`/bible-school/enrollment-requests/${requestId}/reject`, {
            method: 'POST'
        });
    };
    
    // Получить эссе для проверки
    const getEssay = async (essayId) => {
        return await $api(`/bible-school/my/essays/${essayId}`);
    };
    
    // Отправить проверку эссе
    const reviewEssay = async (essayId, data) => {
        return await $api(`/bible-school/essays/${essayId}/review`, {
            method: 'POST',
            body: data
        });
    };
    
    // Обновить роль студента
    const updateStudentRole = async (userId, role) => {
        return await $api(`/bible-school/teacher/students/${userId}/role`, {
            method: 'PUT',
            body: { role }
        });
    };
    
    // Отправить сообщение студенту
    const sendMessageToStudent = async (studentId, message) => {
        return await $api(`/bible-school/teacher/students/${studentId}/message`, {
            method: 'POST',
            body: { message }
        });
    };
    
    return {
        getDashboard,
        approveEnrollmentRequest,
        rejectEnrollmentRequest,
        getEssay,
        reviewEssay,
        updateStudentRole,
        sendMessageToStudent,
    };
};